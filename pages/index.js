import React, { useState, useEffect, useCallback, useRef } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { parse, ST } from "../lib/helpers";

/* ── Design tokens — Roma Publications 패턴 ── */
const FONT       = "Arial, Helvetica, sans-serif";
const ACCENT     = "#C62828";          // Roma: #FFBBBB (분홍) → PofL: 빨강
const ROW_BORDER = "#FFE0E0";          // Roma: #FFCCCC (분홍) → PofL: 연한 빨강
const MUTED      = "#767676";
const PER_PAGE   = 30;

const STATUS_BAR = {
  AVAILABLE:   "#1B5E20",
  CHECKED_OUT: "#BF360C",
  RESTRICTED:  "#B71C1C",
};
const STRIPE = {
  AVAILABLE:   ["#EEF7EE", "#D4EDD4"],
  CHECKED_OUT: ["#FFF4EE", "#FFE3CC"],
  RESTRICTED:  ["#FFF2F2", "#FFD6D6"],
};

/* ── 공통 TD 스타일 (Roma: padding: 1px 0px 1px 16px) ── */
function tdStyle(extra = {}) {
  return {
    fontFamily:  FONT,
    fontSize:    12,
    lineHeight:  "1.4em",
    padding:     "2px 0px 2px 16px",
    verticalAlign: "top",
    borderTop:   `1px solid ${ROW_BORDER}`,
    ...extra,
  };
}

/* ── 상태 뱃지 ── */
function StatusBadge({ status }) {
  const s = ST[status];
  if (!s) return null;
  return (
    <span style={{
      display:    "inline-block",
      fontSize:   10,
      fontFamily: FONT,
      fontWeight: 600,
      padding:    "1px 5px",
      background: s.bg,
      color:      s.c,
      border:     `1px solid ${s.c}33`,
      whiteSpace: "nowrap",
    }}>
      {s.ko}
    </span>
  );
}

