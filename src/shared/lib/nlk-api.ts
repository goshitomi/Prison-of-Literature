import { simStatus, simClass, simReturn, simVisitor, simCharges } from "./helpers";
import { parseBook } from "@/entities/book/model/parse";
import type { Book, NLKRawItem } from "@/entities/book/model/types";

const API_KEY  = process.env.NLK_API_KEY;
const API_BASE = "https://apis.data.go.kr/1371029/BookInformationService/getbookList";

export const NLK_PAGE_SIZE  = 20;
export const KOR_MONO_START = 120_000;

function hasKorean(s: string): boolean {
  return /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/.test(s || "");
}

function isKoreanItem(item: NLKRawItem): boolean {
  const title = item.DCTERMS_title || item.RDFS_label || "";
  if (hasKorean(title)) return true;
  const creators = Array.isArray(item.DC_creator) ? item.DC_creator : [item.DC_creator || ""];
  return creators.some((c) => hasKorean(c || ""));
}

const NON_BOOK_TYPES = [
  "bibo/Thesis", "bibo/Article", "bibo/AcademicArticle",
  "bibo/LegalDocument", "bibo/Periodical", "bibo/Journal",
  "bibo/Newspaper", "bibo/Issue",
];

function isBookItem(item: NLKRawItem): boolean {
  if (item.BIBO_degree) return false;
  const types: string[] = Array.isArray(item.RDF_type)
    ? item.RDF_type
    : item.RDF_type ? [item.RDF_type] : [];
  if (types.some((t) => NON_BOOK_TYPES.some((nb) => String(t).includes(nb)))) return false;
  if (!types.some((t) => String(t).includes("Book"))) return false;
  return true;
}

export async function fetchNLKPage(apiPage: number): Promise<{ items: NLKRawItem[]; totalCount: number }> {
  const params = new URLSearchParams({
    serviceKey: API_KEY || "",
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

/* 무한 스크롤용: ISBN 있는 책만 반환 (accumulation page 기반) */
const FETCH_PAGES_PER_ACC = 4; // accPage당 NLK API 4페이지 (80 raw → ~30-50 ISBN 책)

export async function fetchIsbnBooks(
  accPage: number,
): Promise<{ items: Book[]; hasMore: boolean }> {
  const baseApiPage = KOR_MONO_START + 1 + accPage * FETCH_PAGES_PER_ACC;
  const results = await Promise.all(
    Array.from({ length: FETCH_PAGES_PER_ACC }, (_, i) => fetchNLKPage(baseApiPage + i)),
  );

  const allRaw = results.flatMap((r) => r.items)
    .filter(isBookItem)
    .filter(isKoreanItem)
    .filter((item) => {
      const isbn = Array.isArray(item.BIBO_isbn) ? item.BIBO_isbn[0] : item.BIBO_isbn;
      return Boolean(isbn);
    });

  return {
    items:   allRaw.slice(0, 30).map(parseBook),
    hasMore: results.some((r) => r.items.length > 0),
  };
}

export async function fetchNLKBookById(biblioId: string): Promise<Book | null> {
  /* BIBLIO_ID 숫자 부분으로 페이지 추정 (KMO 구간 기준) */
  const numStr = biblioId.replace(/\D/g, "");
  const numPart = parseInt(numStr.slice(-7) || "0", 10);
  const approxPage = KOR_MONO_START + Math.max(1, Math.floor(numPart / NLK_PAGE_SIZE));

  for (let offset = -3; offset <= 3; offset++) {
    const { items } = await fetchNLKPage(approxPage + offset);
    const found = items.find((item) => item.BIBLIO_ID === biblioId);
    if (found) return parseBook(found);
  }
  return null;
}

/* 서버사이드 parse helper (for compatibility) */
export { simStatus, simClass, simReturn, simVisitor, simCharges };
