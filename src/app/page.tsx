import type { Metadata } from "next";
import { fetchKoreanBooks } from "@/shared/lib/nlk-api";
import { searchGoogleBooks } from "@/shared/lib/google-books-api";
import { BooksPageClient } from "./_components/books-page-client";

interface PageProps {
  searchParams: { q?: string; page?: string };
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const q = searchParams.q?.trim();
  if (q) {
    return {
      title:       `"${q}" 검색 결과 — Prison of Literature`,
      description: `국립중앙도서관 도서 아카이브에서 "${q}"를 검색한 결과입니다.`,
    };
  }
  return {
    title:       "Prison of Literature — 수감자 명부",
    description: "국립중앙도서관 소장 도서를 교도소 수감자 명부 형식으로 열람하는 아카이브.",
  };
}

export default async function BooksPage({ searchParams }: PageProps) {
  const q    = searchParams.q?.trim() || "";
  const page = Math.max(1, parseInt(searchParams.page || "1", 10));

  /* ── 서버사이드 초기 데이터 패치 (SSR) ── */
  const initialData = q
    ? await searchGoogleBooks(q, 30)
    : await fetchKoreanBooks(page, 30);

  return (
    <BooksPageClient
      initialBooks={initialData.items}
      initialTotal={initialData.totalCount}
      initialPage={page}
      initialQ={q}
    />
  );
}