/* ── 인라인 상세 패널 ── */
function InlineDetail({ book }) {
  const [imgError, setImgError] = useState(false);
  const coverSrc = book.coverUrl || (book.isbn ? `https://covers.openlibrary.org/b/isbn/${book.isbn}-M.jpg` : null);
  const showCover = Boolean(coverSrc) && !imgError;

  const rows = [
    ["수인번호 / Call No.", book.callNo  || "—"],
    ["ISBN",               book.isbn    || "—"],
    ["발행연도",           book.year    || "—"],
    ["판형",               book.prisonSize || "—"],
    ["페이지수",           book.pages],
    ["발행지",             book.pubPlace || "—"],
    ["소장위치",           book.holding  || "—"],
    ["자료분류",           book.charges],
    ["키워드",             book.keyword  || "—"],
  ];
  return (
    <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
      {showCover && (
        <img
          src={coverSrc}
          alt={book.title}
          onError={() => setImgError(true)}
          style={{
            flexShrink: 0, width: 80,
            display: "block",
            border: `1px solid ${ROW_BORDER}`,
          }}
        />
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "2px 0 5px",
          borderBottom: `1px solid ${ROW_BORDER}`,
          marginBottom: 2,
        }}>
          <span style={{ color: MUTED, fontSize: 12, fontFamily: FONT, minWidth: 110, flexShrink: 0 }}>접견상태</span>
          <StatusBadge status={book.status} />
          {book.returnDate && (
            <span style={{ color: MUTED, fontSize: 11, fontFamily: FONT }}>
              반납예정 {book.returnDate} · 방문자 {book.visitor}
            </span>
          )}
        </div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "1px 24px",
          fontFamily: FONT,
          fontSize: 12,
        }}>
          {rows.map(([k, v]) => (
            <div key={k} style={{
              display: "flex", gap: 8,
              padding: "2px 0",
              borderBottom: `1px solid ${ROW_BORDER}`,
            }}>
              <span style={{ color: MUTED, minWidth: 110, flexShrink: 0 }}>{k}</span>
              <span style={{ color: "#111", wordBreak: "break-word" }}>{v}</span>
            </div>
          ))}
        </div>
        {book.abstract && (
          <div style={{
            marginTop: 6, fontSize: 12,
            color: "#444", lineHeight: 1.6,
            borderTop: `1px solid ${ROW_BORDER}`, paddingTop: 6,
          }}>
            {book.abstract}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── 정렬 가능 컬럼 헤더 ── */
function SortTh({ col, label, sortCol, sortDir, onSort, style }) {
  const active = sortCol === col;
  const [hovered, setHovered] = useState(false);
  return (
    <th
      onClick={() => onSort(col)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontFamily:  FONT,
        fontSize:    12,
        fontWeight:  "bold",
        lineHeight:  "1.4em",
        padding:     "2px 0px 4px 16px",
        textAlign:   "left",
        borderTop:   "2px solid #000",
        cursor:      "pointer",
        userSelect:  "none",
        whiteSpace:  "nowrap",
        color:       hovered ? ACCENT : "#000",
        transition:  "color 0.1s",
        ...style,
      }}
    >
      {label}
      <span style={{
        display:       "inline-flex",
        width:         "0.9em",
        marginLeft:    4,
        fontSize:      10,
        opacity:       active ? 1 : 0.25,
        verticalAlign: "middle",
      }}>
        {active ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
      </span>
    </th>
  );
}

/* ── 리스트뷰 행 ── */
function BookRow({ book, idx, expanded, onToggle }) {
  const [hovered, setHovered] = useState(false);
  const bg = expanded || hovered ? "#FFFAFA" : "transparent";
  return (
    <React.Fragment key={book.id}>
      <tr
        onClick={() => onToggle(book.id)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ cursor: "pointer", background: bg, transition: "background 0.08s" }}
      >
        {/* No. */}
        <td style={tdStyle({ color: "#BBB", width: 44, fontVariantNumeric: "tabular-nums" })}>
          {String(idx + 1).padStart(3, "0")}
        </td>

        {/* 수감자명 (bold — Roma TITLE 패턴) */}
        <td style={tdStyle({ fontWeight: "bold", maxWidth: 300 })}>
          <span style={{
            display: "block", overflow: "hidden",
            textOverflow: "ellipsis", whiteSpace: "nowrap",
            color: hovered ? ACCENT : "#000",
            transition: "color 0.1s",
          }}>
            {book.title}
          </span>
        </td>

        {/* 저자 */}
        <td style={tdStyle({ maxWidth: 180 })}>
          <span style={{
            display: "block", overflow: "hidden",
            textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {book.creator || "—"}
          </span>
        </td>

        {/* 발행연도 */}
        <td style={tdStyle({ width: 52, fontVariantNumeric: "tabular-nums" })}>
          {book.year || "—"}
        </td>

        {/* 판형 */}
        <td style={tdStyle({ width: 56, fontVariantNumeric: "tabular-nums" })}>
          {book.prisonSize}
        </td>

        {/* 청구기호 (monospace — Roma SIZE 패턴) */}
        <td style={tdStyle({ width: 160, fontFamily: '"Courier New", "Apple SD Gothic Neo", "Malgun Gothic", monospace', fontSize: 11 })}>
          <span style={{
            display: "block", overflow: "hidden",
            textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {book.callNo || "—"}
          </span>
        </td>
      </tr>

      {/* 인라인 확장 패널 */}
      {expanded && (
        <tr style={{ background: "#FFFAFA" }}>
          <td colSpan={6} style={{
            fontFamily:   FONT, fontSize: 12,
            padding:      "8px 16px 12px 60px",
            borderTop:    `1px solid ${ROW_BORDER}`,
            borderBottom: "2px solid #000",
          }}>
            <InlineDetail book={book} />
          </td>
        </tr>
      )}
    </React.Fragment>
  );
}

/* ── 리스트뷰 테이블 (Roma Publications 스타일) ── */
function ListView({ books, pageOffset, sortCol, sortDir, onSort, expandedId, onToggle }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{
        width: "100%",
        borderCollapse: "collapse",
        fontFamily: FONT,
        fontSize: 12,
        lineHeight: "1.4em",
        minWidth: 580,
      }}>
        <thead>
          <tr>
            {/* No. 헤더 */}
            <th style={{
              fontFamily: FONT, fontSize: 12, fontWeight: "bold",
              lineHeight: "1.4em",
              padding: "2px 0 4px 16px",
              borderTop: "2px solid #000",
              width: 44, textAlign: "left",
              userSelect: "none", whiteSpace: "nowrap",
            }}>No.</th>
            <SortTh col="title"      label="수감자명 / TITLE"    {...{sortCol, sortDir, onSort}} />
            <SortTh col="creator"    label="저자 / ARTIST(S)"    {...{sortCol, sortDir, onSort}} />
            <SortTh col="year"       label="발행 / YEAR"         {...{sortCol, sortDir, onSort}} style={{ width: 52 }} />
            <SortTh col="prisonSize" label="판형 / SIZE"         {...{sortCol, sortDir, onSort}} style={{ width: 56 }} />
            <SortTh col="callNo"     label="청구기호"             {...{sortCol, sortDir, onSort}} style={{ width: 160 }} />
          </tr>
        </thead>
        <tbody>
          {books.map((book, i) => (
            <BookRow
              key={book.id}
              book={book}
              idx={pageOffset + i}
              expanded={expandedId === book.id}
              onToggle={onToggle}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── CSS 죄수복 카드 (그리드뷰용) ── */
function UniformCard({ book, onToggle, expanded }) {
  const barColor = STATUS_BAR[book.status] ?? "#999";
  const [s1, s2] = STRIPE[book.status] ?? ["#F5F5F5", "#E8E8E8"];
  const [imgError, setImgError] = useState(false);
  const coverSrc = book.coverUrl || (book.isbn ? `https://covers.openlibrary.org/b/isbn/${book.isbn}-M.jpg` : null);
  const hasCover = Boolean(coverSrc) && !imgError;

  return (
    <div
      className="uniform-card fade-in"
      onClick={() => onToggle(book.id)}
      style={{
        border:     `1px solid ${ROW_BORDER}`,
        background: "#FFF",
        outline:    expanded ? `2px solid ${ACCENT}` : "none",
        fontFamily: FONT,
      }}
    >
      <div style={{ height: 3, background: barColor }} />
      <div style={{
        aspectRatio: "2/3",
        background: hasCover ? "#F5F5F5" :
          `repeating-linear-gradient(0deg,${s1} 0px,${s1} 11px,${s2} 11px,${s2} 13px)`,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "12px 10px", gap: 10,
        position: "relative", overflow: "hidden",
      }}>
        {hasCover ? (
          <img
            src={coverSrc}
            alt={book.title}
            onError={() => setImgError(true)}
            onLoad={e => { e.currentTarget.style.opacity = "1"; }}
            style={{
              width: "100%", height: "100%", objectFit: "cover",
              position: "absolute", inset: 0,
              opacity: 0, transition: "opacity 400ms ease-out",
            }}
          />
        ) : (
          <>
            <div style={{
              fontFamily: "Courier New, monospace",
              fontSize: "clamp(13px, 2.5vw, 20px)",
              fontWeight: 700, letterSpacing: "0.08em",
              color: "#333", textAlign: "center", lineHeight: 1.3, zIndex: 1,
            }}>
              {(book.callNo || book.id).slice(0, 10)}
            </div>
            <StatusBadge status={book.status} />
            <div style={{
              position: "absolute", bottom: 8, right: 10,
              fontSize: 11, fontWeight: 700,
              letterSpacing: "0.1em", color: "rgba(0,0,0,0.25)",
            }}>
              {book.prisonSize}
            </div>
          </>
        )}
      </div>
      <div style={{ padding: "6px 10px 8px", fontFamily: FONT }}>
        <div style={{
          fontSize: 12, fontWeight: "bold", lineHeight: "1.4em",
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
          marginBottom: 2,
        }}>
          {book.title}
        </div>
        <div style={{ fontSize: 11, color: MUTED }}>
          {book.creator || "—"}
        </div>
      </div>
      {expanded && (
        <div style={{ borderTop: `1px solid ${ROW_BORDER}`, padding: "8px 10px", background: "#FFFAFA" }}>
          <InlineDetail book={book} />
        </div>
      )}
    </div>
  );
}

/* ── 그리드뷰 ── */
function GridView({ books, expandedId, onToggle }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
      gap: 20,
    }}>
      {books.map(book => (
        <UniformCard
          key={book.id}
          book={book}
          expanded={expandedId === book.id}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
}

/* ── 페이지네이션 ── */
function Pager({ pn, totalPages, onLoad }) {
  if (totalPages <= 1) return null;
  return (
    <div style={{
      display: "flex", justifyContent: "center", alignItems: "center",
      gap: 24, padding: "20px 0",
      fontFamily: FONT, fontSize: 12,
      borderTop: `1px solid ${ROW_BORDER}`,
    }}>
      {[
        { label: "← PREV", disabled: pn <= 1,         onClick: () => { onLoad(pn - 1); window.scrollTo(0, 0); } },
        { label: "NEXT →", disabled: pn >= totalPages, onClick: () => { onLoad(pn + 1); window.scrollTo(0, 0); } },
      ].map(({ label, disabled, onClick }, i) => {
        const [hov, setHov] = useState(false);
        return (
          <React.Fragment key={i}>
            {i === 1 && (
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
                fontFamily: FONT, fontSize: 12,
                color: disabled ? "#DDD" : (hov ? ACCENT : "#000"),
                cursor: disabled ? "default" : "pointer",
                background: "none", border: "none", padding: 0,
                transition: "color 0.1s",
              }}
            >
              {label}
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════
   메인 페이지
══════════════════════════════════════════ */
export default function Index() {
  const router = useRouter();

  /* ── 데이터 상태 ── */
  const [books,   setBooks]   = useState([]);
  const [total,   setTotal]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [pn,      setPn]      = useState(1);

  /* ── UI 상태 ── */
  const [view,       setView]       = useState("list");
  const [q,          setQ]          = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [sortCol,    setSortCol]    = useState("title");
  const [sortDir,    setSortDir]    = useState("asc");
  const [filters,    setFilters]    = useState({
    status: [], yearFrom: "", yearTo: "", classification: [],
  });

  /* ── URL → 초기 상태 ── */
  useEffect(() => {
    const { view: v, q: qv } = router.query;
    if (v === "grid" || v === "list") setView(v);
    if (qv) setQ(String(qv));
  }, [router.isReady]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── 데이터 로드 ── */
  const load = useCallback(async (page = 1, searchQ = "") => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        pageNo:    String(page),
        numOfRows: String(PER_PAGE),
        koreanOnly: "true",
      });
      if (searchQ.trim()) params.set("q", searchQ.trim());
      const res = await fetch(`/api/books?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data?.error) throw new Error(data.error);
      if (data?.header?.resultCode && data.header.resultCode !== "00")
        throw new Error(data.header.resultMsg || "API 오류");
      const body = data?.body ?? data;
      setBooks((body?.items ?? []).map(item => item._parsed ? item : parse(item)));
      setTotal(body?.totalCount ?? 0);
      setPn(page);
      setExpandedId(null);
    } catch (e) {
      setError(e.message);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(1); }, [load]);

  /* ── 검색 ── */
  const searchRef = useRef(q);
  searchRef.current = q;
  const handleSearch = useCallback((e) => {
    e.preventDefault();
    load(1, searchRef.current);
    router.replace({ query: { ...router.query, q: searchRef.current || undefined } },
      undefined, { shallow: true });
  }, [load, router]);

  /* ── 필터 ── */
  function handleFilterChange(group, key) {
    if (group === "reset") {
      setFilters({ status: [], yearFrom: "", yearTo: "", classification: [] });
      return;
    }
    if (group === "yearFrom" || group === "yearTo") {
      setFilters(prev => ({ ...prev, [group]: key }));
      return;
    }
    setFilters(prev => {
      const arr = prev[group];
      return { ...prev, [group]: arr.includes(key) ? arr.filter(v => v !== key) : [...arr, key] };
    });
  }

  /* ── 뷰 전환 ── */
  function switchView(v) {
    setView(v);
    setExpandedId(null);
    router.replace({ query: { ...router.query, view: v } }, undefined, { shallow: true });
  }

  /* ── 정렬 ── */
  function toggleSort(col) {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("asc"); }
  }

  /* ── 클라이언트 필터 + 정렬 ── */
  let display = books.filter(book => {
    if (filters.status.length         && !filters.status.includes(book.status))             return false;
    if (filters.classification.length && !filters.classification.includes(book.classification)) return false;
    if (filters.yearFrom && parseInt(book.year) < parseInt(filters.yearFrom)) return false;
    if (filters.yearTo   && parseInt(book.year) > parseInt(filters.yearTo))   return false;
    return true;
  });
  display = [...display].sort((a, b) => {
    const va = a[sortCol] ?? "";
    const vb = b[sortCol] ?? "";
    const cmp = String(va).localeCompare(String(vb), "ko");
    return sortDir === "asc" ? cmp : -cmp;
  });

  const totalPages = Math.ceil((total ?? 0) / PER_PAGE);
  const hasActive  = filters.status.length > 0 || filters.classification.length > 0
                   || filters.yearFrom || filters.yearTo;

  const statusItems = [
    { key: "AVAILABLE",   label: "접견가능", c: "#1B5E20" },
    { key: "CHECKED_OUT", label: "접견중",   c: "#BF360C" },
    { key: "RESTRICTED",  label: "접견불가", c: "#B71C1C" },
  ];

  return (
    <>
      <Head>
        <title>PRISON OF LITERATURE — 수감자 명부</title>
      </Head>

      {/* ── 전체 래퍼: 고정 헤더 아래, 좌우 24px 패딩 ── */}
      <main style={{ padding: "0 24px 48px", fontFamily: FONT }}>

        {/* ─────────────────────────────────────────
            서브헤더 행: 타이틀 + 카운트 | 검색 + 뷰 토글
            (Roma의 첫 번째 행 패턴)
        ───────────────────────────────────────── */}
        <div style={{
          display:        "flex",
          alignItems:     "center",
          justifyContent: "space-between",
          padding:        "8px 0",
          borderBottom:   `1px solid ${ROW_BORDER}`,
          flexWrap:       "wrap",
          gap:            8,
        }}>
          {/* 좌: 수감자 명부 + 총 건수 */}
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span style={{ fontFamily: FONT, fontSize: 12, fontWeight: "bold" }}>
              수감자 명부
            </span>
            {total !== null && (
              <span style={{ fontFamily: FONT, fontSize: 11, color: MUTED }}>
                {total.toLocaleString()}명 수감 중
              </span>
            )}
          </div>

          {/* 우: 검색 (Roma: #f1f1f1 배경, 테두리 없음) + 뷰 토글 */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <form onSubmit={handleSearch} style={{ display: "flex", alignItems: "center" }}>
              <input
                type="search"
                placeholder="search inmate"
                value={q}
                onChange={e => setQ(e.target.value)}
                style={{
                  width:             200,
                  height:            "1.6em",
                  background:        "#f1f1f1",
                  border:            0,
                  outline:           "none",
                  fontFamily:        FONT,
                  fontSize:          12,
                  lineHeight:        "1.4em",
                  padding:           "0 8px",
                  boxShadow:         "none",
                  WebkitAppearance:  "none",
                  color:             "#000",
                }}
              />
            </form>

            {/* 뷰 토글 (소형) */}
            <div style={{ display: "flex", gap: 6 }}>
              {[
                { id: "list", icon: "≡" },
                { id: "grid", icon: "⊞" },
              ].map(({ id, icon }) => (
                <button
                  key={id}
                  title={id}
                  onClick={() => switchView(id)}
                  style={{
                    fontFamily: FONT,
                    fontSize:   15,
                    lineHeight: 1,
                    background: "none",
                    border:     "none",
                    padding:    "0 2px",
                    color:      view === id ? "#000" : "#CCC",
                    fontWeight: view === id ? "bold" : "normal",
                    cursor:     "pointer",
                    transition: "color 0.1s",
                  }}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────
            인라인 필터 행 (접견상태 | 발행 연도)
        ───────────────────────────────────────── */}
        <div style={{
          display:      "flex",
          alignItems:   "center",
          gap:          12,
          padding:      "5px 0",
          borderBottom: `1px solid ${ROW_BORDER}`,
          flexWrap:     "wrap",
          fontFamily:   FONT,
          fontSize:     12,
        }}>
          {statusItems.map(({ key, label, c }) => {
            const active = filters.status.includes(key);
            return (
              <FilterBtn
                key={key}
                label={label}
                active={active}
                activeColor={c}
                onClick={() => handleFilterChange("status", key)}
              />
            );
          })}

          <span style={{ color: "#CCC" }}>|</span>

          <span style={{ color: "#AAA", fontSize: 11 }}>발행</span>
          <input
            type="number" placeholder="1900"
            value={filters.yearFrom}
            onChange={e => handleFilterChange("yearFrom", e.target.value)}
            style={{
              width: 52, fontFamily: FONT, fontSize: 12,
              border: 0, borderBottom: `1px solid ${ROW_BORDER}`,
              outline: "none", background: "transparent", padding: "0 2px",
            }}
          />
          <span style={{ color: "#AAA" }}>–</span>
          <input
            type="number" placeholder="2025"
            value={filters.yearTo}
            onChange={e => handleFilterChange("yearTo", e.target.value)}
            style={{
              width: 52, fontFamily: FONT, fontSize: 12,
              border: 0, borderBottom: `1px solid ${ROW_BORDER}`,
              outline: "none", background: "transparent", padding: "0 2px",
            }}
          />

          {hasActive && (
            <>
              <span style={{ color: "#CCC" }}>|</span>
              <FilterBtn
                label="초기화 ×"
                active={true}
                activeColor={ACCENT}
                onClick={() => handleFilterChange("reset")}
              />
            </>
          )}
        </div>

        {/* ─────────────────────────────────────────
            에러 메시지
        ───────────────────────────────────────── */}
        {error && (
          <div style={{
            fontFamily: FONT, fontSize: 12,
            padding: "6px 0", color: ACCENT,
            borderTop: `1px solid ${ROW_BORDER}`,
          }}>
            오류: {error}
          </div>
        )}

        {/* ─────────────────────────────────────────
            리스트뷰
        ───────────────────────────────────────── */}
        {view === "list" && (
          <>
            {/* 로딩 */}
            {loading && (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  <tr>
                    <td style={{
                      fontFamily: FONT, fontSize: 12,
                      padding: "32px 0 32px 16px",
                      borderTop: `1px solid ${ROW_BORDER}`,
                      color: MUTED,
                    }}>
                      <span style={{
                        display: "inline-block",
                        width: 11, height: 11,
                        border: "1.5px solid #DDD",
                        borderTop: "1.5px solid #999",
                        borderRadius: "50%",
                        animation: "spin 0.8s linear infinite",
                        marginRight: 8,
                        verticalAlign: "middle",
                      }} />
                      조회 중…
                    </td>
                  </tr>
                </tbody>
              </table>
            )}

            {/* 결과 없음 */}
            {!loading && !error && display.length === 0 && (
              <div style={{
                fontFamily: FONT, fontSize: 12,
                padding: "14px 0 14px 16px",
                borderTop: `1px solid ${ROW_BORDER}`,
                color: MUTED,
              }}>
                {hasActive ? "현재 필터 조건에 맞는 수감자가 없습니다." : "검색 결과가 없습니다."}
              </div>
            )}

            {/* 결과 카운트 */}
            {!loading && display.length > 0 && (
              <div style={{
                fontFamily: FONT, fontSize: 11, color: MUTED,
                padding: "4px 0",
                borderTop: `1px solid ${ROW_BORDER}`,
              }}>
                {hasActive
                  ? `${display.length}명 / 필터 결과 (페이지 내 ${books.length}명 중)`
                  : `${books.length}명 / 이 페이지`}
              </div>
            )}

            {/* 테이블 */}
            {!loading && display.length > 0 && (
              <ListView
                books={display}
                pageOffset={(pn - 1) * PER_PAGE}
                sortCol={sortCol}
                sortDir={sortDir}
                onSort={toggleSort}
                expandedId={expandedId}
                onToggle={id => setExpandedId(prev => prev === id ? null : id)}
              />
            )}
          </>
        )}

        {/* ─────────────────────────────────────────
            그리드뷰 (죄수복 카드)
        ───────────────────────────────────────── */}
        {view === "grid" && (
          <>
            {loading && (
              <div style={{
                fontFamily: FONT, fontSize: 12,
                padding: "40px 0", color: MUTED, textAlign: "center",
                borderTop: `1px solid ${ROW_BORDER}`,
              }}>
                조회 중…
              </div>
            )}
            {!loading && display.length > 0 && (
              <div style={{ paddingTop: 20 }}>
                <GridView
                  books={display}
                  expandedId={expandedId}
                  onToggle={id => setExpandedId(prev => prev === id ? null : id)}
                />
              </div>
            )}
          </>
        )}

        {/* 페이지네이션 */}
        {!loading && (
          <Pager pn={pn} totalPages={totalPages} onLoad={p => load(p, q)} />
        )}
      </main>

      {/* 푸터 */}
      <footer style={{
        borderTop:      `1px solid ${ROW_BORDER}`,
        padding:        "6px 24px",
        display:        "flex",
        justifyContent: "space-between",
        alignItems:     "center",
        fontFamily:     FONT,
        fontSize:       11,
        color:          MUTED,
      }}>
        <span>Prison of Literature — 서지교정국 — Dept. of Library Corrections</span>
        <span>국립중앙도서관 오픈 API</span>
      </footer>
    </>
  );
}

/* ── 필터 버튼 (인라인 — 호버 상태 관리) ── */
function FilterBtn({ label, active, activeColor, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        fontFamily: FONT, fontSize: 12,
        fontWeight: active ? "bold" : "normal",
        color: (active || hov) ? activeColor : "#AAA",
        background: "none", border: "none", padding: 0,
        cursor: "pointer",
        transition: "color 0.1s",
      }}
    >
      {label}
    </button>
  );
}
