"use client";

import { FilterBtn } from "@/shared/ui/filter-btn";
import { FONT, ACCENT, ROW_BORDER } from "@/shared/config/design-tokens";
import type { BookFilters } from "@/entities/book/model/types";

const STATUS_ITEMS = [
  { key: "AVAILABLE",   label: "접견가능", c: "#1B5E20" },
  { key: "CHECKED_OUT", label: "접견중",   c: "#BF360C" },
  { key: "RESTRICTED",  label: "접견불가", c: "#B71C1C" },
];

interface FilterBarProps {
  filters:  BookFilters;
  onChange: (group: string, key: string) => void;
}

export function FilterBar({ filters, onChange }: FilterBarProps) {
  const hasActive =
    filters.status.length > 0 ||
    filters.classification.length > 0 ||
    filters.yearFrom ||
    filters.yearTo;

  return (
    <div
      style={{
        display:      "flex",
        alignItems:   "center",
        gap:          12,
        padding:      "5px 0",
        borderBottom: `1px solid ${ROW_BORDER}`,
        flexWrap:     "wrap",
        fontFamily:   FONT,
        fontSize:     12,
      }}
    >
      {STATUS_ITEMS.map(({ key, label, c }) => (
        <FilterBtn
          key={key}
          label={label}
          active={filters.status.includes(key)}
          activeColor={c}
          onClick={() => onChange("status", key)}
        />
      ))}

      <span style={{ color: "#CCC" }}>|</span>

      <span style={{ color: "#AAA", fontSize: 11 }}>발행</span>
      <input
        type="number"
        placeholder="1900"
        value={filters.yearFrom}
        onChange={(e) => onChange("yearFrom", e.target.value)}
        style={{
          width:        52,
          fontFamily:   FONT,
          fontSize:     12,
          border:       0,
          borderBottom: `1px solid ${ROW_BORDER}`,
          outline:      "none",
          background:   "transparent",
          padding:      "0 2px",
        }}
      />
      <span style={{ color: "#AAA" }}>–</span>
      <input
        type="number"
        placeholder="2025"
        value={filters.yearTo}
        onChange={(e) => onChange("yearTo", e.target.value)}
        style={{
          width:        52,
          fontFamily:   FONT,
          fontSize:     12,
          border:       0,
          borderBottom: `1px solid ${ROW_BORDER}`,
          outline:      "none",
          background:   "transparent",
          padding:      "0 2px",
        }}
      />

      {hasActive && (
        <>
          <span style={{ color: "#CCC" }}>|</span>
          <FilterBtn
            label="초기화 ×"
            active={true}
            activeColor={ACCENT}
            onClick={() => onChange("reset", "")}
          />
        </>
      )}
    </div>
  );
}
