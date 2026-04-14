import { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { parse, ST, CC } from "../lib/helpers";

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
      }}>{children}</div>
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

  const [sel, setSel] = useState(null);
  const [vf, setVf] = useState({ n: "", r: "", s: "", a: false });
  const [vs, setVs] = useState(false);

  /* URL 쿼리 파라미터로 초기 검색어 설정 */
  useEffect(() => {
    if (router.query.q) {
      setQ(router.query.q);
    }
  }, [router.query.q]);

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

  return (
    <>
      <Head>
        <title>Index — Prison of Literature</title>
      </Head>

      {/* ── SUBBAR (sticky below global 56px header) ── */}
      <div style={{
        position: "sticky", top: 56, zIndex: 50,
        background: "rgba(13,13,13,0.97)",
        borderBottom: "1px solid rgba(245,240,232,0.08)",
        backdropFilter: "blur(8px)",
      }}>
        {/* 목록 페이지: 뷰 토글 + 필터 */}
        {pg === "list" && (
          <div style={{
            padding: "10px 32px 12px",
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
                    color: statusFilter === k
                      ? (k === "all" ? CREAM : ST[k]?.c)
                      : "rgba(245,240,232,0.3)",
                    borderBottom: statusFilter === k
                      ? `1px solid ${k === "all" ? CREAM : ST[k]?.c}`
                      : "1px solid transparent",
                    paddingBottom: 2, transition: "all 0.15s",
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
      </div>

      <main style={{ minHeight: "calc(100vh - 56px)", padding: "0 0 80px" }}>

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

            {/* ── LIST VIEW ── */}
            {!loading && display.length > 0 && viewMode === "list" && (
              <table style={{
                width: "100%", borderCollapse: "collapse",
                fontSize: 13,
              }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(245,240,232,0.1)" }}>
                    {["No.", "수감자명 / Title", "저자 / Author", "연도", "수인 번호", "접견상태"].map((h, i) => (
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

            {/* ── GALLERY VIEW ── */}
            {!loading && display.length > 0 && viewMode === "gallery" && (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: 2,
                padding: "2px",
              }}>
                {display.map((b, i) => {
                  const coverColor = CC[b.classification] || "#444";
                  const coverSrc = b.isbn
                    ? `https://covers.openlibrary.org/b/isbn/${b.isbn.replace(/[^0-9X]/gi, "")}-M.jpg`
                    : null;
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
                        {coverSrc && (
                          <img
                            src={coverSrc}
                            alt={b.title}
                            onError={(e) => { e.currentTarget.style.display = "none"; }}
                            style={{
                              position: "absolute", inset: 0,
                              width: "100%", height: "100%",
                              objectFit: "cover",
                              display: "block",
                            }}
                          />
                        )}
                        {/* 플레이스홀더 오버레이 */}
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
                  죄수 번호
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
                  {sel.isbn && (
                    <img
                      src={`https://covers.openlibrary.org/b/isbn/${sel.isbn.replace(/[^0-9X]/gi, "")}-M.jpg`}
                      alt={sel.title}
                      onError={(e) => { e.currentTarget.style.display = "none"; }}
                      style={{
                        position: "absolute", inset: 0,
                        width: "100%", height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  )}
                  <div style={{
                    position: "relative", zIndex: 1,
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    height: "100%",
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
                {/* 죄수복 사이즈 배지 */}
                <div style={{
                  marginTop: 8, textAlign: "center",
                  fontFamily: "'Courier New', monospace",
                  fontSize: 11, letterSpacing: "0.2em",
                  color: "rgba(245,240,232,0.35)",
                }}>
                  죄수복 — {sel.prisonSize}
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
                    ["죄수 번호 (ISBN)", sel.isbn || "—"],
                    ["수인 번호 (청구기호)", sel.callNo || "—"],
                    ["저자", sel.creator || "—"],
                    ["생년월일 (발행연도)", sel.pubDate || sel.year || "—"],
                    ["신장 (판형)", sel.height],
                    ["죄수복 사이즈", sel.prisonSize],
                    ["수감 페이지", sel.pages],
                    ["소장정보", sel.holding || "—"],
                  ].map(([label, val], i) => (
                    <div key={i} className="meta-cell">
                      <div style={{
                        fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase",
                        color: "rgba(245,240,232,0.25)", marginBottom: 3,
                      }}>{label}</div>
                      <div style={{
                        fontSize: 12, color: "rgba(245,240,232,0.65)",
                        fontFamily: i <= 1 ? "'Courier New', monospace" : "inherit",
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
        <span style={{ fontSize: 10, letterSpacing: "0.15em", color: "rgba(245,240,232,0.15)" }}>
          201, Banpo-daero, Seocho-gu, Seoul
        </span>
      </footer>
    </>
  );
}
