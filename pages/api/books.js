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

/* 도서 자료 판별 — RDF_type / BIBO_degree 기반
   BIBO_isbn은 구형 레코드에 null인 경우가 많아 신뢰 불가.
   실제 자료 유형은 RDF_type[] URI와 BIBO_degree 필드로 구분. */
const NON_BOOK_TYPES = [
  "bibo/Thesis",
  "bibo/Article",
  "bibo/AcademicArticle",
  "bibo/LegalDocument",
  "bibo/Periodical",
  "bibo/Journal",
  "bibo/Newspaper",
  "bibo/Issue",
];
function isBookItem(item) {
  // 학위논문: BIBO_degree 필드 존재 시 제외
  if (item.BIBO_degree) return false;

  // RDF_type 배열에 비도서 타입 URI가 포함되면 제외
  const types = Array.isArray(item.RDF_type)
    ? item.RDF_type
    : item.RDF_type ? [item.RDF_type] : [];
  if (types.some(t => NON_BOOK_TYPES.some(nb => String(t).includes(nb)))) return false;

  return true;
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

    /* 개발 전용: 원본 아이템 타입 분포 덤프 */
    if (req.query._debug === "types" && Array.isArray(data?.body?.items)) {
      return res.status(200).json({
        count: data.body.items.length,
        items: data.body.items.map(it => ({
          id:       it.BIBLIO_ID,
          title:    (it.DCTERMS_title || "").slice(0, 30),
          degree:   it.BIBO_degree || null,
          typeData: it.NLON_typeOfData || null,
          rdfTypes: (Array.isArray(it.RDF_type) ? it.RDF_type : [it.RDF_type]).map(t => String(t).split("/").pop()),
        })),
      });
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
