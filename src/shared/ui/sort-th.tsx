"use client";

import { useState } from "react";
import { FONT, ACCENT } from "@/shared/config/design-tokens";
import type { SortCol } from "@/entities/book/model/types";

interface SortThProps {
  col:     SortCol;
  label:   string;
  sortCol: string;
  sortDir: "asc" | "desc";
  onSort:  (col: SortCol) => void;
  style?:  React.CSSProperties;
}

export function SortTh({ col, label, sortCol, sortDir, onSort, style }: SortThProps) {
  const active = sortCol === col;
  const [hovered, setHovered] = useState(false);
  return (
    <th
      onClick={() => onSort(col)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontFamily:  FONT,
        fontSize:    12,
        fontWeight:  "bold",
        lineHeight:  "1.4em",
        padding:     "2px 0px 4px 16px",
        textAlign:   "left",
        borderTop:   "2px solid #000",
        cursor:      "pointer",
        userSelect:  "none",
        whiteSpace:  "nowrap",
        color:       hovered ? ACCENT : "#000",
        transition:  "color 0.1s",
        ...style,
      }}
    >
      {label}
      <span
        style={{
          display:       "inline-flex",
          width:         "0.9em",
          marginLeft:    4,
          fontSize:      10,
          opacity:       active ? 1 : 0.25,
          verticalAlign: "middle",
        }}
      >
        {active ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
      </span>
    </th>
  );
}
