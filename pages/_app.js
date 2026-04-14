import Head from "next/head";
import Link from "next/link";
import { useState } from "react";

/* Roma Publications 패턴:
   - font: 12px/1.4em Arial, Helvetica, sans-serif
   - header: 미니멀, 40px, 테두리 없음
   - 한국어 폴백: "Apple SD Gothic Neo", sans-serif
*/
const FONT    = "Arial, Helvetica, sans-serif";
const ACCENT  = "#C62828";
const ROW_BORDER = "#FFE0E0";

const FONTS =
  "https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;700&display=swap";

export default function App({ Component, pageProps }) {
  const [hoverAbout, setHoverAbout] = useState(false);
  const [hoverLogo,  setHoverLogo]  = useState(false);

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

        /* ── Body: Roma Publications 기본 ── */
        body {
          font-family: Arial, Helvetica, sans-serif;
          font-size: 12px;
          line-height: 1.4em;
          background: #FFFFFF;
          color: #000000;
          -webkit-font-smoothing: antialiased;
          overflow-x: hidden;
        }

        a { color: inherit; text-decoration: none; }
        button { cursor: pointer; font-family: inherit; background: none; border: none; }
        input, select, textarea { font-family: inherit; }

        /* ── 페이지 상단 여백 (고정 헤더 40px) ── */
        .page-body { padding-top: 40px; }

        /* ── 리스트 행 hover (book-row 클래스 → BookRow 컴포넌트에서 직접 처리) ── */
        .uniform-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          cursor: pointer;
        }
        .uniform-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.10);
        }

        /* ── fade-in ── */
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-in { animation: fadeIn 400ms ease-out forwards; }

        /* ── 스피너 ── */
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── 검색 인풋 (Roma 스타일) ── */
        input[type="search"]::-webkit-search-cancel-button {
          -webkit-appearance: none;
          width: 0.72em;
          height: 0.72em;
          background-image:
            linear-gradient(45deg,  transparent 44%, #000 44%, #000 56%, transparent 56%),
            linear-gradient(-45deg, transparent 44%, #000 44%, #000 56%, transparent 56%);
          background-size: 100% 100%;
          cursor: pointer;
        }

        /* ── 스크롤바 ── */
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #DDD; border-radius: 2px; }
        ::-webkit-scrollbar-thumb:hover { background: #BBB; }
      `}</style>

      {/* ── 고정 헤더 (Roma: 타이틀 좌 | About 우, 40px) ── */}
      <header style={{
        position:       "fixed",
        top: 0, left: 0, right: 0,
        zIndex:         100,
        height:         40,
        borderBottom:   `1px solid ${ROW_BORDER}`,
        background:     "rgba(255,255,255,0.97)",
        backdropFilter: "blur(8px)",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "space-between",
        padding:        "0 24px",
      }}>
        {/* 로고 */}
        <Link
          href="/"
          style={{
            fontFamily:    FONT,
            fontSize:      12,
            fontWeight:    "bold",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color:         hoverLogo ? ACCENT : "#000",
            transition:    "color 0.1s",
          }}
          onMouseEnter={() => setHoverLogo(true)}
          onMouseLeave={() => setHoverLogo(false)}
        >
          Prison of Literature
        </Link>

        {/* About 링크 */}
        <Link
          href="/about"
          style={{
            fontFamily:    FONT,
            fontSize:      12,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color:         hoverAbout ? ACCENT : "#767676",
            transition:    "color 0.1s",
          }}
          onMouseEnter={() => setHoverAbout(true)}
          onMouseLeave={() => setHoverAbout(false)}
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
