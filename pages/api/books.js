import { simStatus, simClass, simReturn, simVisitor, simCharges } from "../../lib/helpers.js";

const API_KEY  = process.env.NLK_API_KEY;
const API_BASE = "https://apis.data.go.kr/1371029/BookInformationService/getbookList";
const GOOGLE_BOOKS_BASE = "https://www.googleapis.com/books/v1/volumes";

/* NLK API 실제 제약
   - 페이지당 최대 20개 반환 (numOfRows 값 무시됨)
   - title/author 등 검색 파라미터 무시 — BIBLIO_ID 순 반환만 지원
   - 한국 오프라인 단행본(KMO/KJU)은 pageNo ≈ 120,000 구간부터 시작 (numOfRows=20 기준) */
const NLK_PAGE_SIZE    = 20;
const KOR_MONO_START   = 120_000; // 한국 단행본 구간 시작 페이지

/* 한글 유니코드 범위 체크 */
function hasKorean(s) {
  return /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/.test(s || "");
}

/* DC_creator[]를 포함한 한국어 자료 판별 */
function isKoreanItem(item) {
  const title = item.DCTERMS_title || item.RDFS_label || "";
  if (hasKorean(title)) return true;
  const creators = Array.isArray(item.DC_creator) ? item.DC_creator : [item.DC_creator || ""];
  return creators.some(c => hasKorean(c || ""));
}

/* 오프라인 도서 판별 — RDF_type / BIBO_degree 기반
   - BIBO_degree 있으면 학위논문 → 제외
   - RDF_type에 비도서 URI 있으면 제외
   - RDF_type에 Book URI 없으면 제외 (도서임이 명시되지 않은 경우) */
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
  if (item.BIBO_degree) return false;
  const types = Array.isArray(item.RDF_type)
    ? item.RDF_type
    : item.RDF_type ? [item.RDF_type] : [];
  if (types.some(t => NON_BOOK_TYPES.some(nb => String(t).includes(nb)))) return false;
  if (!types.some(t => String(t).includes("Book"))) return false;
  return true;
}

/* Google Books 단일 권 파싱 → parse() 반환 형식과 동일 */
function parseGoogleBook(vol) {
  const id   = vol.id || "";
  const info = vol.volumeInfo || {};
  const isbns = info.industryIdentifiers || [];
  const isbn  = (isbns.find(x => x.type === "ISBN_13") || isbns.find(x => x.type === "ISBN_10") || {}).identifier || "";
  const year  = (info.publishedDate || "").slice(0, 4);
  const st    = simStatus(id);
  const cl    = simClass(id);
  return {
    _parsed:        true,
    id,
    title:          info.title || "제목 없음",
    label:          "",
    creator:        (info.authors || []).join(", "),
    isbn,
    pubPlace:       "",
    pubDate:        year,
    year,
    callNo:         "",
    extent:         "",
    height:         "—",
    pages:          info.pageCount ? `${info.pageCount}p.` : "—",
    prisonSize:     "—",
    holding:        "",
    abstract:       info.description || "",
    genre:          (info.categories || []).join(", "),
    desc:           "",
    alt:            "",
    format:         "",
    keyword:        "",
    status:         st,
    classification: cl,
    charges:        simCharges(cl),
    returnDate:     st === "CHECKED_OUT" ? simReturn(id) : "",
    visitor:        st === "CHECKED_OUT" ? simVisitor(id) : "",
    coverUrl:       (info.imageLinks?.thumbnail || "").replace("http://", "https://"),
  };
}

async function searchGoogleBooks(q, maxResults = 30) {
  const params = new URLSearchParams({
    q,
    langRestrict: "ko",
    printType:    "books",
    maxResults:   String(maxResults),
  });
  try {
    const res = await fetch(`${GOOGLE_BOOKS_BASE}?${params}`);
    if (!res.ok) return { items: [], totalCount: 0 };
    const data = await res.json();
    return {
      items:      (data.items || []).map(parseGoogleBook),
      totalCount: data.totalItems || 0,
    };
  } catch {
    return { items: [], totalCount: 0 };
  }
}

/* NLK API 단일 페이지 fetch 헬퍼 */
async function fetchNLKPage(apiPage) {
  const params = new URLSearchParams({
    serviceKey: API_KEY,
    pageNo:     String(apiPage),
    numOfRows:  String(NLK_PAGE_SIZE),
    type:       "JSON",
  });
  try {
    const res = await fetch(`${API_BASE}?${params}`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return { items: [], totalCount: 0 };
    const data = JSON.parse(await res.text());
    return {
      items:      Array.isArray(data?.body?.items) ? data.body.items : [],
      totalCount: data?.body?.totalCount ?? 0,
    };
  } catch {
    return { items: [], totalCount: 0 };
  }
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");

  const {
    pageNo     = "1",
    numOfRows  = "30",
    koreanOnly = "true",
    q          = "",
  } = req.query;

  const requested = parseInt(numOfRows, 10);
  const userPage  = parseInt(pageNo, 10);

  try {
    if (q.trim()) {
      const result = await searchGoogleBooks(q.trim(), requested);
      return res.status(200).json({
        header: { resultCode: "00", resultMsg: "NORMAL_CODE" },
        body: { totalCount: result.totalCount, pageNo: userPage, numOfRows: requested, items: result.items },
      });
    }

    if (koreanOnly === "true") {
      /* 한국 오프라인 단행본 모드
         - KOR_MONO_START 오프셋 적용: 사용자 pageNo 1→API 120001
         - NLK 페이지당 20개 × 3페이지 병렬 fetch = 최대 60개 → 필터 후 30개 안정 확보
           (KMO 구간 한국어 도서 밀도 ~85%, 60 × 0.85 = 51 > 30) */
      const baseApiPage = (userPage - 1) * 3 + KOR_MONO_START + 1;
      const [r1, r2, r3] = await Promise.all([
        fetchNLKPage(baseApiPage),
        fetchNLKPage(baseApiPage + 1),
        fetchNLKPage(baseApiPage + 2),
      ]);

      const allItems = [...r1.items, ...r2.items, ...r3.items]
        .filter(isBookItem)
        .filter(isKoreanItem);

      return res.status(200).json({
        header: { resultCode: "00", resultMsg: "NORMAL_CODE" },
        body: {
          totalCount: r1.totalCount,
          pageNo:     userPage,
          numOfRows:  requested,
          items:      allItems.slice(0, requested),
        },
      });
    } else {
      /* 비-한국어 모드: 단순 단일 페이지 fetch */
      const { items, totalCount } = await fetchNLKPage(userPage);
      const filtered = items.filter(isBookItem).slice(0, requested);
      return res.status(200).json({
        header: { resultCode: "00", resultMsg: "NORMAL_CODE" },
        body: { totalCount, pageNo: userPage, numOfRows: requested, items: filtered },
      });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
