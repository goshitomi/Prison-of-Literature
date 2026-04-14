"use client";

import { useState } from "react";
import Link from "next/link";

const FONT       = "Arial, Helvetica, sans-serif";
const ACCENT     = "#C62828";
const ROW_BORDER = "#FFE0E0";

export function Header() {
  const [hoverLogo, setHoverLogo] = useState(false);

  return (
    <header
      style={{
        position:       "fixed",
        top: 0, left: 0, right: 0,
        zIndex:         100,
        height:         40,
        borderBottom:   `1px solid ${ROW_BORDER}`,
        background:     "rgba(255,255,255,0.97)",
        backdropFilter: "blur(8px)",
        display:        "flex",
        alignItems:     "center",
        padding:        "0 24px",
      }}
    >
      <Link
        href="/"
        style={{
          fontFamily:    FONT,
          fontSize:      12,
          fontWeight:    "bold",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color:         hoverLogo ? ACCENT : "#000",
          transition:    "color 0.1s",
        }}
        onMouseEnter={() => setHoverLogo(true)}
        onMouseLeave={() => setHoverLogo(false)}
      >
        Prison of Literature
      </Link>
    </header>
  );
}
