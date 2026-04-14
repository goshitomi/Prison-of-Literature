"use client";

import { useState } from "react";
import { FONT } from "@/shared/config/design-tokens";

interface FilterBtnProps {
  label:       string;
  active:      boolean;
  activeColor: string;
  onClick:     () => void;
}

export function FilterBtn({ label, active, activeColor, onClick }: FilterBtnProps) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        fontFamily: FONT,
        fontSize:   12,
        fontWeight: active ? "bold" : "normal",
        color:      active || hov ? activeColor : "#AAA",
        background: "none",
        border:     "none",
        padding:    0,
        cursor:     "pointer",
        transition: "color 0.1s",
      }}
    >
      {label}
    </button>
  );
}
