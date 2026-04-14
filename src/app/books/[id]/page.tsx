import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchNLKBookById } from "@/shared/lib/nlk-api";
import { fetchGoogleBookById } from "@/shared/lib/google-books-api";
import { ST } from "@/shared/lib/helpers";
import { FONT, MUTED, ROW_BORDER, ACCENT } from "@/shared/config/design-tokens";
import type { Book } from "@/entities/book/model/types";

/* ── ISR: 24시간마다 재검증 ── */
export const revalidate = 86400;

interface PageProps {
  params: { id: string };
}

/* id 인코딩 규칙:
   nlk-{BIBLIO_ID}   → NLK API 조회
   gb-{volumeId}     → Google Books API 조회
*/
async function fetchBook(rawId: string): Promise<Book | null> {
  if (rawId.startsWith("nlk-")) {
    return fetchNLKBookById(rawId.slice(4));
  }
  if (rawId.startsWith("gb-")) {
    return fetchGoogleBookById(rawId.slice(3));
  }
  /* 접두사 없는 경우 NLK로 시도 */
  return fetchNLKBookById(rawId);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const book = await fetchBook(decodeURIComponent(params.id));
  if (!book) {
    return { title: "수감자 미확인 — Prison of Literature" };
  }
  return {
    title:       `${book.title} — Prison of Literature`,
    description: book.abstract
      ? book.abstract.slice(0, 160)
      : `${book.title} by ${book.creator || "작자미상"} (${book.year || "연도 미상"}) — Prison of Literature 수감 기록`,
    openGraph: {
      title:       book.title,
      description: book.abstract?.slice(0, 160) || `저자: ${book.creator || "—"}`,
      type:        "book",
    },
  };
}

/* ── JSON-LD 구조화 데이터 ── */
function BookJsonLd({ book }: { book: Book }) {
  const jsonLd = {
    "@context":    "https://schema.org",
    "@type":       "Book",
    name:          book.title,
    author:        book.creator
      ? { "@type": "Person", name: book.creator }
      : undefined,
    datePublished: book.year || undefined,
    isbn:          book.isbn || undefined,
    description:   book.abstract || undefined,
    inLanguage:    "ko",
    publisher:     book.pubPlace
      ? { "@type": "Organization", name: book.pubPlace }
      : undefined,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default async function BookDetailPage({ params }: PageProps) {
  const book = await fetchBook(decodeURIComponent(params.id));
  if (!book) notFound();

  const st = ST[book.status];

  const metaRows: [string, string][] = [
    ["수인번호 / Call No.", book.callNo   || "—"],
    ["ISBN",               book.isbn     || "—"],
    ["저자 / Author",      book.creator  || "—"],
    ["발행연도",           book.year     || "—"],
    ["판형",               book.prisonSize || "—"],
    ["페이지수",           book.pages    || "—"],
    ["발행지",             book.pubPlace || "—"],
    ["소장위치",           book.holding  || "—"],
    ["자료분류",           book.charges  || "—"],
    ["키워드",             book.keyword  || "—"],
  ];

  return (
    <>
      <BookJsonLd book={book} />

      <main style={{ padding: "24px 24px 64px", fontFamily: FONT, maxWidth: 860, margin: "0 auto" }}>
        {/* ── 뒤로 가기 ── */}
        <div style={{ marginBottom: 24 }}>
          <Link
            href="/"
            style={{
              fontFamily:  FONT,
              fontSize:    11,
              color:       MUTED,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            ← 수감자 명부
          </Link>
        </div>

        {/* ── 헤더 영역 ── */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* 제목 */}
            <h1
              style={{
                fontFamily:  FONT,
                fontSize:    "clamp(18px, 3vw, 28px)",
                fontWeight:  "bold",
                lineHeight:  1.3,
                color:       "#000",
                marginBottom: 8,
              }}
            >
              {book.title}
            </h1>

            {/* 저자 */}
            {book.creator && (
              <div style={{ fontSize: 14, color: MUTED, marginBottom: 12 }}>
                {book.creator}
              </div>
            )}

            {/* 접견상태 뱃지 */}
            {st && (
              <span
                style={{
                  display:    "inline-block",
                  fontSize:   10,
                  fontFamily: FONT,
                  fontWeight: 600,
                  padding:    "2px 7px",
                  background: st.bg,
                  color:      st.c,
                  border:     `1px solid ${st.c}33`,
                }}
              >
                {st.ko}
              </span>
            )}

            {book.returnDate && (
              <div style={{ marginTop: 6, fontSize: 11, color: MUTED }}>
                반납예정 {book.returnDate} · 방문자 {book.visitor}
              </div>
            )}
          </div>
        </div>

        {/* ── 구분선 ── */}
        <div style={{ borderTop: "2px solid #000", marginBottom: 0 }} />

        {/* ── 서지 그리드 ── */}
        <div
          style={{
            display:             "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap:                 "1px 32px",
            fontFamily:          FONT,
            fontSize:            12,
          }}
        >
          {metaRows.map(([k, v]) => (
            <div
              key={k}
              style={{
                display:      "flex",
                gap:          8,
                padding:      "5px 0",
                borderBottom: `1px solid ${ROW_BORDER}`,
              }}
            >
              <span style={{ color: MUTED, minWidth: 130, flexShrink: 0 }}>{k}</span>
              <span
                style={{
                  color:     "#111",
                  wordBreak: "break-word",
                  fontFamily: k.includes("Call No.") || k === "ISBN"
                    ? '"Courier New", "Apple SD Gothic Neo", monospace'
                    : FONT,
                }}
              >
                {v}
              </span>
            </div>
          ))}
        </div>

        {/* ── 초록/설명 ── */}
        {book.abstract && (
          <div
            style={{
              marginTop:  24,
              fontSize:   13,
              color:      "#444",
              lineHeight: 1.8,
              borderTop:  `1px solid ${ROW_BORDER}`,
              paddingTop: 16,
            }}
          >
            <div
              style={{ fontSize: 10, letterSpacing: "0.25em", textTransform: "uppercase", color: MUTED, marginBottom: 10 }}
            >
              Abstract / 초록
            </div>
            {book.abstract}
          </div>
        )}

        {/* ── 하단 CTA ── */}
        <div
          style={{
            marginTop:  40,
            paddingTop: 20,
            borderTop:  `1px solid ${ROW_BORDER}`,
            display:    "flex",
            gap:        16,
          }}
        >
          <Link
            href="/"
            style={{
              fontFamily:  FONT,
              fontSize:    12,
              color:       ACCENT,
              letterSpacing: "0.05em",
            }}
          >
            ← 명부로 돌아가기
          </Link>
        </div>
      </main>
    </>
  );
}
