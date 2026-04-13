import { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import Link from "next/link";
import { parse } from "../lib/helpers";

const FONTS =
  "https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&family=Noto+Serif+KR:wght@400;700&display=swap";

export default function Home() {
  const [total, setTotal] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [scrolled, setScrolled] = useState(false);

  /* 총 수감자 수 */
  useEffect(() => {
    fetch("/api/books?pageNo=1&numOfRows=1&koreanOnly=true")
      .then((r) => r.json())
      .then((d) => setTotal(d?.body?.totalCount || d?.totalCount || null))
      .catch(() => {});
  }, []);

  /* 스크롤 감지 */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* 검색 오버레이 ESC */
  useEffect(() => {
    if (!searchOpen) return;
    const onKey = (e) => { if (e.key === "Escape") setSearchOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQ.trim()) {
      window.location.href = `/books?q=${encodeURIComponent(searchQ.trim())}`;
    }
  };

  return (
    <>
      <Head>
        <title>PRISON OF LITERATURE — 책은 죄수다</title>
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
          background: #0D0D0D;
          color: #F5F0E8;
          -webkit-font-smoothing: antialiased;
          overflow-x: hidden;
        }
        a { color: inherit; text-decoration: none; }
        button { cursor: pointer; font-family: inherit; border: none; background: none; }

        /* Nav hover */
        .nav-link {
          position: relative;
          display: inline-block;
          padding: 4px 0;
          font-size: 13px;
          letter-spacing: 0.12em;
          color: rgba(245,240,232,0.55);
          transition: color 0.2s;
          font-weight: 400;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 1px;
          background: #F5F0E8;
          transition: width 0.25s ease;
        }
        .nav-link:hover { color: #F5F0E8; }
        .nav-link:hover::after { width: 100%; }

        /* Search overlay */
        .search-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.96);
          z-index: 200;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.25s ease;
        }
        .search-overlay.open {
          opacity: 1;
          pointer-events: all;
        }

        /* Ticker */
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .ticker-inner {
          display: flex;
          white-space: nowrap;
          animation: ticker 28s linear infinite;
        }

        /* Horizontal rule */
        .divider {
          border: none;
          border-top: 1px solid rgba(245,240,232,0.1);
          margin: 0;
        }

        /* CTA links */
        .cta-link {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          letter-spacing: 0.2em;
          font-weight: 500;
          color: rgba(245,240,232,0.55);
          text-transform: uppercase;
          border-bottom: 1px solid rgba(245,240,232,0.2);
          padding-bottom: 2px;
          transition: color 0.2s, border-color 0.2s;
        }
        .cta-link:hover { color: #F5F0E8; border-color: #F5F0E8; }
        .cta-link .arrow {
          display: inline-block;
          transition: transform 0.2s;
        }
        .cta-link:hover .arrow { transform: translateX(4px); }
      `}</style>

      {/* ── SEARCH OVERLAY ── */}
      <div className={`search-overlay${searchOpen ? " open" : ""}`}>
        <button
          onClick={() => setSearchOpen(false)}
          style={{
            position: "absolute", top: 28, right: 32,
            color: "rgba(245,240,232,0.4)", fontSize: 28, lineHeight: 1,
          }}
          aria-label="닫기"
        >
          ×
        </button>
        <div style={{ width: "100%", maxWidth: 640, padding: "0 24px" }}>
          <div style={{
            fontSize: 11, letterSpacing: "0.3em", color: "rgba(245,240,232,0.35)",
            marginBottom: 28, textTransform: "uppercase",
          }}>
            수감자 검색 / Search Inmates
          </div>
          <form onSubmit={handleSearch} style={{ position: "relative" }}>
            <input
              autoFocus={searchOpen}
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder="수감자명, 저자, ISBN…"
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                borderBottom: "1px solid rgba(245,240,232,0.25)",
                color: "#F5F0E8",
                fontSize: 32,
                fontFamily: "'Noto Serif KR', Georgia, serif",
                fontWeight: 400,
                padding: "12px 0",
                outline: "none",
                letterSpacing: "0.02em",
              }}
            />
            <button
              type="submit"
              style={{
                position: "absolute", right: 0, bottom: 12,
                color: "rgba(245,240,232,0.4)", fontSize: 20,
                transition: "color 0.2s",
              }}
            >
              →
            </button>
          </form>
          <div style={{
            marginTop: 16, fontSize: 11, color: "rgba(245,240,232,0.25)",
            letterSpacing: "0.15em",
          }}>
            ESC로 닫기
          </div>
        </div>
      </div>

      {/* ── HEADER ── */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "0 32px",
        height: 56,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: scrolled ? "rgba(13,13,13,0.95)" : "transparent",
        borderBottom: scrolled ? "1px solid rgba(245,240,232,0.07)" : "none",
        backdropFilter: scrolled ? "blur(8px)" : "none",
        transition: "background 0.3s, border-color 0.3s",
      }}>
        <Link href="/" style={{
          fontFamily: "'Noto Serif KR', Georgia, serif",
          fontSize: 13, fontWeight: 700, letterSpacing: "0.2em",
          textTransform: "uppercase", color: "#F5F0E8",
        }}>
          Prison of Literature
        </Link>
        <nav style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <Link href="/books" className="nav-link">Index</Link>
          <Link href="/about" className="nav-link">About</Link>
          <button
            onClick={() => setSearchOpen(true)}
            style={{
              color: "rgba(245,240,232,0.55)", fontSize: 14,
              lineHeight: 1, padding: "4px 0",
              transition: "color 0.2s",
            }}
            aria-label="검색"
            onMouseOver={(e) => (e.currentTarget.style.color = "#F5F0E8")}
            onMouseOut={(e) => (e.currentTarget.style.color = "rgba(245,240,232,0.55)")}
          >
            &#x2315;
          </button>
        </nav>
      </header>

      <main>
        {/* ── HERO ── */}
        <section style={{
          minHeight: "100vh",
          display: "flex", flexDirection: "column",
          justifyContent: "flex-end",
          padding: "0 32px 64px",
          position: "relative",
        }}>
          {/* 배경 텍스처 라인 */}
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 79px, rgba(245,240,232,0.03) 79px, rgba(245,240,232,0.03) 80px)",
          }} />

          {/* 상단 라벨 */}
          <div style={{
            position: "absolute", top: 96, left: 32,
            fontSize: 10, letterSpacing: "0.35em", color: "rgba(245,240,232,0.25)",
            textTransform: "uppercase",
          }}>
            서지교정국 — Dept. of Library Corrections
          </div>

          {/* 메인 타이틀 */}
          <div style={{ maxWidth: 1200, position: "relative" }}>
            <h1 style={{
              fontFamily: "'Noto Serif KR', Georgia, serif",
              fontSize: "clamp(52px, 8.5vw, 130px)",
              fontWeight: 700,
              lineHeight: 1.0,
              letterSpacing: "-0.02em",
              color: "#F5F0E8",
              marginBottom: 28,
            }}>
              Prison<br />
              of<br />
              Literature
            </h1>

            <div style={{
              display: "flex", alignItems: "flex-end",
              justifyContent: "space-between",
              flexWrap: "wrap", gap: 32,
            }}>
              {/* 부제 */}
              <div>
                <div style={{
                  fontFamily: "'Noto Serif KR', Georgia, serif",
                  fontSize: "clamp(18px, 3vw, 36px)",
                  fontWeight: 400,
                  color: "#C62828",
                  letterSpacing: "0.05em",
                  marginBottom: 16,
                }}>
                  책은 죄수다
                </div>
                <p style={{
                  fontSize: 13, lineHeight: 1.85,
                  color: "rgba(245,240,232,0.45)",
                  maxWidth: 400,
                  letterSpacing: "0.02em",
                  fontWeight: 300,
                }}>
                  모든 책은 국립중앙도서관의 벽 안에 수감되어 있다.<br />
                  Every book is an inmate within the walls<br />
                  of the National Library of Korea.
                </p>
              </div>

              {/* CTA + 카운터 */}
              <div style={{ display: "flex", flexDirection: "column", gap: 20, alignItems: "flex-end" }}>
                {total !== null && (
                  <div style={{ textAlign: "right" }}>
                    <div style={{
                      fontFamily: "'Noto Serif KR', monospace",
                      fontSize: "clamp(32px, 4vw, 56px)",
                      fontWeight: 700,
                      color: "#F5F0E8",
                      lineHeight: 1,
                    }}>
                      {total.toLocaleString()}
                    </div>
                    <div style={{
                      fontSize: 10, letterSpacing: "0.25em",
                      color: "rgba(245,240,232,0.3)",
                      marginTop: 4, textTransform: "uppercase",
                    }}>
                      현재 수감 중인 책
                    </div>
                  </div>
                )}
                <div style={{ display: "flex", gap: 28 }}>
                  <Link href="/books" className="cta-link">
                    명부 보기 <span className="arrow">→</span>
                  </Link>
                  <Link href="/about" className="cta-link">
                    About <span className="arrow">→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <hr className="divider" />

        {/* ── TICKER ── */}
        <section style={{
          overflow: "hidden",
          padding: "14px 0",
          borderBottom: "1px solid rgba(245,240,232,0.08)",
        }}>
          <div className="ticker-inner">
            {[...Array(2)].map((_, ri) => (
              <span key={ri} style={{
                fontSize: 11, letterSpacing: "0.25em",
                color: "rgba(245,240,232,0.2)",
                textTransform: "uppercase", paddingRight: 0,
              }}>
                {[
                  "AVAILABLE", "접견가능", "CHECKED OUT", "접견중",
                  "RESTRICTED", "접견불가", "INMATE FILE", "수감자 기록",
                  "PRISON OF LITERATURE", "책은 죄수다",
                  "DEPT. OF LIBRARY CORRECTIONS", "서지교정국",
                ].map((w, i) => (
                  <span key={i} style={{ marginRight: "4em" }}>{w}</span>
                ))}
              </span>
            ))}
          </div>
        </section>

        <hr className="divider" />

        {/* ── CONCEPT ── */}
        <section style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          minHeight: "60vh",
        }}>
          {/* 좌: 개념 설명 */}
          <div style={{
            padding: "80px 48px 80px 32px",
            borderRight: "1px solid rgba(245,240,232,0.08)",
            display: "flex", flexDirection: "column", justifyContent: "center",
          }}>
            <div style={{
              fontSize: 10, letterSpacing: "0.3em",
              color: "rgba(245,240,232,0.25)",
              textTransform: "uppercase", marginBottom: 32,
            }}>
              01 — Concept
            </div>
            <h2 style={{
              fontFamily: "'Noto Serif KR', Georgia, serif",
              fontSize: "clamp(22px, 2.8vw, 42px)",
              fontWeight: 700, lineHeight: 1.25,
              color: "#F5F0E8", marginBottom: 24,
            }}>
              도서관은 감옥이다.<br />
              The Library is a Prison.
            </h2>
            <p style={{
              fontSize: 14, lineHeight: 1.95,
              color: "rgba(245,240,232,0.45)", fontWeight: 300,
              maxWidth: 420,
            }}>
              서지교정국(書誌矯正局)은 국립중앙도서관 소장 도서를
              수감자로 재구성하는 개념적 프로젝트입니다.
              각 책은 분류 번호를 수감번호로, 서가를 감방으로,
              대출 상태를 접견 허가로 번역합니다.
            </p>
          </div>

          {/* 우: 영문 */}
          <div style={{
            padding: "80px 32px 80px 48px",
            display: "flex", flexDirection: "column", justifyContent: "center",
          }}>
            <div style={{
              fontSize: 10, letterSpacing: "0.3em",
              color: "rgba(245,240,232,0.25)",
              textTransform: "uppercase", marginBottom: 32,
            }}>
              02 — Context
            </div>
            <p style={{
              fontSize: 14, lineHeight: 1.95,
              color: "rgba(245,240,232,0.45)", fontWeight: 300,
            }}>
              The Dept. of Library Corrections (서지교정국) is a conceptual
              project that reimagines the holdings of the National Library of
              Korea as inmates within a carceral system. Call numbers become
              prisoner IDs; stacks become cells; loan status becomes visitation
              rights.
            </p>
            <div style={{ marginTop: 40 }}>
              <Link href="/about" className="cta-link">
                Read more about the project <span className="arrow">→</span>
              </Link>
            </div>
          </div>
        </section>

        <hr className="divider" />

        {/* ── STATUS KEY ── */}
        <section style={{
          padding: "72px 32px",
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 1,
          background: "rgba(245,240,232,0.04)",
        }}>
          {[
            { key: "AVAILABLE", ko: "접견가능", en: "Available", desc: "해당 수감자(책)는 현재 접견이 가능합니다. 방문을 신청하세요.", color: "#2B6E2B" },
            { key: "CHECKED_OUT", ko: "접견중", en: "Checked Out", desc: "현재 다른 방문자가 접견 중입니다. 반납 예정일을 확인하세요.", color: "#C25700" },
            { key: "RESTRICTED", ko: "접견불가", en: "Restricted", desc: "해당 수감자(책)는 접근이 제한되어 있습니다. 열람 허가 필요.", color: "#C62828" },
          ].map((s) => (
            <div key={s.key} style={{
              padding: "40px 32px",
              borderRight: "1px solid rgba(245,240,232,0.06)",
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: "50%",
                background: s.color, marginBottom: 20,
              }} />
              <div style={{
                fontFamily: "'Noto Serif KR', Georgia, serif",
                fontSize: 22, fontWeight: 700,
                color: "#F5F0E8", marginBottom: 4,
              }}>
                {s.ko}
              </div>
              <div style={{
                fontSize: 11, letterSpacing: "0.2em",
                color: s.color, marginBottom: 16,
                textTransform: "uppercase",
              }}>
                {s.en}
              </div>
              <p style={{
                fontSize: 12, lineHeight: 1.8,
                color: "rgba(245,240,232,0.35)", fontWeight: 300,
              }}>
                {s.desc}
              </p>
            </div>
          ))}
        </section>

        <hr className="divider" />

        {/* ── ENTER ── */}
        <section style={{
          padding: "120px 32px",
          textAlign: "center",
        }}>
          <div style={{
            fontSize: 10, letterSpacing: "0.3em",
            color: "rgba(245,240,232,0.2)",
            textTransform: "uppercase", marginBottom: 40,
          }}>
            수감자 명부 열람 / Browse the Index
          </div>
          <Link href="/books" style={{
            display: "inline-block",
            fontFamily: "'Noto Serif KR', Georgia, serif",
            fontSize: "clamp(28px, 4vw, 56px)",
            fontWeight: 700,
            color: "#F5F0E8",
            borderBottom: "1px solid rgba(245,240,232,0.2)",
            paddingBottom: 4,
            letterSpacing: "-0.01em",
            transition: "color 0.2s, border-color 0.2s",
          }}
            onMouseOver={(e) => {
              e.currentTarget.style.color = "#C62828";
              e.currentTarget.style.borderColor = "#C62828";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.color = "#F5F0E8";
              e.currentTarget.style.borderColor = "rgba(245,240,232,0.2)";
            }}
          >
            수감자 명부 열람 →
          </Link>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop: "1px solid rgba(245,240,232,0.08)",
        padding: "20px 32px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: 8,
      }}>
        <span style={{
          fontSize: 10, letterSpacing: "0.25em",
          color: "rgba(245,240,232,0.2)", textTransform: "uppercase",
        }}>
          Prison of Literature — 서지교정국
        </span>
        <span style={{
          fontSize: 10, letterSpacing: "0.15em",
          color: "rgba(245,240,232,0.15)",
        }}>
          201, Banpo-daero, Seocho-gu, Seoul
        </span>
      </footer>
    </>
  );
}
