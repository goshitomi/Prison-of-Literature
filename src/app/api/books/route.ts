import { NextRequest, NextResponse } from "next/server";
import { fetchKoreanBooks, fetchNLKPage } from "@/shared/lib/nlk-api";
import { searchGoogleBooks } from "@/shared/lib/google-books-api";
import { parseBook } from "@/entities/book/model/parse";
import type { NLKRawItem } from "@/entities/book/model/types";

const NON_BOOK_TYPES = [
  "bibo/Thesis", "bibo/Article", "bibo/AcademicArticle",
  "bibo/LegalDocument", "bibo/Periodical", "bibo/Journal",
  "bibo/Newspaper", "bibo/Issue",
];

function isBookItem(item: NLKRawItem): boolean {
  if (item.BIBO_degree) return false;
  const types: string[] = Array.isArray(item.RDF_type)
    ? item.RDF_type as string[]
    : item.RDF_type ? [item.RDF_type as string] : [];
  if (types.some((t) => NON_BOOK_TYPES.some((nb) => String(t).includes(nb)))) return false;
  if (!types.some((t) => String(t).includes("Book"))) return false;
  return true;
}

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const pageNo     = parseInt(searchParams.get("pageNo")     || "1", 10);
  const numOfRows  = parseInt(searchParams.get("numOfRows")  || "30", 10);
  const koreanOnly = searchParams.get("koreanOnly") !== "false";
  const q          = searchParams.get("q")?.trim() || "";

  try {
    /* ── 검색 모드: Google Books ── */
    if (q) {
      const result = await searchGoogleBooks(q, numOfRows);
      return NextResponse.json(
        {
          header: { resultCode: "00", resultMsg: "NORMAL_CODE" },
          body:   { totalCount: result.totalCount, pageNo, numOfRows, items: result.items },
        },
        {
          headers: {
            "Cache-Control": "s-maxage=300, stale-while-revalidate=600",
          },
        },
      );
    }

    /* ── 한국 단행본 브라우징 모드 ── */
    if (koreanOnly) {
      const result = await fetchKoreanBooks(pageNo, numOfRows);
      return NextResponse.json(
        {
          header: { resultCode: "00", resultMsg: "NORMAL_CODE" },
          body:   { totalCount: result.totalCount, pageNo, numOfRows, items: result.items },
        },
        {
          headers: {
            "Cache-Control": "s-maxage=300, stale-while-revalidate=600",
          },
        },
      );
    }

    /* ── 단순 단일 페이지 모드 ── */
    const { items, totalCount } = await fetchNLKPage(pageNo);
    const filtered = items.filter(isBookItem).slice(0, numOfRows).map(parseBook);
    return NextResponse.json(
      {
        header: { resultCode: "00", resultMsg: "NORMAL_CODE" },
        body:   { totalCount, pageNo, numOfRows, items: filtered },
      },
      {
        headers: {
          "Cache-Control": "s-maxage=300, stale-while-revalidate=600",
        },
      },
    );
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
