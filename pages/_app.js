import Head from "next/head";
import Link from "next/link";

const FONTS =
  "https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&family=Noto+Serif+KR:wght@400;700&display=swap";

export default function App({ Component, pageProps }) {
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
          background: #FFFFFF;
          color: #111111;
          -webkit-font-smoothing: antialiased;
          overflow-x: hidden;
        }
        a { color: inherit; text-decoration: none; }
        button { cursor: pointer; font-family: inherit; background: none; border: none; }
        input, select, textarea { font-family: inherit; }

        /* ── 페이지 콘텐츠 상단 여백 (고정 헤더 52px) ── */
        .page-body { padding-top: 52px; }

        /* ── 리스트 행 hover ── */
        .book-row { transition: background 0.1s; }
        .book-row:hover { background: #F5F5F5 !important; }
        .book-row:hover .row-num { color: #C62828 !important; }

        /* ── 썸네일 카드 hover ── */
        .uniform-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          cursor: pointer;
        }
        .uniform-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(0,0,0,0.12);
        }

        /* ── fade-in 애니메이션 ── */
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-in { animation: fadeIn 400ms ease-out forwards; }

        /* ── pill 필터 hover ── */
        .filter-pill:hover:not(.active) {
          border-color: #999 !important;
          color: #333 !important;
        }

        /* ── 스피너 ── */
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── 정렬 컬럼 헤더 hover ── */
        .sort-th:hover { color: #111 !important; }

        /* ── 스크롤바 ── */
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #DDD; border-radius: 2px; }
        ::-webkit-scrollbar-thumb:hover { background: #BBB; }
      `}</style>

      {/* ── 고정 헤더 ── */}
      <header style={{
        position:       "fixed",
        top: 0, left: 0, right: 0,
        zIndex:         100,
        height:         52,
        borderBottom:   "1px solid #E8E8E8",
        background:     "rgba(255,255,255,0.97)",
        backdropFilter: "blur(8px)",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "space-between",
        padding:        "0 24px",
      }}>
        <Link href="/" style={{
          fontFamily:    "'Noto Serif KR', Georgia, serif",
          fontSize:      13,
          fontWeight:    700,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color:         "#111",
        }}>
          Prison of Literature
        </Link>

        <Link href="/about"
          style={{
            fontSize:      11,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color:         "#767676",
            transition:    "color 0.15s",
          }}
          onMouseOver={e => (e.currentTarget.style.color = "#111")}
          onMouseOut={e  => (e.currentTarget.style.color = "#767676")}
        >
          About
        </Link>
      </header>

      <div className="page-body">
        <Component {...pageProps} />
      </div>
    </>
  );
}
