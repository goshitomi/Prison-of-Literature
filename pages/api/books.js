const API_KEY  = process.env.NLK_API_KEY;
const API_BASE = "https://apis.data.go.kr/1371029/BookInformationService/getbookList";

/* 한글 유니코드 범위 체크 */
function hasKorean(s) {
  return /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/.test(s || "");
}

/* DC_creator[]를 포함한 한국어 자료 판별 */
function isKoreanItem(item) {
  const title = item.DCTERMS_title || item.RDFS_label || "";
  if (hasKorean(title)) return true;

  /* DC_creator는 배열 — 저자 이름 중 하나라도 한글이면 포함 */
  const creators = Array.isArray(item.DC_creator) ? item.DC_creator : [item.DC_creator || ""];
  return creators.some(c => hasKorean(c || ""));
}

/* 도서 자료 판별 — ISBN이 있는 항목만 도서로 간주
   논문·신문·기사 등은 ISBN 없이 ISSN만 존재하거나 둘 다 없음 */
function isBookItem(item) {
  const isbn = item.BIBO_isbn;
  if (Array.isArray(isbn)) return isbn.some(v => v && String(v).trim().length > 0);
  return !!(isbn && String(isbn).trim().length > 0);
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");

  const {
    pageNo     = "1",
    numOfRows  = "30",
    q          = "",      /* 제목 텍스트 검색 */
    koreanOnly = "true",
  } = req.query;

  const requested = parseInt(numOfRows, 10);
  /* 한국어 필터가 켜져 있으면 충분한 결과를 얻기 위해 5배 fetch */
  const fetchRows = koreanOnly === "true"
    ? String(Math.min(requested * 5, 100))
    : String(requested);

  const params = new URLSearchParams({
    serviceKey: API_KEY,
    pageNo:     String(pageNo),
    numOfRows:  fetchRows,
    type:       "JSON",
  });

  /* NLK API title 파라미터로 서버 사이드 텍스트 검색 */
  if (q) params.set("title", q);

  try {
    const upstream = await fetch(`${API_BASE}?${params}`, {
      headers: { Accept: "application/json" },
    });

    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: `Upstream HTTP ${upstream.status}` });
    }

    const text = await upstream.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(502).json({ error: "Upstream JSON parse failed" });
    }

    /* 오류 코드 체크 */
    if (data?.header?.resultCode && data.header.resultCode !== "00") {
      return res.status(502).json({ error: data.header.resultMsg || "NLK API error" });
    }

    /* 도서 + 한국어 필터 적용 */
    if (Array.isArray(data?.body?.items)) {
      let items = data.body.items.filter(isBookItem);
      if (koreanOnly === "true") items = items.filter(isKoreanItem);
      data.body.items = items.slice(0, requested);
    }

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
