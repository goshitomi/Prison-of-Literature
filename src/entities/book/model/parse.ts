import {
  simStatus, simClass, simReturn, simVisitor, simCharges,
  parsePhysical, prisonSize,
} from "@/shared/lib/helpers";
import type { Book, NLKRawItem } from "./types";

export function parseBook(item: NLKRawItem): Book {
  const id = item.BIBLIO_ID || "";
  const st = simStatus(id);
  const cl = simClass(id);

  const extentArr = Array.isArray(item.BIBFRAME_extent)
    ? item.BIBFRAME_extent
    : item.BIBFRAME_extent ? [item.BIBFRAME_extent] : [];
  const extent  = extentArr.join(", ");
  const physical = parsePhysical(extent);

  const creatorRaw = item.DC_creator || item.DCTERMS_creator;
  const creator = Array.isArray(creatorRaw)
    ? creatorRaw.join(", ")
    : creatorRaw || "";

  const pubYear = item.NLON_issuedYear
    ? String(item.NLON_issuedYear)
    : (item.DCTERMS_issued || item.DCTERMS_date || "").replace(/\D/g, "").slice(0, 4);

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
    callNo:         [item.NLON_classificationNumberOfNLK, item.NLON_itemNumberOfNLK]
                      .filter(Boolean).join(" ") || "",
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
