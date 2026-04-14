"use client";

import { useState } from "react";
import Image from "next/image";
import { InlineDetail } from "./inline-detail";
import { StatusBadge } from "@/shared/ui/status-badge";
import { FONT, ACCENT, ROW_BORDER, STATUS_BAR, STRIPE, MUTED } from "@/shared/config/design-tokens";
import type { Book } from "@/entities/book/model/types";

interface UniformCardProps {
  book:     Book;
  expanded: boolean;
  onToggle: (id: string) => void;
}

export function UniformCard({ book, expanded, onToggle }: UniformCardProps) {
  const barColor   = STATUS_BAR[book.status] ?? "#999";
  const [s1, s2]   = STRIPE[book.status] ?? ["#F5F5F5", "#E8E8E8"];
  const [imgError, setImgError] = useState(false);
  const coverSrc   =
    book.coverUrl ||
    (book.isbn ? `https://covers.openlibrary.org/b/isbn/${book.isbn}-M.jpg` : null);
  const hasCover   = Boolean(coverSrc) && !imgError;

  return (
    <div
      className="uniform-card fade-in"
      onClick={() => onToggle(book.id)}
      style={{
        border:     `1px solid ${ROW_BORDER}`,
        background: "#FFF",
        outline:    expanded ? `2px solid ${ACCENT}` : "none",
        fontFamily: FONT,
      }}
    >
      <div style={{ height: 3, background: barColor }} />

      <div
        style={{
          aspectRatio:    "2/3",
          background:     hasCover
            ? "#F5F5F5"
            : `repeating-linear-gradient(0deg,${s1} 0px,${s1} 11px,${s2} 11px,${s2} 13px)`,
          display:        "flex",
          flexDirection:  "column",
          alignItems:     "center",
          justifyContent: "center",
          padding:        "12px 10px",
          gap:            10,
          position:       "relative",
          overflow:       "hidden",
        }}
      >
        {hasCover && coverSrc ? (
          <Image
            src={coverSrc}
            alt={book.title}
            fill
            sizes="(max-width: 768px) 50vw, 150px"
            style={{ objectFit: "cover" }}
            onError={() => setImgError(true)}
            priority={false}
          />
        ) : (
          <>
            <div
              style={{
                fontFamily:    "Courier New, monospace",
                fontSize:      "clamp(13px, 2.5vw, 20px)",
                fontWeight:    700,
                letterSpacing: "0.08em",
                color:         "#333",
                textAlign:     "center",
                lineHeight:    1.3,
                zIndex:        1,
              }}
            >
              {(book.callNo || book.id).slice(0, 10)}
            </div>
            <StatusBadge status={book.status} />
            <div
              style={{
                position:      "absolute",
                bottom:        8,
                right:         10,
                fontSize:      11,
                fontWeight:    700,
                letterSpacing: "0.1em",
                color:         "rgba(0,0,0,0.25)",
              }}
            >
              {book.prisonSize}
            </div>
          </>
        )}
      </div>

      <div style={{ padding: "6px 10px 8px", fontFamily: FONT }}>
        <div
          style={{
            fontSize:            12,
            fontWeight:          "bold",
            lineHeight:          "1.4em",
            overflow:            "hidden",
            display:             "-webkit-box",
            WebkitLineClamp:     2,
            WebkitBoxOrient:     "vertical",
            marginBottom:        2,
          }}
        >
          {book.title}
        </div>
        <div style={{ fontSize: 11, color: MUTED }}>{book.creator || "—"}</div>
      </div>

      {expanded && (
        <div
          style={{
            borderTop:  `1px solid ${ROW_BORDER}`,
            padding:    "8px 10px",
            background: "#FFFAFA",
          }}
        >
          <InlineDetail book={book} />
        </div>
      )}
    </div>
  );
}
