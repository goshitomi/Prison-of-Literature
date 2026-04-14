import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";

const FONTS =
  "https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&family=Noto+Serif+KR:wght@400;700&display=swap";

const DARK = "#0D0D0D";
const CREAM = "#F5F0E8";

const NAV_ITEMS = [
  { label: "Index", href: "/books", sub: "수감자 명부" },
  { label: "About", href: "/about", sub: "프로젝트 소개" },
  { label: "Search", href: null, sub: "수감자 검색", isSearch: true },
];

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const [navOpen, setNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");

  const isHomepage = router.pathname === "/";
  const showOpaque = navOpen || scrolled || !isHomepage;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close nav on route change
  useEffect(() => {
    setNavOpen(false);
    setSearchOpen(false);
  }, [router.pathname]);

  // ESC key closes overlays
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setNavOpen(false);
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Lock body scroll when nav is open
  useEffect(() => {
    document.body.style.overflow = navOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [navOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQ.trim()) {
      router.push(`/books?q=${encodeURIComponent(searchQ.trim())}`);
      setSearchOpen(false);
      setNavOpen(false);
      setSearchQ("");
    }
  };

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={FONTS} rel="stylesheet" />
      </Head>

      <style jsx global>{`
        /* ── Reset ── */
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

        /* ── Nav underline hover ── */
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

        /* ── CTA links ── */
        .cta-link {
          display: inline-flex; align-items: center; gap: 10px;
          font-size: 13px; letter-spacing: 0.2em; font-weight: 500;
          color: rgba(245,240,232,0.55); text-transform: uppercase;
          border-bottom: 1px solid rgba(245,240,232,0.2);
          padding-bottom: 2px;
          transition: color 0.2s, border-color 0.2s;
        }
        .cta-link:hover { color: ${CREAM}; border-color: ${CREAM}; }
        .cta-link .arrow { display: inline-block; transition: transform 0.2s; }
        .cta-link:hover .arrow { transform: translateX(4px); }

        /* ── Divider ── */
        .divider { border: none; border-top: 1px solid rgba(245,240,232,0.08); margin: 0; }

        /* ── Search overlay ── */
        .search-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.97);
          z-index: 300;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          opacity: 0; pointer-events: none;
          transition: opacity 0.25s ease;
        }
        .search-overlay.open { opacity: 1; pointer-events: all; }

        /* ── Full-screen nav overlay ── */
        .nav-overlay {
          position: fixed;
          inset: 0;
          z-index: 200;
          background: ${DARK};
          display: flex;
          flex-direction: column;
          transform: translateY(-100%);
          transition: transform 0.55s cubic-bezier(0.76, 0, 0.24, 1);
          will-change: transform;
        }
        .nav-overlay.open {
          transform: translateY(0);
        }

        /* ── Nav item: vertical expand on hover ── */
        .nav-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 0 48px;
          border-bottom: 1px solid rgba(245,240,232,0.07);
          cursor: pointer;
          transition: flex 0.4s cubic-bezier(0.76, 0, 0.24, 1), background 0.2s;
          overflow: hidden;
          min-height: 0;
        }
        .nav-item:hover {
          flex: 3;
          background: rgba(245,240,232,0.02);
        }
        .nav-item .nav-item-label {
          font-family: 'Noto Serif KR', Georgia, serif;
          font-size: clamp(36px, 6vw, 88px);
          font-weight: 700;
          color: rgba(245,240,232,0.12);
          letter-spacing: -0.02em;
          transition: color 0.25s;
          line-height: 1;
          white-space: nowrap;
        }
        .nav-item:hover .nav-item-label {
          color: ${CREAM};
        }
        .nav-item .nav-item-sub {
          font-size: 11px;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: rgba(245,240,232,0.15);
          margin-top: 10px;
          transition: color 0.25s;
        }
        .nav-item:hover .nav-item-sub {
          color: rgba(245,240,232,0.5);
        }

        /* ── Ticker animation ── */
        @keyframes ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .ticker-inner {
          display: flex;
          white-space: nowrap;
          animation: ticker 28s linear infinite;
        }

        /* ── Spinner ── */
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Books page: list row ── */
        .book-row { transition: background 0.12s; cursor: pointer; }
        .book-row:hover { background: rgba(245,240,232,0.04) !important; }
        .book-row:hover .row-num { color: #C62828 !important; }

        /* ── Books page: gallery card ── */
        .gallery-card { position: relative; overflow: hidden; cursor: pointer; }
        .gallery-card .card-cover {
          width: 100%;
          aspect-ratio: 3/4;
          filter: grayscale(100%);
          transition: filter 0.4s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        .gallery-card:hover .card-cover { filter: grayscale(0%); }
        .gallery-card .card-cover img {
          width: 100%; height: 100%;
          object-fit: cover;
          display: block;
        }
        .gallery-card .card-overlay {
          position: absolute; bottom: 0; left: 0; right: 0;
          padding: 20px 14px 14px;
          background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%);
          transform: translateY(100%);
          transition: transform 0.35s ease;
        }
        .gallery-card:hover .card-overlay { transform: translateY(0); }

        /* ── Books page: view toggle ── */
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

        /* ── Books page: detail metadata grid ── */
        .meta-grid { display: grid; grid-template-columns: 1fr 1fr; }
        .meta-cell {
          padding: 10px 14px;
          border-bottom: 1px solid rgba(245,240,232,0.06);
          border-right: 1px solid rgba(245,240,232,0.06);
        }

        /* ── Books page: form inputs ── */
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

      {/* ── Search overlay ── */}
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
            fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase",
            color: "rgba(245,240,232,0.3)", marginBottom: 28,
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
                width: "100%", background: "transparent",
                border: "none", borderBottom: "1px solid rgba(245,240,232,0.2)",
                color: CREAM, fontSize: 32,
                fontFamily: "'Noto Serif KR', Georgia, serif",
                padding: "12px 0", outline: "none", letterSpacing: "0.02em",
              }}
            />
            <button
              type="submit"
              style={{
                position: "absolute", right: 0, bottom: 12,
                color: "rgba(245,240,232,0.4)", fontSize: 20,
              }}
            >
              →
            </button>
          </form>
          <div style={{
            marginTop: 16, fontSize: 11,
            color: "rgba(245,240,232,0.2)", letterSpacing: "0.15em",
          }}>
            ESC로 닫기
          </div>
        </div>
      </div>

      {/* ── Full-screen nav overlay ── */}
      <div className={`nav-overlay${navOpen ? " open" : ""}`}>
        {/* Overlay header row */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 32px", height: 56,
          borderBottom: "1px solid rgba(245,240,232,0.07)",
          flexShrink: 0,
        }}>
          <Link href="/" style={{
            fontFamily: "'Noto Serif KR', Georgia, serif",
            fontSize: 13, fontWeight: 700, letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}>
            Prison of Literature
          </Link>
          <button
            onClick={() => setNavOpen(false)}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              color: "rgba(245,240,232,0.55)", fontSize: 11,
              letterSpacing: "0.2em", textTransform: "uppercase",
            }}
            aria-label="닫기"
          >
            Close
            <span style={{
              display: "inline-block",
              transform: "rotate(90deg)",
              transition: "transform 0.3s",
              fontSize: 14,
            }}>▸</span>
          </button>
        </div>

        {/* Nav items — vertical flex, each expands on hover */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {NAV_ITEMS.map((item, i) => (
            <div
              key={i}
              className="nav-item"
              onClick={() => {
                if (item.isSearch) {
                  setNavOpen(false);
                  setTimeout(() => setSearchOpen(true), 100);
                } else {
                  router.push(item.href);
                }
              }}
            >
              <div className="nav-item-label">{item.label}</div>
              <div className="nav-item-sub">{item.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Fixed global header ── */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0,
        zIndex: 100,
        padding: "0 32px",
        height: 56,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: showOpaque ? "rgba(13,13,13,0.97)" : "transparent",
        borderBottom: showOpaque ? "1px solid rgba(245,240,232,0.07)" : "none",
        backdropFilter: scrolled && !navOpen ? "blur(8px)" : "none",
        transition: "background 0.3s, border-color 0.3s",
      }}>
        <Link href="/" style={{
          fontFamily: "'Noto Serif KR', Georgia, serif",
          fontSize: 13, fontWeight: 700, letterSpacing: "0.2em",
          textTransform: "uppercase", color: CREAM,
        }}>
          Prison of Literature
        </Link>

        <button
          onClick={() => setNavOpen(!navOpen)}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            color: "rgba(245,240,232,0.55)", fontSize: 11,
            letterSpacing: "0.2em", textTransform: "uppercase",
            transition: "color 0.2s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.color = CREAM)}
          onMouseOut={(e) => (e.currentTarget.style.color = "rgba(245,240,232,0.55)")}
          aria-label="메뉴"
        >
          {navOpen ? "Close" : "Menu"}
          <span style={{
            display: "inline-block",
            transform: navOpen ? "rotate(90deg)" : "rotate(0deg)",
            transition: "transform 0.3s",
            fontSize: 14,
          }}>▸</span>
        </button>
      </header>

      {/* Page content */}
      <Component {...pageProps} />
    </>
  );
}
