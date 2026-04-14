import { simStatus, simClass, simReturn, simVisitor, simCharges } from "./helpers";
import type { Book } from "@/entities/book/model/types";

const GOOGLE_BOOKS_BASE = "https://www.googleapis.com/books/v1/volumes";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseGoogleBook(vol: any): Book {
  const id   = vol.id || "";
  const info = vol.volumeInfo || {};
  const isbns: Array<{ type: string; identifier: string }> = info.industryIdentifiers || [];
  const isbn  = (isbns.find((x) => x.type === "ISBN_13") || isbns.find((x) => x.type === "ISBN_10") || { identifier: "" }).identifier;
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

export async function searchGoogleBooks(
  q: string,
  maxResults = 30,
): Promise<{ items: Book[]; totalCount: number }> {
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

export async function fetchGoogleBookById(volumeId: string): Promise<Book | null> {
  try {
    const res = await fetch(`${GOOGLE_BOOKS_BASE}/${volumeId}`);
    if (!res.ok) return null;
    const vol = await res.json();
    return parseGoogleBook(vol);
  } catch {
    return null;
  }
}
