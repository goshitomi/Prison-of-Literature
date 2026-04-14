/* ── 상태 상수 ── */
export const ST: Record<string, { ko: string; en: string; c: string; bg: string }> = {
  AVAILABLE:   { ko: "접견가능", en: "AVAILABLE",   c: "#1B5E20", bg: "#F1F8F1" },
  CHECKED_OUT: { ko: "접견중",   en: "CHECKED OUT", c: "#BF360C", bg: "#FFF3EE" },
  RESTRICTED:  { ko: "접견불가", en: "RESTRICTED",  c: "#B71C1C", bg: "#FFF0F0" },
};

export const CC: Record<string, string> = {
  RESTRICTED:         "#B71C1C",
  "SPECIAL COLLECTION": "#BF360C",
  GENERAL:            "#1B5E20",
};

export function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < (s || "").length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function simStatus(id: string): string {
  const n = hash(id) % 100;
  return n < 55 ? "AVAILABLE" : n < 80 ? "CHECKED_OUT" : "RESTRICTED";
}

export function simReturn(id: string): string {
  const d = new Date();
  d.setDate(d.getDate() + (hash(id) % 21) + 3);
  return d.toISOString().slice(0, 10);
}

export function simVisitor(id: string): string {
  return `#${String(hash(id) % 9999).padStart(4, "0")}`;
}

export function simClass(id: string): string {
  const n = hash(id) % 100;
  return n < 10 ? "RESTRICTED" : n < 30 ? "SPECIAL COLLECTION" : "GENERAL";
}

export function simCharges(c: string): string {
  return c === "RESTRICTED"
    ? "접근 제한 자료 — 열람 허가 필요"
    : c === "SPECIAL COLLECTION"
    ? "특별 소장 자료 — 관내 열람만 가능"
    : "일반 소장 자료";
}

export function parsePhysical(extent: string): { height: string; pages: string } {
  const cmMatch = (extent || "").match(/(\d+)\s*cm/);
  const pMatch  = (extent || "").match(/(\d+)\s*p/i);
  return {
    height: cmMatch ? `${cmMatch[1]}cm` : "—",
    pages:  pMatch  ? `${pMatch[1]}p.`  : "—",
  };
}

export function prisonSize(extent: string): string {
  const cmMatch = (extent || "").match(/(\d+)\s*cm/);
  return cmMatch ? `${cmMatch[1]}cm` : "—";
}
