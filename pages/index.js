import React, { useState, useEffect, useCallback, useRef } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { parse, ST } from "../lib/helpers";

const ACCENT  = "#C62828";
const MUTED   = "#767676";
const BORDER  = "#E8E8E8";
const PER_PAGE = 30;

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

/* ── 스피너 ── */
function Spinner() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
                  justifyContent: "center", padding: "80px 0", gap: 14, color: MUTED }}>
      <div style={{
        width: 20, height: 20,
        border: "2px solid #E0E0E0",
        borderTop: "2px solid #999",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }} />
      <span style={{ fontSize: 12, letterSpacing: "0.1em" }}>조회 중…</span>
    </div>
  );
}

/* ── 상태 뱃지 ── */
function StatusBadge({ status }) {
  const s = ST[status];
  if (!s) return null;
  return (
    <span style={{
      display:       "inline-block",
      padding:       "2px 8px",
      fontSize:      10,
      fontWeight:    600,
      letterSpacing: "0.06em",
      background:    s.bg,
      color:         s.c,
      border:        `1px solid ${s.c}33`,
      whiteSpace:    "nowrap",
    }}>
      {s.ko}
    </span>
  );
}

/* ── 정렬 가능 컬럼 헤더 ── */
function SortTh({ col, label, sortCol, sortDir, onSort, style }) {
  const active = sortCol === col;
  return (
    <th
      className="sort-th"
      onClick={() => onSort(col)}
      style={{
        padding:       "9px 12px",
        textAlign:     "left",
        fontSize:      10,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color:         active ? "#111" : MUTED,
        borderBottom:  "2px solid #111",
        cursor:        "pointer",
        userSelect:    "none",
        whiteSpace:    "nowrap",
        transition:    "color 0.15s",
        ...style,
      }}
    >
      {label}
      <span style={{ marginLeft: 4, fontSize: 9, opacity: active ? 1 : 0.35 }}>
        {active ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
      </span>
    </th>
  );
}

/* ── 인라인 상세 패널 ── */
function InlineDetail({ book }) {
  const rows = [
    ["수감자명",   book.title],
    ["저자",       book.creator || "—"],
    ["수인번호",   book.callNo || "—"],
    ["ISBN",       book.isbn || "—"],
    ["발행연도",   book.year || "—"],
    ["판형",       book.prisonSize + (book.height !== "—" ? ` (${book.height})` : "")],
    ["페이지수",   book.pages],
    ["발행지",     book.pubPlace || "—"],
    ["소장위치",   book.holding || "—"],
    ["자료분류",   book.charges],
    ["키워드",     book.keyword || "—"],
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "4px 24px" }}>
      {rows.map(([k, v]) => (
        <div key={k} style={{ display: "flex", gap: 8, padding: "3px 0",
                               borderBottom: "1px solid #F0F0F0", fontSize: 12 }}>
          <span style={{ color: MUTED, minWidth: 70, flexShrink: 0 }}>{k}</span>
          <span style={{ color: "#111", wordBreak: "break-word" }}>{v}</span>
        </div>
      ))}
      {book.abstract && (
        <div style={{ gridColumn: "1/-1", marginTop: 8, fontSize: 12,
                      color: "#444", lineHeight: 1.8, borderTop: "1px solid #F0F0F0", paddingTop: 8 }}>
          {book.abstract}
        </div>
      )}
    </div>
  );
}

