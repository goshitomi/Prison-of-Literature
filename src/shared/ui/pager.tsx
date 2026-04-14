"use client";

import { useState } from "react";
import { FONT, ACCENT, MUTED, ROW_BORDER } from "@/shared/config/design-tokens";

interface PagerProps {
  pn:         number;
  totalPages: number;
  onLoad:     (page: number) => void;
}

export function Pager({ pn, totalPages, onLoad }: PagerProps) {
  if (totalPages <= 1) return null;

  const items = [
    { label: "← PREV", disabled: pn <= 1,         onClick: () => { onLoad(pn - 1); window.scrollTo(0, 0); } },
    { label: "NEXT →", disabled: pn >= totalPages, onClick: () => { onLoad(pn + 1); window.scrollTo(0, 0); } },
  ];

  return (
    <div
      style={{
        display:        "flex",
        justifyContent: "center",
        alignItems:     "center",
        gap:            24,
        padding:        "20px 0",
        fontFamily:     FONT,
        fontSize:       12,
        borderTop:      `1px solid ${ROW_BORDER}`,
      }}
    >
      {items.map(({ label, disabled, onClick }, i) => (
        <PagerButton key={i} label={label} disabled={disabled} onClick={onClick} index={i} pn={pn} totalPages={totalPages} />
      ))}
    </div>
  );
}

function PagerButton({
  label, disabled, onClick, index, pn, totalPages,
}: {
  label: string; disabled: boolean; onClick: () => void;
  index: number; pn: number; totalPages: number;
}) {
  const [hov, setHov] = useState(false);
  return (
    <>
      {index === 1 && (
        <span style={{ color: MUTED, fontFamily: FONT, fontSize: 11 }}>
          {pn} / {totalPages > 9999 ? "…" : totalPages}
        </span>
      )}
      <button
        disabled={disabled}
        onClick={onClick}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          fontFamily: FONT,
          fontSize:   12,
          color:      disabled ? "#DDD" : hov ? ACCENT : "#000",
          cursor:     disabled ? "default" : "pointer",
          background: "none",
          border:     "none",
          padding:    0,
          transition: "color 0.1s",
        }}
      >
        {label}
      </button>
    </>
  );
}
