import { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { parse, ST, CC } from "../lib/helpers";

const FONTS =
  "https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&family=Noto+Serif+KR:wght@400;700&display=swap";

const DARK = "#0D0D0D";
const CREAM = "#F5F0E8";

/* ── Badge ── */
function Badge({ s }) {
  return (
    <span style={{
      display: "inline-block", padding: "2px 8px",
      fontSize: 10, fontWeight: 600, letterSpacing: "0.1em",
      border: `1px solid ${ST[s].c}`,
      color: ST[s].c, background: "transparent",
    }}>
      {ST[s].ko}
    </span>
  );
}

/* ── Loader ── */
function Loader() {
  return (
    <div style={{ textAlign: "center", padding: 80, color: "rgba(245,240,232,0.3)", fontSize: 13 }}>
      <div style={{
        width: 20, height: 20,
        border: "1px solid rgba(245,240,232,0.15)",
        borderTop: "1px solid rgba(245,240,232,0.6)",
        borderRadius: "50%",
        animation: "spin .8s linear infinite",
        margin: "0 auto 12px",
      }} />
      조회 중…
    </div>
  );
}

/* ── Pager ── */
function Pager({ pn, tp, load }) {
  return (
    <div style={{
      display: "flex", justifyContent: "center", alignItems: "center",
      gap: 16, padding: "40px 0",
    }}>
      <button
        disabled={pn <= 1}
        onClick={() => { load(pn - 1); window.scrollTo(0, 0); }}
        style={{
          fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase",
          color: pn <= 1 ? "rgba(245,240,232,0.15)" : "rgba(245,240,232,0.5)",
          padding: "6px 0",
          borderBottom: pn <= 1 ? "1px solid transparent" : "1px solid rgba(245,240,232,0.25)",
          transition: "color 0.2s",
        }}
      >← Prev</button>
      <span style={{ fontSize: 11, color: "rgba(245,240,232,0.25)", letterSpacing: "0.15em" }}>
        {pn} / {tp > 9999 ? "…" : tp}
      </span>
      <button
        disabled={pn >= tp}
        onClick={() => { load(pn + 1); window.scrollTo(0, 0); }}
        style={{
          fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase",
          color: pn >= tp ? "rgba(245,240,232,0.15)" : "rgba(245,240,232,0.5)",
          padding: "6px 0",
          borderBottom: pn >= tp ? "1px solid transparent" : "1px solid rgba(245,240,232,0.25)",
          transition: "color 0.2s",
        }}
      >Next →</button>
    </div>
  );
}

/* ── Stamp ── */
function Stamp({ color, text, children }) {
  return (
    <div style={{ textAlign: "center", padding: "32px 0" }}>
      <div style={{
        display: "inline-block",
        padding: "8px 32px",
        border: `2px solid ${color}`,
        color,
        fontSize: 20, fontWeight: 700, letterSpacing: "0.4em",
        fontFamily: "'Noto Serif KR', Georgia, serif",
        transform: "rotate(-2deg)",
        marginBottom: 20,
      }}>
        {text}
      </div>
      <div style={{
        fontSize: 14, lineHeight: 1.8,
        color: "rgba(245,240,232,0.6)",
        marginTop: 8,
      }}>
        {children}
      </div>
    </div>
  );
}

/* ── InfoBox ── */
function InfoBox({ title, color, children }) {
  return (
    <div style={{
      padding: "12px 16px",
      background: "rgba(245,240,232,0.03)",
      borderLeft: `2px solid ${color}`,
      marginBottom: 14,
    }}>
      <div style={{ fontSize: 10, fontWeight: 600, color, marginBottom: 4, letterSpacing: "0.15em", textTransform: "uppercase" }}>{title}</div>
      <div style={{ fontSize: 13, lineHeight: 1.75, color: "rgba(245,240,232,0.55)" }}>{children}</div>
    </div>
  );
}

export default function Books() {
  const router = useRouter();

  const [pg, setPg] = useState("list"); // list | detail | visit
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [total, setTotal] = useState(0);
  const [pn, setPn] = useState(1);
  const rows = 20;

  const [q, setQ] = useState("");
  const [searchField, setSearchField] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const [viewMode, setViewMode] = useState("list"); // list | gallery
  const [searchOpen, setSearchOpen] = useState(false);
  const [localQ, setLocalQ] = useState("");
  const [scrolled, setScrolled] = useState(false);

  const [sel, setSel] = useState(null);
  const [vf, setVf] = useState({ n: "", r: "", s: "", a: false });
  const [vs, setVs] = useState(false);

  /* URL 쿼리 파라미터로 초기 검색어 설정 */
  useEffect(() => {
    if (router.query.q) {
      setQ(router.query.q);
      setLocalQ(router.query.q);
    }
  }, [router.query.q]);

  /* 스크롤 감지 */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ESC 키 처리 */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        if (searchOpen) setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchOpen]);

  const load = useCallback(async (p = 1) => {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(`/api/books?pageNo=${p}&numOfRows=${rows}&koreanOnly=true`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const d = await res.json();
      if (d?.error) throw new Error(d.error);
      if (d?.header?.resultCode && d.header.resultCode !== "00")
        throw new Error(d.header.resultMsg || "API 오류");
      const b = d?.body || d;
      setBooks((b?.items || []).map(parse));
      setTotal(b?.totalCount || 0);
      setPn(p);
    } catch (e) {
      setErr(e.message);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(1); }, [load]);

  /* 클라이언트 사이드 필터 */
  let display = [...books];
  if (q.trim()) {
    const s = q.toLowerCase();
    display = display.filter((b) => {
      if (searchField === "title") return (b.title + b.label).toLowerCase().includes(s);
      if (searchField === "creator") return b.creator.toLowerCase().includes(s);
      return (b.title + b.label + b.creator + b.isbn + b.callNo).toLowerCase().includes(s);
    });
  }
  if (statusFilter !== "all") display = display.filter((b) => b.status === statusFilter);
  if (sortBy === "title") display.sort((a, b) => a.title.localeCompare(b.title, "ko"));
  else if (sortBy === "creator") display.sort((a, b) => (a.creator || "").localeCompare(b.creator || "", "ko"));
  else if (sortBy === "year") display.sort((a, b) => (a.year || "").localeCompare(b.year || ""));

  const tp = Math.ceil(total / rows);

  const open = (b) => {
    setSel(b);
    setPg("detail");
    setVs(false);
    setVf({ n: "", r: "", s: "", a: false });
    window.scrollTo(0, 0);
  };
  const backToList = () => { setPg("list"); window.scrollTo(0, 0); };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setQ(localQ);
    setSearchOpen(false);
  };

  const navLinkStyle = (active) => ({
    fontSize: 12, letterSpacing: "0.15em", textTransform: "uppercase",
    color: active ? CREAM : "rgba(245,240,232,0.4)",
    padding: "4px 0",
    borderBottom: active ? "1px solid rgba(245,240,232,0.5)" : "1px solid transparent",
    transition: "color 0.2s, border-color 0.2s",
    cursor: "pointer",
    background: "none", border: "none",
    fontFamily: "inherit",
  });

  return (
    <>
      <Head>
        <title>Index — Prison of Literature</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={FONTS} rel="stylesheet" />
      </Head>

      <style jsx global>{`
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body {
          font-family: 'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif;
          background: ${DARK};
          color: ${CREAM};
          -webkit-font-smoothing: antialiased;
          overflow-x: hidden;
        }
        a { color: inherit; text-decoration: none; }
        button { cursor: pointer; font-family: inherit; background: none; border: none; }
        input, select, textarea { font-family: inherit; }

        @keyframes spin { to { transform: rotate(360deg); } }

        /* Nav link hover */
        .nav-link {
          position: relative;
          display: inline-block;
          padding: 4px 0;
          font-size: 12px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(245,240,232,0.4);
          transition: color 0.2s;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0;
          width: 0; height: 1px;
          background: ${CREAM};
          transition: width 0.25s ease;
        }
        .nav-link:hover { color: ${CREAM}; }
        .nav-link:hover::after { width: 100%; }

        /* Search overlay */
        .search-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.96);
          z-index: 200;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          opacity: 0; pointer-events: none;
          transition: opacity 0.25s ease;
        }
        .search-overlay.open { opacity: 1; pointer-events: all; }

        /* List view rows */
        .book-row { transition: background 0.12s; }
        .book-row:hover { background: rgba(245,240,232,0.04) !important; }
        .book-row:hover .row-num { color: #C62828 !important; }

        /* Gallery cards */
        .gallery-card { position: relative; overflow: hidden; cursor: pointer; }
        .gallery-card .card-cover {
          width: 100%; aspect-ratio: 3/4;
          filter: grayscale(100%);
          transition: filter 0.4s ease;
          display: flex; align-items: center; justify-content: center;
          position: relative;
        }
        .gallery-card:hover .card-cover { filter: grayscale(0%); }
        .gallery-card .card-overlay {
          position: absolute; bottom: 0; left: 0; right: 0;
          padding: 20px 14px 14px;
          background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%);
          transform: translateY(100%);
          transition: transform 0.35s ease;
        }
        .gallery-card:hover .card-overlay { transform: translateY(0); }

        /* View toggle */
        .view-btn {
          font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase;
          padding: 6px 16px;
          border: 1px solid rgba(245,240,232,0.15);
          color: rgba(245,240,232,0.4);
          transition: all 0.15s;
        }
        .view-btn.active {
          background: ${CREAM};
          color: ${DARK};
          border-color: ${CREAM};
        }
        .view-btn:not(.active):hover {
          border-color: rgba(245,240,232,0.4);
          color: rgba(245,240,232,0.7);
        }

        /* Detail grid */
        .meta-grid { display: grid; grid-template-columns: 1fr 1fr; }
        .meta-cell {
          padding: 10px 14px;
          border-bottom: 1px solid rgba(245,240,232,0.06);
          border-right: 1px solid rgba(245,240,232,0.06);
        }

        /* Form inputs */
        .form-input {
          width: 100%;
          padding: 10px 14px;
          background: rgba(245,240,232,0.04);
          border: 1px solid rgba(245,240,232,0.12);
          color: ${CREAM};
          font-size: 13px;
          outline: none;
          transition: border-color 0.2s;
        }
        .form-input:focus { border-color: rgba(245,240,232,0.35); }
      `}</style>

      {/* ── SEARCH OVERLAY ── */}
      <div className={`search-overlay${searchOpen ? " open" : ""}`}>
        <button
          onClick={() => setSearchOpen(false)}
          style={{ position: "absolute", top: 28, right: 32, color: "rgba(245,240,232,0.4)", fontSize: 28, lineHeight: 1 }}
          aria-label="닫기"
        >×</button>
        <div style={{ width: "100%", maxWidth: 640, padding: "0 24px" }}>
          <div style={{ fontSize: 10, letterSpacing: "0.3em", color: "rgba(245,240,232,0.3)", marginBottom: 28, textTransform: "uppercase" }}>
            수감자 검색 / Search Inmates
          </div>
          <form onSubmit={handleSearchSubmit} style={{ position: "relative" }}>
            <input
              autoFocus={searchOpen}
              value={localQ}
              onChange={(e) => setLocalQ(e.target.value)}
              placeholder="수감자명, 저자, ISBN…"
              style={{
                width: "100%", background: "transparent",
                border: "none", borderBottom: "1px solid rgba(245,240,232,0.2)",
                color: CREAM, fontSize: 32,
                fontFamily: "'Noto Serif KR', Georgia, serif",
                padding: "12px 0", outline: "none", letterSpacing: "0.02em",
              }}
            />
            <button type="submit" style={{
              position: "absolute", right: 0, bottom: 12,
              color: "rgba(245,240,232,0.4)", fontSize: 20,
            }}>→</button>
          </form>
          <div style={{ marginTop: 16, fontSize: 10, color: "rgba(245,240,232,0.2)", letterSpacing: "0.15em" }}>ESC로 닫기</div>
        </div>
      </div>

      {/* ── HEADER ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 100,
        background: scrolled ? "rgba(13,13,13,0.97)" : DARK,
        borderBottom: "1px solid rgba(245,240,232,0.08)",
        backdropFilter: "blur(8px)",
        transition: "background 0.2s",
      }}>
        {/* Top bar */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 32px", height: 52,
        }}>
          <Link href="/" style={{
            fontFamily: "'Noto Serif KR', Georgia, serif",
            fontSize: 12, fontWeight: 700, letterSpacing: "0.2em",
            textTransform: "uppercase", color: CREAM,
          }}>
            Prison of Literature
          </Link>
          <nav style={{ display: "flex", alignItems: "center", gap: 28 }}>
            <Link href="/books" className="nav-link" style={{ color: CREAM }}>Index</Link>
            <Link href="/about" className="nav-link">About</Link>
            <button
              onClick={() => { setLocalQ(q); setSearchOpen(true); }}
              style={{ color: "rgba(245,240,232,0.5)", fontSize: 15, padding: "4px 0", transition: "color 0.2s" }}
              onMouseOver={(e) => (e.currentTarget.style.color = CREAM)}
              onMouseOut={(e) => (e.currentTarget.style.color = "rgba(245,240,232,0.5)")}
              aria-label="검색"
            >&#x2315;</button>
          </nav>
        </div>

        {/* Page header row — 목록 페이지일 때만 */}
        {pg === "list" && (
          <div style={{
            padding: "10px 32px 12px",
            borderTop: "1px solid rgba(245,240,232,0.06)",
            display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12,
          }}>
            {/* 뷰 토글 */}
            <div style={{ display: "flex", gap: 0 }}>
              <button
                className={`view-btn${viewMode === "list" ? " active" : ""}`}
                onClick={() => setViewMode("list")}
              >List</button>
              <button
                className={`view-btn${viewMode === "gallery" ? " active" : ""}`}
                onClick={() => setViewMode("gallery")}
                style={{ marginLeft: -1 }}
              >Gallery</button>
            </div>

            {/* 필터 + 정렬 */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              {/* 상태 필터 */}
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                {[["all", "전체"], ["AVAILABLE", "접견가능"], ["CHECKED_OUT", "접견중"], ["RESTRICTED", "접견불가"]].map(([k, l]) => (
                  <button key={k} onClick={() => setStatusFilter(k)} style={{
                    fontSize: 11, letterSpacing: "0.1em",
                    color: statusFilter === k ? CREAM : "rgba(245,240,232,0.3)",
                    borderBottom: statusFilter === k ? `1px solid ${k === "all" ? CREAM : ST[k]?.c}` : "1px solid transparent",
                    paddingBottom: 2, transition: "all 0.15s",
                    ...(k !== "all" ? { color: statusFilter === k ? ST[k].c : "rgba(245,240,232,0.3)" } : {}),
                  }}>{l}</button>
                ))}
              </div>

              <div style={{ width: 1, height: 14, background: "rgba(245,240,232,0.1)" }} />

              {/* 정렬 */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  background: "transparent", border: "none",
                  color: "rgba(245,240,232,0.4)", fontSize: 11,
                  letterSpacing: "0.1em", outline: "none", cursor: "pointer",
                }}
              >
                <option value="default" style={{ background: DARK }}>기본순</option>
                <option value="title" style={{ background: DARK }}>수감자명순</option>
                <option value="creator" style={{ background: DARK }}>저자순</option>
                <option value="year" style={{ background: DARK }}>수감연도순</option>
              </select>

              {/* 결과 수 */}
              <span style={{ fontSize: 11, color: "rgba(245,240,232,0.25)" }}>
                {q ? `${display.length}건` : total > 0 ? `총 ${total.toLocaleString()}건` : ""}
              </span>
            </div>
          </div>
        )}

        {/* 상세/접견 페이지 breadcrumb */}
        {pg !== "list" && (
          <div style={{
            padding: "10px 32px 12px",
            borderTop: "1px solid rgba(245,240,232,0.06)",
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <button onClick={backToList} style={{
              fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase",
              color: "rgba(245,240,232,0.35)", transition: "color 0.2s",
            }}
              onMouseOver={(e) => (e.currentTarget.style.color = CREAM)}
              onMouseOut={(e) => (e.currentTarget.style.color = "rgba(245,240,232,0.35)")}
            >← 명부로 돌아가기</button>
            <span style={{ color: "rgba(245,240,232,0.15)", fontSize: 11 }}>/</span>
            <span style={{ fontSize: 11, letterSpacing: "0.1em", color: "rgba(245,240,232,0.4)", textTransform: "uppercase" }}>
              {pg === "detail" ? "Inmate File" : "Visit Request"}
            </span>
            {sel && pg === "detail" && (
              <>
                <span style={{ color: "rgba(245,240,232,0.15)", fontSize: 11 }}>/</span>
                <span style={{ fontSize: 11, color: "rgba(245,240,232,0.3)", fontFamily: "'Courier New', monospace" }}>
                  {sel.isbn || sel.id}
                </span>
              </>
            )}
          </div>
        )}
      </header>

      <main style={{ minHeight: "calc(100vh - 52px)", padding: "0 0 80px" }}>

        {/* ══ LIST PAGE ══ */}
        {pg === "list" && (
          <>
            {loading && <Loader />}
            {err && (
              <div style={{
                margin: "24px 32px",
                padding: "14px 18px",
                border: "1px solid rgba(198,40,40,0.3)",
                color: "#C62828", fontSize: 13,
              }}>
                ⚠ {err}
              </div>
            )}

            {/* ── LIST VIEW (Cyberfeminism Index style) ── */}
            {!loading && display.length > 0 && viewMode === "list" && (
              <table style={{
                width: "100%", borderCollapse: "collapse",
                fontSize: 13,
              }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(245,240,232,0.1)" }}>
                    {["No.", "수감자명 / Title", "저자 / Author", "연도", "위치", "접견상태"].map((h, i) => (
                      <th key={i} style={{
                        padding: i === 0 ? "14px 24px 14px 32px" : "14px 24px",
                        textAlign: "left",
                        fontSize: 10, fontWeight: 400, letterSpacing: "0.2em",
                        color: "rgba(245,240,232,0.25)",
                        textTransform: "uppercase",
                        ...(i === 0 ? { width: 64 } : {}),
                        ...(i >= 3 ? { fontFamily: "'Courier New', monospace" } : {}),
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {display.map((b, i) => (
                    <tr
                      key={b.id + i}
                      className="book-row"
                      onClick={() => open(b)}
                      style={{
                        cursor: "pointer",
                        borderBottom: "1px solid rgba(245,240,232,0.05)",
                      }}
                    >
                      <td style={{
                        padding: "12px 24px 12px 32px",
                        fontFamily: "'Courier New', monospace",
                        fontSize: 10, color: "rgba(245,240,232,0.2)",
                        width: 64,
                      }} className="row-num">
                        {String((pn - 1) * rows + i + 1).padStart(3, "0")}
                      </td>
                      <td style={{ padding: "12px 24px" }}>
                        <div style={{ fontWeight: 500, lineHeight: 1.4, marginBottom: 2 }}>
                          {b.title.length > 60 ? b.title.slice(0, 60) + "…" : b.title}
                        </div>
                        {b.alt && (
                          <div style={{ fontSize: 11, color: "rgba(245,240,232,0.3)", fontStyle: "italic" }}>
                            {b.alt.length > 50 ? b.alt.slice(0, 50) + "…" : b.alt}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "12px 24px", color: "rgba(245,240,232,0.45)", fontSize: 12 }}>
                        {b.creator || "—"}
                      </td>
                      <td style={{
                        padding: "12px 24px",
                        fontFamily: "'Courier New', monospace",
                        fontSize: 11, color: "rgba(245,240,232,0.3)",
                      }}>
                        {b.year || "—"}
                      </td>
                      <td style={{
                        padding: "12px 24px",
                        fontFamily: "'Courier New', monospace",
                        fontSize: 11, color: "rgba(245,240,232,0.3)",
                      }}>
                        {b.callNo || "—"}
                      </td>
                      <td style={{ padding: "12px 32px 12px 24px" }}>
                        <Badge s={b.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* ── GALLERY VIEW (Short Notice Studio style) ── */}
            {!loading && display.length > 0 && viewMode === "gallery" && (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: 2,
                padding: "2px",
              }}>
                {display.map((b, i) => {
                  const coverColor = CC[b.classification] || "#444";
                  return (
                    <div
                      key={b.id + i}
                      className="gallery-card"
                      onClick={() => open(b)}
                    >
                      <div
                        className="card-cover"
                        style={{ background: coverColor }}
                      >
                        {/* 그레이스케일 책 표지 플레이스홀더 */}
                        <div style={{
                          position: "absolute", inset: 0,
                          background: `linear-gradient(135deg, rgba(0,0,0,0.3) 0%, transparent 60%, rgba(0,0,0,0.2) 100%)`,
                        }} />
                        <div style={{
                          position: "relative", zIndex: 1,
                          padding: "20px 16px",
                          textAlign: "center",
                        }}>
                          <div style={{
                            fontSize: 11, fontWeight: 700,
                            letterSpacing: "0.3em", textTransform: "uppercase",
                            color: "rgba(255,255,255,0.5)",
                            marginBottom: 8,
                          }}>
                            {b.classification === "RESTRICTED" ? "RESTRICTED" :
                             b.classification === "SPECIAL COLLECTION" ? "SPECIAL" : "GENERAL"}
                          </div>
                          <div style={{
                            fontFamily: "'Noto Serif KR', Georgia, serif",
                            fontSize: 15, fontWeight: 700,
                            color: "rgba(255,255,255,0.9)",
                            lineHeight: 1.4,
                            display: "-webkit-box",
                            WebkitLineClamp: 4,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}>
                            {b.title}
                          </div>
                        </div>
                        <div style={{
                          position: "absolute", bottom: 8, left: 12,
                          fontFamily: "'Courier New', monospace",
                          fontSize: 9, color: "rgba(255,255,255,0.3)",
                          letterSpacing: "0.1em",
                        }}>
                          {b.isbn || b.id}
                        </div>

                        {/* hover overlay */}
                        <div className="card-overlay">
                          <div style={{
                            fontSize: 13, fontWeight: 600,
                            color: "#fff", lineHeight: 1.35, marginBottom: 4,
                          }}>
                            {b.title.length > 40 ? b.title.slice(0, 40) + "…" : b.title}
                          </div>
                          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginBottom: 8 }}>
                            {b.creator || "저자 미상"}
                          </div>
                          <Badge s={b.status} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {!loading && !err && display.length === 0 && books.length > 0 && (
              <div style={{
                textAlign: "center", padding: 80,
                fontSize: 13, color: "rgba(245,240,232,0.2)",
                letterSpacing: "0.1em",
              }}>
                검색 결과가 없습니다.
              </div>
            )}

            {!q && tp > 1 && <Pager pn={pn} tp={tp} load={load} />}
          </>
        )}

        {/* ══ DETAIL PAGE ══ */}
        {pg === "detail" && sel && (
          <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 32px" }}>
            {/* 파일 헤더 */}
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              borderBottom: "1px solid rgba(245,240,232,0.1)",
              paddingBottom: 20, marginBottom: 32,
            }}>
              <div>
                <div style={{
                  fontSize: 10, letterSpacing: "0.35em", textTransform: "uppercase",
                  color: "rgba(245,240,232,0.25)", marginBottom: 8,
                }}>
                  Inmate File
                </div>
                <h1 style={{
                  fontFamily: "'Noto Serif KR', Georgia, serif",
                  fontSize: "clamp(20px, 3vw, 34px)",
                  fontWeight: 700, lineHeight: 1.25,
                  color: CREAM,
                }}>
                  {sel.title}
                </h1>
                {sel.alt && (
                  <div style={{ fontSize: 13, color: "rgba(245,240,232,0.35)", marginTop: 4, fontStyle: "italic" }}>
                    {sel.alt}
                  </div>
                )}
              </div>
              <div style={{
                textAlign: "right", flexShrink: 0, marginLeft: 24,
              }}>
                <div style={{
                  fontFamily: "'Courier New', monospace",
                  fontSize: 11, color: "rgba(245,240,232,0.25)",
                  marginBottom: 8,
                }}>
                  Case No.
                </div>
                <div style={{
                  fontFamily: "'Courier New', monospace",
                  fontSize: 15, color: CREAM,
                  letterSpacing: "0.05em",
                }}>
                  {sel.isbn || sel.id}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 40, flexWrap: "wrap" }}>
              {/* 좌: 분류 표시 */}
              <div style={{ flexShrink: 0, width: 140 }}>
                <div style={{
                  aspectRatio: "3/4",
                  background: CC[sel.classification] || "#333",
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  padding: 16, textAlign: "center",
                  position: "relative",
                }}>
                  <div style={{
                    fontFamily: "'Courier New', monospace",
                    fontSize: 9, color: "rgba(255,255,255,0.4)",
                    letterSpacing: "0.2em", marginBottom: 12,
                    textTransform: "uppercase",
                  }}>
                    {sel.classification}
                  </div>
                  <div style={{
                    fontFamily: "'Noto Serif KR', Georgia, serif",
                    fontSize: 14, fontWeight: 700,
                    color: "rgba(255,255,255,0.85)",
                    lineHeight: 1.4,
                  }}>
                    {sel.title.slice(0, 30)}
                  </div>
                  <div style={{
                    position: "absolute", bottom: 10,
                    fontFamily: "'Courier New', monospace",
                    fontSize: 9, color: "rgba(255,255,255,0.25)",
                  }}>
                    {sel.id}
                  </div>
                </div>
              </div>

              {/* 우: 상세 정보 */}
              <div style={{ flex: 1, minWidth: 260 }}>
                {/* 메타데이터 그리드 */}
                <div className="meta-grid" style={{
                  border: "1px solid rgba(245,240,232,0.08)",
                  marginBottom: 24,
                }}>
                  {[
                    ["수감번호 (ISBN)", sel.isbn || "—"],
                    ["서지 ID", sel.id],
                    ["저자", sel.creator || "—"],
                    ["발행지", sel.pubPlace || "—"],
                    ["수감위치 (청구기호)", sel.callNo || "—"],
                    ["소장정보", sel.holding || "—"],
                    ["형태사항", sel.extent || "—"],
                    ["장르", sel.genre || "—"],
                  ].map(([label, val], i) => (
                    <div key={i} className="meta-cell">
                      <div style={{
                        fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase",
                        color: "rgba(245,240,232,0.25)", marginBottom: 3,
                      }}>{label}</div>
                      <div style={{
                        fontSize: 12, color: "rgba(245,240,232,0.65)",
                        fontFamily: i <= 1 || i === 4 ? "'Courier New', monospace" : "inherit",
                      }}>{val}</div>
                    </div>
                  ))}
                </div>

                {/* 사건 개요 */}
                {sel.abstract && (
                  <InfoBox title="사건 개요" color="rgba(245,240,232,0.4)">
                    {sel.abstract}
                  </InfoBox>
                )}
                <InfoBox title="기소 사유" color={ST[sel.status].c}>
                  {sel.charges}
                </InfoBox>

                {/* 접견 상태 */}
                <div style={{
                  padding: "14px 16px",
                  border: `1px solid ${ST[sel.status].c}`,
                  marginBottom: 20,
                }}>
                  <div style={{
                    fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase",
                    color: "rgba(245,240,232,0.25)", marginBottom: 6,
                  }}>접견 상태</div>
                  <div style={{
                    fontSize: 18, fontWeight: 700, letterSpacing: "0.15em",
                    textTransform: "uppercase", color: ST[sel.status].c,
                  }}>
                    {ST[sel.status].en}
                  </div>
                  <div style={{ fontSize: 13, color: "rgba(245,240,232,0.5)", marginTop: 2 }}>
                    {ST[sel.status].ko}
                  </div>
                  {sel.status === "CHECKED_OUT" && (
                    <div style={{
                      fontSize: 11, marginTop: 8,
                      color: "rgba(245,240,232,0.35)",
                      fontFamily: "'Courier New', monospace",
                    }}>
                      접견인: 이용자 {sel.visitor} · 반납예정: {sel.returnDate}
                    </div>
                  )}
                </div>

                {/* 접견 신청 버튼 */}
                {sel.status === "AVAILABLE" && (
                  <button
                    onClick={() => { setPg("visit"); setVs(false); window.scrollTo(0, 0); }}
                    style={{
                      padding: "11px 28px",
                      background: CREAM, color: DARK,
                      fontSize: 12, fontWeight: 700,
                      letterSpacing: "0.2em", textTransform: "uppercase",
                      border: "none",
                      transition: "opacity 0.2s",
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.opacity = "0.8")}
                    onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
                  >
                    접견 신청 →
                  </button>
                )}
                {sel.status === "RESTRICTED" && (
                  <div style={{
                    padding: "12px 16px",
                    border: "1px solid rgba(198,40,40,0.3)",
                    color: "#C62828", fontSize: 13,
                  }}>
                    본 수감자는 접근 제한 상태입니다.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ══ VISIT PAGE ══ */}
        {pg === "visit" && sel && (
          <div style={{ maxWidth: 640, margin: "0 auto", padding: "48px 32px" }}>
            <div style={{
              fontSize: 10, letterSpacing: "0.35em", textTransform: "uppercase",
              color: "rgba(245,240,232,0.25)", marginBottom: 8,
            }}>접견 신청서 / Visit Request</div>
            <h2 style={{
              fontFamily: "'Noto Serif KR', Georgia, serif",
              fontSize: "clamp(18px, 2.5vw, 26px)",
              fontWeight: 700, color: CREAM, marginBottom: 32,
            }}>
              {sel.title.length > 50 ? sel.title.slice(0, 50) + "…" : sel.title}
            </h2>

            {sel.status === "RESTRICTED" ? (
              <Stamp color="#C62828" text="DENIED">
                <p>접견이 거부되었습니다. 본 수감자는 <strong>{sel.classification}</strong> 등급으로 접근이 제한됩니다.</p>
              </Stamp>
            ) : sel.status === "CHECKED_OUT" ? (
              <Stamp color="#C25700" text="IN PROGRESS">
                <p>현재 이용자 {sel.visitor}와(과) 접견 중입니다.<br />
                  접견 가능 예상일: <strong>{sel.returnDate}</strong></p>
              </Stamp>
            ) : vs ? (
              <Stamp color="#2B6E2B" text="APPROVED">
                <p>수감자 <strong>{sel.title}</strong>에 대한 접견이 승인되었습니다.<br />
                  소장위치: <strong>{sel.callNo || sel.holding || "확인 필요"}</strong></p>
                <div style={{
                  display: "inline-block", marginTop: 16,
                  padding: "12px 18px",
                  background: "rgba(245,240,232,0.04)",
                  border: "1px solid rgba(245,240,232,0.1)",
                  fontFamily: "'Courier New', monospace",
                  fontSize: 12, lineHeight: 2, textAlign: "left",
                  color: "rgba(245,240,232,0.55)",
                }}>
                  접견인: {vf.n}<br />
                  관계: {vf.r}<br />
                  승인: {new Date().toLocaleString("ko-KR")}<br />
                  인가코드: {Math.random().toString(36).slice(2, 10).toUpperCase()}
                </div>
              </Stamp>
            ) : (
              <>
                {/* 규칙 */}
                <div style={{
                  padding: "16px 18px",
                  border: "1px solid rgba(245,240,232,0.08)",
                  marginBottom: 28, fontSize: 13, lineHeight: 1.9,
                  color: "rgba(245,240,232,0.45)",
                }}>
                  <div style={{
                    fontSize: 10, letterSpacing: "0.25em", textTransform: "uppercase",
                    color: "rgba(245,240,232,0.25)", marginBottom: 10,
                  }}>접견 규칙</div>
                  1. 모든 접견인은 유효한 신분증을 제시해야 합니다.<br />
                  2. 접견 기간은 14일을 초과할 수 없습니다.<br />
                  3. 수감자 재산 훼손 시 금전적 제재가 부과됩니다.<br />
                  4. 수감자 내용물의 무단 복제는 엄격히 금지됩니다.<br />
                  5. 교정국은 언제든지 접견 권한을 취소할 수 있습니다.
                </div>

                {/* 폼 */}
                <div style={{ marginBottom: 18 }}>
                  <label style={{
                    display: "block", fontSize: 10, letterSpacing: "0.2em",
                    textTransform: "uppercase", color: "rgba(245,240,232,0.3)",
                    marginBottom: 6,
                  }}>접견인 성명 *</label>
                  <input
                    className="form-input"
                    value={vf.n}
                    onChange={(e) => setVf({ ...vf, n: e.target.value })}
                    placeholder="성명"
                  />
                </div>
                <div style={{ marginBottom: 18 }}>
                  <label style={{
                    display: "block", fontSize: 10, letterSpacing: "0.2em",
                    textTransform: "uppercase", color: "rgba(245,240,232,0.3)",
                    marginBottom: 6,
                  }}>수감자와의 관계 *</label>
                  <select
                    className="form-input"
                    value={vf.r}
                    onChange={(e) => setVf({ ...vf, r: e.target.value })}
                    style={{ cursor: "pointer" }}
                  >
                    <option value="" style={{ background: DARK }}>선택</option>
                    <option value="연구자" style={{ background: DARK }}>연구자</option>
                    <option value="학생" style={{ background: DARK }}>학생</option>
                    <option value="일반 열람인" style={{ background: DARK }}>일반 열람인</option>
                    <option value="법률 대리인" style={{ background: DARK }}>법률 대리인</option>
                  </select>
                </div>
                <div style={{ marginBottom: 18 }}>
                  <label style={{
                    display: "block", fontSize: 10, letterSpacing: "0.2em",
                    textTransform: "uppercase", color: "rgba(245,240,232,0.3)",
                    marginBottom: 6,
                  }}>접견 사유</label>
                  <textarea
                    className="form-input"
                    value={vf.s}
                    onChange={(e) => setVf({ ...vf, s: e.target.value })}
                    placeholder="사유"
                    style={{ height: 80, resize: "vertical" }}
                  />
                </div>
                <label style={{
                  display: "flex", alignItems: "center", gap: 10,
                  fontSize: 12, color: "rgba(245,240,232,0.5)",
                  cursor: "pointer", marginBottom: 24,
                }}>
                  <input
                    type="checkbox"
                    checked={vf.a}
                    onChange={(e) => setVf({ ...vf, a: e.target.checked })}
                    style={{ accentColor: CREAM, width: 14, height: 14 }}
                  />
                  접견 규칙에 동의합니다 *
                </label>
                <button
                  disabled={!vf.n || !vf.r || !vf.a}
                  onClick={() => setVs(true)}
                  style={{
                    padding: "11px 32px",
                    background: vf.n && vf.r && vf.a ? CREAM : "transparent",
                    color: vf.n && vf.r && vf.a ? DARK : "rgba(245,240,232,0.2)",
                    border: `1px solid ${vf.n && vf.r && vf.a ? CREAM : "rgba(245,240,232,0.1)"}`,
                    fontSize: 12, fontWeight: 700,
                    letterSpacing: "0.2em", textTransform: "uppercase",
                    transition: "all 0.2s",
                  }}
                >
                  접견 신청
                </button>
              </>
            )}
          </div>
        )}
      </main>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop: "1px solid rgba(245,240,232,0.06)",
        padding: "20px 32px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: 8,
      }}>
        <span style={{ fontSize: 10, letterSpacing: "0.25em", color: "rgba(245,240,232,0.2)", textTransform: "uppercase" }}>
          Prison of Literature — 서지교정국
        </span>
        <Link href="/" style={{ fontSize: 10, letterSpacing: "0.15em", color: "rgba(245,240,232,0.15)" }}>
          ← 홈으로
        </Link>
      </footer>
    </>
  );
}
