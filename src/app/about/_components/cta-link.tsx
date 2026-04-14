"use client";

import { useState } from "react";
import Link from "next/link";

const ACCENT = "#C62828";

export function CtaLink() {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      href="/"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontFamily:    "'Noto Serif KR', Georgia, serif",
        fontSize:      "clamp(18px, 3vw, 32px)",
        fontWeight:    700,
        color:         hovered ? ACCENT : "#111",
        borderBottom:  `1px solid ${hovered ? ACCENT : "#CCC"}`,
        paddingBottom: 3,
        transition:    "color 0.2s, border-color 0.2s",
      }}
    >
      수감자 명부 보기 →
    </Link>
  );
}
