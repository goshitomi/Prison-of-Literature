/* ── 상수 ── */
export const ST = {
  AVAILABLE: { ko: "접견가능", en: "AVAILABLE", c: "#2B6E2B", bg: "#E8F5E9" },
  CHECKED_OUT: { ko: "접견중", en: "CHECKED OUT", c: "#C25700", bg: "#FFF3E0" },
  RESTRICTED: { ko: "접견불가", en: "RESTRICTED", c: "#C62828", bg: "#FFEBEE" },
};

export const CC = {
  RESTRICTED: "#C62828",
  "SPECIAL COLLECTION": "#C25700",
  GENERAL: "#2B6E2B",
};

/* ── 헬퍼 함수 ── */
export function hash(s) {
  let h = 0;
  for (let i = 0; i < (s || "").length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function simStatus(id) {
  const n = hash(id) % 100;
  return n < 55 ? "AVAILABLE" : n < 80 ? "CHECKED_OUT" : "RESTRICTED";
}

export function simReturn(id) {
  const d = new Date();
  d.setDate(d.getDate() + (hash(id) % 21) + 3);
  return d.toISOString().slice(0, 10);
}

export function simVisitor(id) {
  return `#${String(hash(id) % 9999).padStart(4, "0")}`;
}

export function simClass(id) {
  const n = hash(id) % 100;
  return n < 10 ? "RESTRICTED" : n < 30 ? "SPECIAL COLLECTION" : "GENERAL";
}

export function simCharges(c) {
  return c === "RESTRICTED"
    ? "접근 제한 자료 — 열람 허가 필요"
    : c === "SPECIAL COLLECTION"
    ? "특별 소장 자료 — 관내 열람만 가능"
    : "일반 소장 자료";
}

export function yearFromId(id) {
  const m = id.match(/\d{4}/);
  return m ? m[0] : "";
}

export function parsePhysical(extent) {
  const cmMatch = (extent || "").match(/(\d+)\s*cm/);
  const pMatch  = (extent || "").match(/(\d+)\s*p/i);
  return {
    height: cmMatch ? `${cmMatch[1]} cm` : "—",
    pages:  pMatch  ? `${pMatch[1]} p.`  : "—",
  };
}

export function prisonSize(extent) {
  const cmMatch = (extent || "").match(/(\d+)\s*cm/);
  if (!cmMatch) return "M";
  const cm = parseInt(cmMatch[1], 10);
  return cm <= 18 ? "S" : cm <= 24 ? "M" : "L";
}

export function parse(item) {
  const id = item.BIBLIO_ID || "";
  const st = simStatus(id);
  const cl = simClass(id);
  const extent = Array.isArray(item.BIBFRAME_extent)
    ? item.BIBFRAME_extent.join(", ")
    : item.BIBFRAME_extent || "";
  const physical = parsePhysical(extent);
  return {
    id,
    title: item.DCTERMS_title || item.RDFS_label || "제목 없음",
    label: item.RDFS_label || "",
    creator: item.DCTERMS_creator || "",
    isbn: item.BIBO_isbn || "",
    pubPlace: item.NLON_publicationPlace || "",
    pubDate: item.DCTERMS_issued || item.DCTERMS_date || "",
    callNo: item.NLON_itemNumberOfNLK || "",
    extent,
    height: physical.height,
    pages: physical.pages,
    prisonSize: prisonSize(extent),
    holding: item.NLON_localHolding || "",
    abstract: item.DCTERMS_abstract || "",
    genre: item.NLON_genre || "",
    desc: item.DCTERMS_description || "",
    alt: item.DCTERMS_alternative || "",
    format: item.DCTERMS_hasFormat || "",
    status: st,
    classification: cl,
    charges: simCharges(cl),
    returnDate: st === "CHECKED_OUT" ? simReturn(id) : "",
    visitor: st === "CHECKED_OUT" ? simVisitor(id) : "",
    year: yearFromId(id),
  };
}