/* ── 리스트 뷰 ── */
function ListView({ books, sortCol, sortDir, onSort, expandedId, onToggle }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
        <thead>
          <tr>
            <th style={{ padding: "9px 12px", fontSize: 10, letterSpacing: "0.12em",
                         textTransform: "uppercase", color: MUTED,
                         borderBottom: "2px solid #111", width: 48 }}>No.</th>
            <SortTh col="title"   label="수감자명" {...{sortCol, sortDir, onSort}} />
            <SortTh col="creator" label="저자"     {...{sortCol, sortDir, onSort}} />
            <SortTh col="year"    label="발행"     {...{sortCol, sortDir, onSort}} style={{ width: 64 }} />
            <SortTh col="prisonSize" label="판형"  {...{sortCol, sortDir, onSort}} style={{ width: 56 }} />
            <SortTh col="callNo"  label="수인번호" {...{sortCol, sortDir, onSort}} style={{ width: 130 }} />
            <SortTh col="status"  label="접견상태" {...{sortCol, sortDir, onSort}} style={{ width: 96 }} />
          </tr>
        </thead>
        <tbody>
          {books.map((book, i) => {
            const expanded = expandedId === book.id;
            return (
              <React.Fragment key={book.id}>
                <tr
                  className="book-row"
                  onClick={() => onToggle(book.id)}
                  style={{
                    borderBottom: expanded ? "none" : "1px solid #EBEBEB",
                    background:   expanded ? "#FAFAFA" : "transparent",
                    cursor:       "pointer",
                  }}
                >
                  <td style={{ padding: "10px 12px", fontSize: 11, color: "#BBB",
                               fontVariantNumeric: "tabular-nums" }}
                      className="row-num">
                    {String(i + 1).padStart(3, "0")}
                  </td>
                  <td style={{ padding: "10px 12px", fontSize: 13, fontWeight: 500, maxWidth: 280 }}>
                    <span style={{ display: "block", overflow: "hidden",
                                   textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {book.title}
                    </span>
                  </td>
                  <td style={{ padding: "10px 12px", fontSize: 12, color: "#444",
                               maxWidth: 160 }}>
                    <span style={{ display: "block", overflow: "hidden",
                                   textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {book.creator || "—"}
                    </span>
                  </td>
                  <td style={{ padding: "10px 12px", fontSize: 12, color: "#555",
                               fontVariantNumeric: "tabular-nums" }}>
                    {book.year || "—"}
                  </td>
                  <td style={{ padding: "10px 12px", fontSize: 11, color: "#555",
                               textAlign: "center" }}>
                    {book.prisonSize}
                  </td>
                  <td style={{ padding: "10px 12px", fontSize: 11, color: "#555",
                               fontFamily: "Courier New, monospace" }}>
                    {book.callNo || "—"}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <StatusBadge status={book.status} />
                  </td>
                </tr>
                {expanded && (
                  <tr style={{ background: "#FAFAFA" }}>
                    <td colSpan={7} style={{
                      padding:      "14px 14px 20px 52px",
                      borderBottom: "2px solid #E0E0E0",
                    }}>
                      <InlineDetail book={book} />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ── CSS 죄수복 카드 ── */
function UniformCard({ book, onToggle, expanded }) {
  const barColor    = STATUS_BAR[book.status] ?? "#999";
  const [s1, s2]    = STRIPE[book.status] ?? ["#F5F5F5", "#E8E8E8"];
  const [imgError, setImgError] = useState(false);
  const hasCover = book.isbn && !imgError;

  return (
    <div
      className="uniform-card fade-in"
      onClick={() => onToggle(book.id)}
      style={{
        border:   `1px solid ${BORDER}`,
        background: "#FFF",
        outline:  expanded ? `2px solid ${ACCENT}` : "none",
      }}
    >
      {/* 상태 컬러 바 */}
      <div style={{ height: 3, background: barColor }} />

      {/* 카드 이미지 영역 */}
      <div style={{
        aspectRatio: "2/3",
        background: hasCover ? "#F5F5F5" :
          `repeating-linear-gradient(0deg,${s1} 0px,${s1} 11px,${s2} 11px,${s2} 13px)`,
        display:        "flex",
        flexDirection:  "column",
        alignItems:     "center",
        justifyContent: "center",
        padding:        "12px 10px",
        gap:            10,
        position:       "relative",
        overflow:       "hidden",
      }}>
        {hasCover ? (
          <img
            src={`https://covers.openlibrary.org/b/isbn/${book.isbn}-M.jpg`}
            alt={book.title}
            onError={() => setImgError(true)}
            onLoad={e => { e.currentTarget.style.opacity = "1"; }}
            style={{
              width:      "100%",
              height:     "100%",
              objectFit:  "cover",
              position:   "absolute",
              inset:      0,
              opacity:    0,
              transition: "opacity 400ms ease-out",
            }}
          />
        ) : (
          <>
            {/* 수인번호 */}
            <div style={{
              fontFamily:    "Courier New, monospace",
              fontSize:      "clamp(14px, 2.5vw, 22px)",
              fontWeight:    700,
              letterSpacing: "0.08em",
              color:         "#333",
              textAlign:     "center",
              lineHeight:    1.3,
              zIndex:        1,
            }}>
              {(book.callNo || book.id).slice(0, 10)}
            </div>

            <StatusBadge status={book.status} />

            {/* 판형 */}
            <div style={{
              position:      "absolute",
              bottom:        8,
              right:         10,
              fontSize:      11,
              fontWeight:    700,
              letterSpacing: "0.1em",
              color:         "rgba(0,0,0,0.25)",
            }}>
              {book.prisonSize}
            </div>
          </>
        )}
      </div>

      {/* 카드 하단 텍스트 */}
      <div style={{ padding: "8px 10px 10px" }}>
        <div style={{
          fontSize:         12,
          fontWeight:       600,
          lineHeight:       1.4,
          overflow:         "hidden",
          display:          "-webkit-box",
          WebkitLineClamp:  2,
          WebkitBoxOrient:  "vertical",
          marginBottom:     3,
          color:            "#111",
        }}>
          {book.title}
        </div>
        <div style={{ fontSize: 11, color: MUTED,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {book.creator || "—"}
        </div>
      </div>

      {/* 확장 상세 */}
      {expanded && (
        <div style={{
          borderTop: `1px solid ${BORDER}`,
          padding:   "12px 10px",
          background: "#FAFAFA",
        }}>
          <InlineDetail book={book} />
        </div>
      )}
    </div>
  );
}

/* ── 썸네일 그리드 뷰 ── */
function GridView({ books, expandedId, onToggle }) {
  return (
    <div style={{
      display:             "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
      gap:                 20,
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

/* ── 패싯 필터 — 사이드바 (리스트뷰) ── */
function FilterSidebar({ filters, onChange }) {
  const sectionStyle = { marginBottom: 20 };
  const labelStyle   = {
    fontSize: 10, letterSpacing: "0.12em",
    textTransform: "uppercase", color: "#999", marginBottom: 8,
    display: "block",
  };
  const checkLabelStyle = {
    display: "flex", alignItems: "center", gap: 7,
    fontSize: 12, color: "#333", marginBottom: 6, cursor: "pointer",
  };

  return (
    <aside style={{ width: 160, flexShrink: 0 }}>
      <span style={{ ...labelStyle, marginBottom: 16 }}>Filters</span>

      {/* 접견 상태 */}
      <div style={sectionStyle}>
        <span style={labelStyle}>접견 상태</span>
        {[
          { key: "AVAILABLE",   label: "접견가능" },
          { key: "CHECKED_OUT", label: "접견중" },
          { key: "RESTRICTED",  label: "접견불가" },
        ].map(({ key, label }) => (
          <label key={key} style={checkLabelStyle}>
            <input
              type="checkbox"
              checked={filters.status.includes(key)}
              onChange={() => onChange("status", key)}
            />
            <span style={{ color: ST[key]?.c }}>{label}</span>
          </label>
        ))}
      </div>

      {/* 발행 연도 */}
      <div style={sectionStyle}>
        <span style={labelStyle}>발행 연도</span>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <input
            type="number"
            placeholder="1900"
            value={filters.yearFrom}
            onChange={e => onChange("yearFrom", e.target.value)}
            style={{ width: 60, padding: "4px 6px", fontSize: 11,
                     border: "1px solid #DDD", outline: "none" }}
          />
          <span style={{ fontSize: 11, color: "#999" }}>–</span>
          <input
            type="number"
            placeholder="2025"
            value={filters.yearTo}
            onChange={e => onChange("yearTo", e.target.value)}
            style={{ width: 60, padding: "4px 6px", fontSize: 11,
                     border: "1px solid #DDD", outline: "none" }}
          />
        </div>
      </div>

      {/* 자료 분류 */}
      <div style={sectionStyle}>
        <span style={labelStyle}>자료 분류</span>
        {[
          { key: "GENERAL",            label: "일반" },
          { key: "SPECIAL COLLECTION", label: "특별소장" },
          { key: "RESTRICTED",         label: "접근제한" },
        ].map(({ key, label }) => (
          <label key={key} style={checkLabelStyle}>
            <input
              type="checkbox"
              checked={filters.classification.includes(key)}
              onChange={() => onChange("classification", key)}
            />
            <span>{label}</span>
          </label>
        ))}
      </div>
    </aside>
  );
}

/* ── 패싯 필터 — pill 태그 (썸네일뷰) ── */
function FilterPills({ filters, onChange }) {
  const pills = [
    { group: "status",         key: "AVAILABLE",            label: "접견가능" },
    { group: "status",         key: "CHECKED_OUT",          label: "접견중" },
    { group: "status",         key: "RESTRICTED",           label: "접견불가" },
    { group: "classification", key: "GENERAL",              label: "일반" },
    { group: "classification", key: "SPECIAL COLLECTION",   label: "특별소장" },
    { group: "classification", key: "RESTRICTED",           label: "접근제한" },
  ];

  const hasActive = filters.status.length > 0 || filters.classification.length > 0
    || filters.yearFrom || filters.yearTo;

  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
      {pills.map(({ group, key, label }) => {
        const active = filters[group].includes(key);
        return (
          <button
            key={`${group}-${key}`}
            className={`filter-pill${active ? " active" : ""}`}
            onClick={() => onChange(group, key)}
            style={{
              padding:       "4px 12px",
              borderRadius:  100,
              border:        "1px solid",
              borderColor:   active ? "#111" : "#DDD",
              background:    active ? "#111" : "#FFF",
              color:         active ? "#FFF" : "#555",
              fontSize:      11,
              letterSpacing: "0.04em",
              transition:    "all 0.15s",
            }}
          >
            {label}
          </button>
        );
      })}
      {/* 연도 범위 인풋 */}
      <input
        type="number" placeholder="연도 시작"
        value={filters.yearFrom}
        onChange={e => onChange("yearFrom", e.target.value)}
        style={{ width: 80, padding: "4px 8px", fontSize: 11,
                 border: "1px solid #DDD", borderRadius: 100, outline: "none",
                 textAlign: "center" }}
      />
      <span style={{ fontSize: 11, color: "#999" }}>–</span>
      <input
        type="number" placeholder="연도 끝"
        value={filters.yearTo}
        onChange={e => onChange("yearTo", e.target.value)}
        style={{ width: 80, padding: "4px 8px", fontSize: 11,
                 border: "1px solid #DDD", borderRadius: 100, outline: "none",
                 textAlign: "center" }}
      />
      {hasActive && (
        <button
          onClick={() => onChange("reset")}
          style={{
            padding:       "4px 12px",
            borderRadius:  100,
            border:        `1px solid ${ACCENT}`,
            background:    "transparent",
            color:         ACCENT,
            fontSize:      11,
            cursor:        "pointer",
          }}
        >
          초기화 ×
        </button>
      )}
    </div>
  );
}

/* ── 뷰 토글 버튼 ── */
function ViewToggle({ view, onSwitch }) {
  return (
    <div style={{ display: "flex" }}>
      {[
        { id: "list", icon: "≡", label: "List" },
        { id: "grid", icon: "⊞", label: "Grid" },
      ].map(({ id, icon, label }) => (
        <button
          key={id}
          title={label}
          onClick={() => onSwitch(id)}
          style={{
            padding:     "6px 12px",
            fontSize:    14,
            border:      "1px solid",
            borderColor: view === id ? "#111" : "#DDD",
            background:  view === id ? "#111" : "#FFF",
            color:       view === id ? "#FFF" : "#999",
            cursor:      "pointer",
            transition:  "all 0.15s",
            lineHeight:  1,
            marginLeft:  -1,
          }}
        >
          {icon}
        </button>
      ))}
    </div>
  );
}

/* ── 페이지네이션 ── */
function Pager({ pn, totalPages, onLoad }) {
  if (totalPages <= 1) return null;
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center",
                  gap: 16, padding: "36px 0" }}>
      <button
        disabled={pn <= 1}
        onClick={() => { onLoad(pn - 1); window.scrollTo(0, 0); }}
        style={{
          fontSize:      11,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color:         pn <= 1 ? "#DDD" : "#555",
          borderBottom:  pn <= 1 ? "1px solid transparent" : "1px solid #555",
          paddingBottom: 1,
          transition:    "color 0.15s",
        }}
      >
        ← Prev
      </button>
      <span style={{ fontSize: 11, color: "#BBB", letterSpacing: "0.1em" }}>
        {pn} / {totalPages > 9999 ? "…" : totalPages}
      </span>
      <button
        disabled={pn >= totalPages}
        onClick={() => { onLoad(pn + 1); window.scrollTo(0, 0); }}
        style={{
          fontSize:      11,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color:         pn >= totalPages ? "#DDD" : "#555",
          borderBottom:  pn >= totalPages ? "1px solid transparent" : "1px solid #555",
          paddingBottom: 1,
          transition:    "color 0.15s",
        }}
      >
        Next →
      </button>
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
  const [view,       setView]       = useState("list");   // "list" | "grid"
  const [q,          setQ]          = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [sortCol,    setSortCol]    = useState("title");
  const [sortDir,    setSortDir]    = useState("asc");
  const [filters,    setFilters]    = useState({
    status:         [],
    yearFrom:       "",
    yearTo:         "",
    classification: [],
  });

  /* ── URL 쿼리 → 상태 초기화 ── */
  useEffect(() => {
    const { view: v, q: qv } = router.query;
    if (v === "grid" || v === "list") setView(v);
    if (qv) setQ(String(qv));
  }, [router.isReady]);  // eslint-disable-line react-hooks/exhaustive-deps

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
      setBooks((body?.items ?? []).map(parse));
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

  /* ── 초기 로드 ── */
  useEffect(() => { load(1); }, [load]);

  /* ── 검색 제출 (디바운스 없이 엔터/버튼) ── */
  const searchRef = useRef(q);
  searchRef.current = q;
  const handleSearch = useCallback((e) => {
    e.preventDefault();
    load(1, searchRef.current);
    router.replace({ query: { ...router.query, q: searchRef.current || undefined } },
      undefined, { shallow: true });
  }, [load, router]);

  /* ── 필터 핸들러 ── */
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
      return {
        ...prev,
        [group]: arr.includes(key) ? arr.filter(v => v !== key) : [...arr, key],
      };
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

  /* ── 클라이언트 필터 + 정렬 적용 ── */
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

  const hasActiveFilters = filters.status.length > 0
    || filters.classification.length > 0
    || filters.yearFrom || filters.yearTo;

  return (
    <>
      <Head>
        <title>PRISON OF LITERATURE — 수감자 명부</title>
      </Head>

      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px 60px" }}>

        {/* ── 페이지 타이틀 ── */}
        <div style={{
          padding:       "28px 0 20px",
          borderBottom:  "1px solid #E8E8E8",
          display:       "flex",
          alignItems:    "baseline",
          justifyContent:"space-between",
          flexWrap:      "wrap",
          gap:           8,
        }}>
          <div>
            <h1 style={{
              fontFamily:    "'Noto Serif KR', Georgia, serif",
              fontSize:      22,
              fontWeight:    700,
              letterSpacing: "0.02em",
              color:         "#111",
            }}>
              수감자 명부
            </h1>
            <p style={{ fontSize: 11, color: MUTED, marginTop: 4, letterSpacing: "0.05em" }}>
              Dept. of Library Corrections — 서지교정국
            </p>
          </div>
          {total !== null && (
            <div style={{ textAlign: "right" }}>
              <span style={{
                fontFamily:    "Courier New, monospace",
                fontSize:      20,
                fontWeight:    700,
                color:         "#111",
                letterSpacing: "0.05em",
              }}>
                {total.toLocaleString()}
              </span>
              <span style={{ fontSize: 10, color: MUTED, marginLeft: 6, letterSpacing: "0.1em" }}>
                명 수감 중
              </span>
            </div>
          )}
        </div>

        {/* ── 검색바 + 뷰 토글 ── */}
        <div style={{
          padding:       "16px 0",
          display:       "flex",
          gap:           10,
          alignItems:    "center",
          borderBottom:  "1px solid #E8E8E8",
          flexWrap:      "wrap",
        }}>
          <form onSubmit={handleSearch} style={{ flex: 1, display: "flex", minWidth: 200 }}>
            <input
              type="text"
              placeholder="Search Inmate"
              value={q}
              onChange={e => setQ(e.target.value)}
              style={{
                flex:         1,
                padding:      "8px 14px",
                fontSize:     13,
                border:       "1px solid #DDD",
                borderRight:  "none",
                outline:      "none",
                color:        "#111",
                background:   "#FFF",
                transition:   "border-color 0.15s",
              }}
              onFocus={e  => (e.target.style.borderColor = "#999")}
              onBlur={e   => (e.target.style.borderColor = "#DDD")}
            />
            <button
              type="submit"
              style={{
                padding:     "8px 16px",
                fontSize:    12,
                letterSpacing:"0.1em",
                border:      "1px solid #DDD",
                background:  "#111",
                color:       "#FFF",
                cursor:      "pointer",
                whiteSpace:  "nowrap",
                transition:  "background 0.15s",
              }}
            >
              검색
            </button>
          </form>

          <ViewToggle view={view} onSwitch={switchView} />
        </div>

        {/* ── 썸네일뷰: pill 필터 ── */}
        {view === "grid" && (
          <div style={{ padding: "12px 0", borderBottom: "1px solid #E8E8E8" }}>
            <FilterPills filters={filters} onChange={handleFilterChange} />
          </div>
        )}

        {/* ── 본문: 필터 사이드바 + 리스트/그리드 ── */}
        <div style={{
          display:   "flex",
          gap:       32,
          paddingTop: 24,
          alignItems: "flex-start",
        }}>
          {/* 리스트뷰 전용 사이드바 필터 */}
          {view === "list" && (
            <FilterSidebar filters={filters} onChange={handleFilterChange} />
          )}

          {/* 콘텐츠 영역 */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* 에러 */}
            {error && (
              <div style={{
                padding:    "14px 16px",
                background: "#FFF5F5",
                border:     "1px solid #FFCDD2",
                color:      "#B71C1C",
                fontSize:   13,
                marginBottom: 16,
              }}>
                오류: {error}
              </div>
            )}

            {/* 로딩 */}
            {loading && <Spinner />}

            {/* 결과 없음 */}
            {!loading && !error && display.length === 0 && (
              <div style={{ padding: "60px 0", textAlign: "center",
                            fontSize: 13, color: MUTED }}>
                {hasActiveFilters
                  ? "현재 필터 조건에 맞는 수감자가 없습니다."
                  : "검색 결과가 없습니다."}
              </div>
            )}

            {/* 필터 결과 카운트 */}
            {!loading && display.length > 0 && (
              <div style={{
                fontSize:    11,
                color:       MUTED,
                marginBottom: 12,
                letterSpacing: "0.05em",
              }}>
                {hasActiveFilters
                  ? `${display.length}명 표시 중 (전체 ${books.length}명 중)`
                  : `${books.length}명 / 이 페이지`}
              </div>
            )}

            {/* 리스트뷰 */}
            {!loading && view === "list" && display.length > 0 && (
              <ListView
                books={display}
                sortCol={sortCol}
                sortDir={sortDir}
                onSort={toggleSort}
                expandedId={expandedId}
                onToggle={id => setExpandedId(prev => prev === id ? null : id)}
              />
            )}

            {/* 썸네일뷰 */}
            {!loading && view === "grid" && display.length > 0 && (
              <GridView
                books={display}
                expandedId={expandedId}
                onToggle={id => setExpandedId(prev => prev === id ? null : id)}
              />
            )}

            {/* 페이지네이션 */}
            {!loading && (
              <Pager pn={pn} totalPages={totalPages} onLoad={p => load(p, q)} />
            )}
          </div>
        </div>
      </main>

      <footer style={{
        borderTop:  "1px solid #E8E8E8",
        padding:    "16px 24px",
        display:    "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap:   "wrap",
        gap:        8,
      }}>
        <span style={{ fontSize: 10, letterSpacing: "0.2em",
                       color: MUTED, textTransform: "uppercase" }}>
          Prison of Literature — 서지교정국
        </span>
        <span style={{ fontSize: 10, letterSpacing: "0.1em", color: "#BBB" }}>
          국립중앙도서관 오픈 API
        </span>
      </footer>
    </>
  );
}
