"use client";

import React from "react";
import { FONT } from "@/shared/config/design-tokens";

interface SearchFormProps {
  q:        string;
  onChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function SearchForm({ q, onChange, onSubmit }: SearchFormProps) {
  return (
    <form onSubmit={onSubmit} style={{ display: "flex", alignItems: "center" }}>
      <input
        type="search"
        placeholder="search inmate"
        value={q}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width:            200,
          height:           "1.6em",
          background:       "#f1f1f1",
          border:           0,
          outline:          "none",
          fontFamily:       FONT,
          fontSize:         12,
          lineHeight:       "1.4em",
          padding:          "0 8px",
          boxShadow:        "none",
          WebkitAppearance: "none",
          color:            "#000",
        }}
      />
    </form>
  );
}
