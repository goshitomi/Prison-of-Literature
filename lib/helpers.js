/* ── 상태 상수 (흰 배경용) ── */
export const ST = {
  AVAILABLE:   { ko: "접견가능", en: "AVAILABLE",   c: "#1B5E20", bg: "#F1F8F1" },
  CHECKED_OUT: { ko: "접견중",   en: "CHECKED OUT", c: "#BF360C", bg: "#FFF3EE" },
  RESTRICTED:  { ko: "접견불가", en: "RESTRICTED",  c: "#B71C1C", bg: "#FFF0F0" },
};

export const CC = {
  RESTRICTED:         "#B71C1C",
  "SPECIAL COLLECTION": "#BF360C",
  GENERAL:            "#1B5E20",
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

  /* BIBFRAME_extent: API가 배열로 반환 */
  const extentArr = Array.isArray(item.BIBFRAME_extent)
    ? item.BIBFRAME_extent
    : item.BIBFRAME_extent ? [item.BIBFRAME_extent] : [];
  const extent = extentArr.join(", ");
  const physical = parsePhysical(extent);

  /* ── 버그 수정: DCTERMS_creator는 항상 null, 실제 저자는 DC_creator[] ── */
  const creatorRaw = item.DC_creator || item.DCTERMS_creator;
  const creator = Array.isArray(creatorRaw)
    ? creatorRaw.join(", ")
    : creatorRaw || "";

  /* ── 버그 수정: NLON_issuedYear가 실제 발행 연도 (DCTERMS_issued는 형식 불일정) ── */
  const pubYear = item.NLON_issuedYear
    ? String(item.NLON_issuedYear)
    : (item.DCTERMS_issued || item.DCTERMS_date || "").replace(/\D/g, "").slice(0, 4);

  /* ISBN: 배열일 수도 있음 */
  const isbnRaw = item.BIBO_isbn;
  const isbn = Array.isArray(isbnRaw) ? isbnRaw[0] || "" : isbnRaw || "";

  return {
    id,
    title:          item.DCTERMS_title || item.RDFS_label || "제목 없음",
    label:          item.RDFS_label || "",
    creator,
    isbn,
    pubPlace:       item.NLON_publicationPlace || "",
    pubDate:        pubYear,
    callNo:         item.NLON_itemNumberOfNLK || item.NLON_classificationNumberOfNLK || "",
    extent,
    height:         physical.height,
    pages:          physical.pages,
    prisonSize:     prisonSize(extent),
    holding:        Array.isArray(item.NLON_localHolding)
                      ? item.NLON_localHolding.join("; ")
                      : item.NLON_localHolding || "",
    abstract:       item.DCTERMS_abstract || "",
    genre:          item.NLON_genre || "",
    desc:           item.DCTERMS_description || "",
    alt:            item.DCTERMS_alternative || "",
    format:         item.DCTERMS_hasFormat || "",
    keyword:        item.NLON_keyword || "",
    status:         st,
    classification: cl,
    charges:        simCharges(cl),
    returnDate:     st === "CHECKED_OUT" ? simReturn(id) : "",
    visitor:        st === "CHECKED_OUT" ? simVisitor(id) : "",
    year:           pubYear,
  };
}
