import { NextRequest, NextResponse } from "next/server";
import { fetchNLKBookById } from "@/shared/lib/nlk-api";
import { fetchGoogleBookById } from "@/shared/lib/google-books-api";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const rawId = decodeURIComponent(params.id);

  try {
    let book = null;

    if (rawId.startsWith("gb-")) {
      book = await fetchGoogleBookById(rawId.slice(3));
    } else {
      /* NLK 조회 (nlk- 접두사 있거나 없거나) */
      const biblioId = rawId.startsWith("nlk-") ? rawId.slice(4) : rawId;
      book = await fetchNLKBookById(biblioId);
    }

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    return NextResponse.json(book, {
      headers: {
        "Cache-Control": "s-maxage=86400, stale-while-revalidate=3600",
      },
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
