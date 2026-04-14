"use client";

import React, { useState, useRef, useEffect } from "react";
import { InlineDetail } from "./inline-detail";
import { FONT, ACCENT, ROW_BORDER } from "@/shared/config/design-tokens";
import type { Book } from "@/entities/book/model/types";

interface BookRowProps {
  book:           Book;
  idx:            number;
  expanded:       boolean;
  onToggle:       (id: string) => void;
  onHeightChange?: (id: string, height: number) => void;
}

function tdStyle(extra: React.CSSProperties = {}): React.CSSProperties {
  return {
    fontFamily:    FONT,
    fontSize:      12,
    lineHeight:    "1.4em",
    padding:       "2px 0px 2px 16px",
    verticalAlign: "top",
    borderTop:     `1px solid ${ROW_BORDER}`,
    ...extra,
  };
}

export function BookRow({ book, idx, expanded, onToggle, onHeightChange }: BookRowProps) {
  const [hovered, setHovered] = useState(false);
  const rowRef = useRef<HTMLTableRowElement>(null);
  const detailRef = useRef<HTMLTableRowElement>(null);
  const bg = expanded || hovered ? "#FFFAFA" : "transparent";

  /* 높이 변경 통보 (react-window VariableSizeList 지원) */
  useEffect(() => {
    if (!onHeightChange) return;
    const totalHeight =
      (rowRef.current?.offsetHeight ?? 26) +
      (expanded ? (detailRef.current?.offsetHeight ?? 0) : 0);
    onHeightChange(book.id, totalHeight);
  }, [expanded, onHeightChange, book.id]);

  return (
    <React.Fragment>
      <tr
        ref={rowRef}
        onClick={() => onToggle(book.id)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ cursor: "pointer", background: bg, transition: "background 0.08s" }}
      >
        {/* No. */}
        <td style={tdStyle({ color: "#BBB", width: 44, fontVariantNumeric: "tabular-nums" })}>
          {String(idx + 1).padStart(3, "0")}
        </td>

        {/* 수감자 */}
        <td style={tdStyle({ fontWeight: "bold", maxWidth: 300 })}>
          <span
            style={{
              display:       "block",
              overflow:      "hidden",
              textOverflow:  "ellipsis",
              whiteSpace:    "nowrap",
              color:         hovered ? ACCENT : "#000",
              transition:    "color 0.1s",
            }}
          >
            {book.title}
          </span>
        </td>

        {/* ISBN */}
        <td style={tdStyle({ maxWidth: 180 })}>
          <span
            style={{
              display:      "block",
              overflow:     "hidden",
              textOverflow: "ellipsis",
              whiteSpace:   "nowrap",
            }}
          >
            {book.isbn || "—"}
          </span>
        </td>

        {/* 발행연도 */}
        <td style={tdStyle({ width: 52, fontVariantNumeric: "tabular-nums" })}>
          {book.year || "—"}
        </td>

        {/* 판형 */}
        <td style={tdStyle({ width: 56, fontVariantNumeric: "tabular-nums" })}>
          {book.prisonSize}
        </td>

        {/* 청구기호 */}
        <td style={tdStyle({ width: 160 })}>
          <span
            style={{
              display:      "block",
              overflow:     "hidden",
              textOverflow: "ellipsis",
              whiteSpace:   "nowrap",
            }}
          >
            {book.callNo || "—"}
          </span>
        </td>
      </tr>

      {/* 인라인 확장 패널 */}
      {expanded && (
        <tr ref={detailRef} style={{ background: "#FFFAFA" }}>
          <td
            colSpan={6}
            style={{
              fontFamily:   FONT,
              fontSize:     12,
              padding:      "8px 16px 12px 60px",
              borderTop:    `1px solid ${ROW_BORDER}`,
              borderBottom: "2px solid #000",
            }}
          >
            <InlineDetail book={book} />
          </td>
        </tr>
      )}
    </React.Fragment>
  );
}
