/* Book 도메인 타입 정의 */
export interface Book {
  _parsed?:       boolean;
  id:             string;
  title:          string;
  label:          string;
  creator:        string;
  isbn:           string;
  pubPlace:       string;
  pubDate:        string;
  year:           string;
  callNo:         string;
  extent:         string;
  height:         string;
  pages:          string;
  prisonSize:     string;
  holding:        string;
  abstract:       string;
  genre:          string;
  desc:           string;
  alt:            string;
  format:         string;
  keyword:        string;
  status:         string;
  classification: string;
  charges:        string;
  returnDate:     string;
  visitor:        string;
  coverUrl?:      string;
}

/* NLK 원시 응답 아이템 */
export interface NLKRawItem {
  BIBLIO_ID?:                     string;
  DCTERMS_title?:                 string;
  RDFS_label?:                    string;
  DC_creator?:                    string | string[];
  DCTERMS_creator?:               string | string[];
  BIBO_isbn?:                     string | string[];
  NLON_publicationPlace?:         string;
  NLON_issuedYear?:               string | number;
  DCTERMS_issued?:                string;
  DCTERMS_date?:                  string;
  NLON_classificationNumberOfNLK?: string;
  NLON_itemNumberOfNLK?:          string;
  BIBFRAME_extent?:               string | string[];
  NLON_localHolding?:             string | string[];
  DCTERMS_abstract?:              string;
  NLON_genre?:                    string;
  DCTERMS_description?:           string;
  DCTERMS_alternative?:           string;
  DCTERMS_hasFormat?:             string;
  NLON_keyword?:                  string;
  RDF_type?:                      string | string[];
  BIBO_degree?:                   string;
}

/* 필터 상태 */
export interface BookFilters {
  status:         string[];
  yearFrom:       string;
  yearTo:         string;
  classification: string[];
}

/* 정렬 컬럼 */
export type SortCol = "title" | "isbn" | "year" | "prisonSize" | "callNo";
