"use client";

import { ST } from "@/shared/lib/helpers";
import { FONT } from "@/shared/config/design-tokens";

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const s = ST[status];
  if (!s) return null;
  return (
    <span
      style={{
        display:    "inline-block",
        fontSize:   10,
        fontFamily: FONT,
        fontWeight: 600,
        padding:    "1px 5px",
        background: s.bg,
        color:      s.c,
        border:     `1px solid ${s.c}33`,
        whiteSpace: "nowrap",
      }}
    >
      {s.ko}
    </span>
  );
}
