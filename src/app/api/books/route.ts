import { NextRequest, NextResponse } from "next/server";
import { fetchIsbnBooks } from "@/shared/lib/nlk-api";
import { searchGoogleBooks } from "@/shared/lib/google-books-api";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q        = searchParams.get("q")?.trim() || "";
  const accPage  = searchParams.get("accPage");

  try {
    /* ── 검색 모드: Google Books ── */
    if (q) {
      const maxResults = parseInt(searchParams.get("numOfRows") || "30", 10);
      const result = await searchGoogleBooks(q, maxResults);
      return NextResponse.json(
        { items: result.items, totalCount: result.totalCount, hasMore: false },
        { headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=600" } },
      );
    }

    /* ── 무한 스크롤 브라우징 모드: ISBN 있는 NLK 한국 단행본 ── */
    const page   = parseInt(accPage ?? "0", 10);
    const result = await fetchIsbnBooks(page);
    return NextResponse.json(
      { items: result.items, hasMore: result.hasMore },
      { headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=600" } },
    );
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
