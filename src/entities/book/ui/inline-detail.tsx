"use client";

import { useState } from "react";
import Image from "next/image";
import { StatusBadge } from "@/shared/ui/status-badge";
import { FONT, MUTED, ROW_BORDER } from "@/shared/config/design-tokens";
import type { Book } from "@/entities/book/model/types";

interface InlineDetailProps {
  book: Book;
}

export function InlineDetail({ book }: InlineDetailProps) {
  const [imgError, setImgError] = useState(false);
  const coverSrc =
    book.coverUrl ||
    (book.isbn ? `https://covers.openlibrary.org/b/isbn/${book.isbn}-M.jpg` : null);
  const showCover = Boolean(coverSrc) && !imgError;

  const rows: [string, string][] = [
    ["수인번호 / Call No.", book.callNo  || "—"],
    ["ISBN",               book.isbn    || "—"],
    ["발행연도",           book.year    || "—"],
    ["판형",               book.prisonSize || "—"],
    ["페이지수",           book.pages   || "—"],
    ["발행지",             book.pubPlace || "—"],
    ["소장위치",           book.holding  || "—"],
    ["자료분류",           book.charges  || "—"],
    ["키워드",             book.keyword  || "—"],
  ];

  return (
    <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
      {showCover && coverSrc && (
        <div style={{ flexShrink: 0, width: 80, position: "relative" }}>
          <Image
            src={coverSrc}
            alt={book.title}
            width={80}
            height={112}
            style={{ display: "block", border: `1px solid ${ROW_BORDER}`, objectFit: "cover" }}
            onError={() => setImgError(true)}
            priority={false}
          />
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* 접견상태 */}
        <div
          style={{
            display:       "flex",
            alignItems:    "center",
            gap:           8,
            padding:       "2px 0 5px",
            borderBottom:  `1px solid ${ROW_BORDER}`,
            marginBottom:  2,
          }}
        >
          <span
            style={{ color: MUTED, fontSize: 12, fontFamily: FONT, minWidth: 110, flexShrink: 0 }}
          >
            접견상태
          </span>
          <StatusBadge status={book.status} />
          {book.returnDate && (
            <span style={{ color: MUTED, fontSize: 11, fontFamily: FONT }}>
              반납예정 {book.returnDate} · 방문자 {book.visitor}
            </span>
          )}
        </div>

        {/* 서지 그리드 */}
        <div
          style={{
            display:             "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap:                 "1px 24px",
            fontFamily:          FONT,
            fontSize:            12,
          }}
        >
          {rows.map(([k, v]) => (
            <div
              key={k}
              style={{
                display:      "flex",
                gap:          8,
                padding:      "2px 0",
                borderBottom: `1px solid ${ROW_BORDER}`,
              }}
            >
              <span style={{ color: MUTED, minWidth: 110, flexShrink: 0 }}>{k}</span>
              <span style={{ color: "#111", wordBreak: "break-word" }}>{v}</span>
            </div>
          ))}
        </div>

        {book.abstract && (
          <div
            style={{
              marginTop:  6,
              fontSize:   12,
              color:      "#444",
              lineHeight: 1.6,
              borderTop:  `1px solid ${ROW_BORDER}`,
              paddingTop: 6,
            }}
          >
            {book.abstract}
          </div>
        )}
      </div>
    </div>
  );
}
