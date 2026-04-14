# Prison of Literature — 구현 플랜

> 작성일: 2026-04-14  
> 기준 커밋: `01b6821` (main)  
> 기획서: Google Docs `1cUHVCa8spCQHHQcNnjNUjxd4USRzVD-KhSi7pG48pTA`
>
> **구현 상태: ✅ 완료 (2026-04-14)**

---

## 0. 전제: 지금 코드베이스 상태

현재 코드는 대부분 기획 방향과 잘 맞는다. 구조적으로 완성된 것들:

- 홈 랜딩 페이지 (히어로, 티커, 컨셉, 상태 키)
- 수감자 명부 리스트 뷰 (테이블)
- 갤러리 뷰 (흑백↔컬러 호버)
- 상세 페이지 (Inmate File)
- 접견 신청 폼 (DENIED / IN PROGRESS / APPROVED)
- NLK API 프록시

**빠진 것들** (이 플랜이 해결할 것들):

| 항목 | 우선순위 |
|---|---|
| 프로젝트 구조 재편 (서브디렉토리 제거) + GitHub/Vercel 재배포 | P0 — 배포 전 필수 |
| 확장형 전체화면 네비게이터 | P1 |
| About 전경 사진 + 기획서 본문 텍스트 | P1 |
| 상세 페이지 메타데이터 은유 완성 (판형→신장/체중, 발행일→생년월일) | P2 |
| 갤러리 실제 표지 이미지 | P2 |
| API 키 환경변수화 | P0 — 보안 |

---

## 1. ✅ P0 — 프로젝트 구조 재편 & API 키 환경변수화 (완료)

### 1-1. 왜 이게 P0인가

이전 배포가 계속 실패한 이유는 단 하나다:

```
Prison-of-Literature/           ← GitHub repo 루트
└── Prison-of-Literature_Folder/ ← Next.js 루트 (서브디렉토리)
```

Vercel은 repo 루트에서 `package.json`을 찾는다. 서브디렉토리에 있으면 `rootDirectory` 설정이 필요한데, 이 설정값과 실제 경로가 계속 충돌했다. vercel.json을 옮기거나, rootDirectory를 수동 설정해도 빌드 컨텍스트가 꼬였다.

**해결책: Next.js 파일을 Git 루트로 올린다.**

### 1-2. 마이그레이션 절차

```bash
# 1. 서브디렉토리 파일을 루트로 이동
mv Prison-of-Literature_Folder/lib .
mv Prison-of-Literature_Folder/pages .
mv Prison-of-Literature_Folder/public .
mv Prison-of-Literature_Folder/next.config.js .
mv Prison-of-Literature_Folder/package.json .
mv Prison-of-Literature_Folder/package-lock.json .
mv Prison-of-Literature_Folder/.gitignore .

# 2. 서브디렉토리 삭제
rm -rf Prison-of-Literature_Folder

# 3. node_modules 재설치
npm install

# 4. 빌드 테스트
npm run build
```

이후 Git 루트 구조:
```
Prison-of-Literature/
├── lib/helpers.js
├── pages/
│   ├── index.js
│   ├── about.js
│   ├── books.js
│   └── api/books.js
├── public/
├── next.config.js
├── package.json
├── .gitignore
└── .env.local
```

### 1-3. API 키 환경변수화

**수정 파일**: `pages/api/books.js`

현재:
```javascript
const API_KEY = "92c6104efdf269a89493d8f294b16d85b566e78804977e0793dc3b202192d6c1";
```

변경 후:
```javascript
const API_KEY = process.env.NLK_API_KEY;
```

`.env.local` (Git에 커밋하지 않음):
```
NLK_API_KEY=92c6104efdf269a89493d8f294b16d85b566e78804977e0793dc3b202192d6c1
```

### 1-4. GitHub 저장소 신규 생성

```bash
# 루트에서
git init
git add .
git commit -m "Initial commit: restructure to repo root"
```

GitHub에서 새 repository `prison-of-literature` 생성 후:
```bash
git remote add origin https://github.com/<username>/prison-of-literature.git
git push -u origin main
```

### 1-5. Vercel 재배포

1. vercel.com → New Project
2. GitHub 저장소 `prison-of-literature` import
3. **Framework Preset**: Next.js (자동 감지)
4. **Root Directory**: `.` (기본값, 변경하지 않는다)
5. **Environment Variables** 추가:
   - Key: `NLK_API_KEY`
   - Value: `92c6104efdf269a89493d8f294b16d85b566e78804977e0793dc3b202192d6c1`
6. Deploy

> 트레이드오프: `rootDirectory`를 수동 설정하지 않고 기본값을 그대로 사용하는 것이 핵심. Vercel의 자동 감지가 repo 루트의 `package.json`과 `next.config.js`를 찾는다.

---

## 2. ✅ P1 — 확장형 전체화면 네비게이터 (완료)

### 2-1. 기획서 요구사항

- 레퍼런스: graffitiremovals.org
- 평소: 고정 헤더 (현재와 유사)
- **Arrow(▸) 버튼 클릭 → 전체 화면 네비게이터 오버레이 확장**
- 확장 상태에서 각 메뉴 항목 호버 시 **해당 항목이 세로로 더 늘어나는 인터랙션**

### 2-2. 구현 접근법

`pages/_app.js`를 생성하여 전역 레이아웃 컴포넌트로 추출. 현재 각 페이지에 헤더가 인라인으로 있는데, 이를 공통 컴포넌트로 분리한다.

**파일 구조 변경**:
```
pages/
├── _app.js          ← 신규 생성 (전역 레이아웃 + 네비게이터 상태 관리)
├── index.js         ← 헤더 코드 제거
├── about.js         ← 헤더 코드 제거
└── books.js         ← 헤더 코드 제거 (서브바는 유지)
```

**`pages/_app.js`**:

```jsx
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

const FONTS =
  "https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&family=Noto+Serif+KR:wght@400;700&display=swap";

const DARK = "#0D0D0D";
const CREAM = "#F5F0E8";

const NAV_ITEMS = [
  { label: "Index",  href: "/books",  sub: "수감자 명부" },
  { label: "About",  href: "/about",  sub: "프로젝트 소개" },
  { label: "Search", href: null,      sub: "수감자 검색",  isSearch: true },
];

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const [navOpen, setNavOpen] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 라우트 변경 시 네비게이터 닫기
  useEffect(() => {
    setNavOpen(false);
  }, [router.pathname]);

  // ESC 키
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") { setNavOpen(false); setSearchOpen(false); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQ.trim()) {
      router.push(`/books?q=${encodeURIComponent(searchQ.trim())}`);
      setSearchOpen(false);
      setNavOpen(false);
    }
  };

  return (
    <>
      {/* 폰트 */}
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={FONTS} rel="stylesheet" />
      </Head>

      <style jsx global>{`
        /* reset + global */
        *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
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

        /* 확장 네비게이터 오버레이 */
        .nav-overlay {
          position: fixed;
          inset: 0;
          z-index: 150;
          background: ${DARK};
          display: flex;
          flex-direction: column;
          transform: translateY(-100%);
          transition: transform 0.5s cubic-bezier(0.76, 0, 0.24, 1);
        }
        .nav-overlay.open {
          transform: translateY(0);
        }

        /* 네비게이터 항목: 호버 시 세로 확장 */
        .nav-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 0 48px;
          border-bottom: 1px solid rgba(245,240,232,0.07);
          cursor: pointer;
          transition: flex 0.4s cubic-bezier(0.76, 0, 0.24, 1),
                      background 0.2s;
          overflow: hidden;
        }
        .nav-item:hover {
          flex: 3;
          background: rgba(245,240,232,0.02);
        }
        .nav-item .item-label {
          font-family: 'Noto Serif KR', Georgia, serif;
          font-size: clamp(32px, 6vw, 80px);
          font-weight: 700;
          color: rgba(245,240,232,0.15);
          letter-spacing: -0.02em;
          transition: color 0.25s;
          line-height: 1;
        }
        .nav-item:hover .item-label {
          color: ${CREAM};
        }
        .nav-item .item-sub {
          font-size: 11px;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: rgba(245,240,232,0.2);
          margin-top: 8px;
          transition: color 0.25s;
        }
        .nav-item:hover .item-sub {
          color: rgba(245,240,232,0.5);
        }

        /* 헤더 링크 hover 언더라인 */
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

        /* 검색 오버레이 */
        .search-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.97);
          z-index: 200;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          opacity: 0; pointer-events: none;
          transition: opacity 0.25s ease;
        }
        .search-overlay.open { opacity: 1; pointer-events: all; }

        /* 티커 */
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .ticker-inner {
          display: flex;
          white-space: nowrap;
          animation: ticker 28s linear infinite;
        }

        /* 로더 스피너 */
        @keyframes spin { to { transform: rotate(360deg); } }

        /* 공통 */
        .divider { border: none; border-top: 1px solid rgba(245,240,232,0.08); margin: 0; }
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
      `}</style>

      {/* ── 검색 오버레이 ── */}
      <div className={`search-overlay${searchOpen ? " open" : ""}`}>
        <button
          onClick={() => setSearchOpen(false)}
          style={{ position: "absolute", top: 28, right: 32, color: "rgba(245,240,232,0.4)", fontSize: 28 }}
          aria-label="닫기"
        >×</button>
        <div style={{ width: "100%", maxWidth: 640, padding: "0 24px" }}>
          <div style={{ fontSize: 11, letterSpacing: "0.3em", color: "rgba(245,240,232,0.3)", marginBottom: 28, textTransform: "uppercase" }}>
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
                padding: "12px 0", outline: "none",
              }}
            />
            <button type="submit" style={{ position: "absolute", right: 0, bottom: 12, color: "rgba(245,240,232,0.4)", fontSize: 20 }}>→</button>
          </form>
          <div style={{ marginTop: 16, fontSize: 11, color: "rgba(245,240,232,0.2)", letterSpacing: "0.15em" }}>ESC로 닫기</div>
        </div>
      </div>

      {/* ── 확장 네비게이터 오버레이 ── */}
      <div className={`nav-overlay${navOpen ? " open" : ""}`}>
        {/* 오버레이 헤더 */}
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
            style={{ color: "rgba(245,240,232,0.4)", fontSize: 28, lineHeight: 1 }}
            aria-label="닫기"
          >×</button>
        </div>

        {/* 메뉴 항목들 */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {NAV_ITEMS.map((item, i) => (
            <div
              key={i}
              className="nav-item"
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              onClick={() => {
                if (item.isSearch) { setNavOpen(false); setSearchOpen(true); }
                else { router.push(item.href); }
              }}
            >
              <div className="item-label">{item.label}</div>
              <div className="item-sub">{item.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 고정 헤더 ── */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "0 32px", height: 56,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: (navOpen || scrolled) ? "rgba(13,13,13,0.97)" : "transparent",
        borderBottom: (navOpen || scrolled) ? "1px solid rgba(245,240,232,0.07)" : "none",
        backdropFilter: scrolled ? "blur(8px)" : "none",
        transition: "background 0.3s",
      }}>
        <Link href="/" style={{
          fontFamily: "'Noto Serif KR', Georgia, serif",
          fontSize: 13, fontWeight: 700, letterSpacing: "0.2em",
          textTransform: "uppercase",
        }}>
          Prison of Literature
        </Link>

        {/* 네비게이터 토글 버튼 */}
        <button
          onClick={() => setNavOpen(!navOpen)}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            color: "rgba(245,240,232,0.55)", fontSize: 11,
            letterSpacing: "0.2em", textTransform: "uppercase",
            transition: "color 0.2s",
          }}
          onMouseOver={(e) => e.currentTarget.style.color = CREAM}
          onMouseOut={(e) => e.currentTarget.style.color = "rgba(245,240,232,0.55)"}
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

      {/* 페이지 콘텐츠 */}
      <Component {...pageProps} />
    </>
  );
}
```

> **트레이드오프**:
> - `_app.js`에 검색 오버레이와 네비게이터를 올리면 각 페이지의 중복 헤더 코드를 제거할 수 있어 유지보수가 편해진다.
> - 단, `books.js`의 헤더 서브바(뷰 전환, 필터, 정렬)는 해당 페이지 고유 UI이므로 `_app.js`에서 분리하고, books 페이지에 유지한다.
> - `Head` 컴포넌트를 `_app.js`에서 import 해야 한다(`import Head from "next/head"`).

---

## 3. ✅ P1 — About 페이지: 전경 사진 + 기획서 본문 (완료)

### 3-1. 전경 사진 추가

**파일**: `public/nlk-building.jpg`

국립중앙도서관 전경 사진(저작권 확인 후 사용, 또는 공식 제공 이미지 사용)을 `public/` 에 저장.

**수정 파일**: `pages/about.js`

히어로 섹션 배경을 CSS 그라디언트 대신 실제 이미지로 교체:

```jsx
{/* 히어로 배경 — 전경 사진 */}
<div style={{
  position: "absolute", inset: 0,
  backgroundImage: "url('/nlk-building.jpg')",
  backgroundSize: "cover",
  backgroundPosition: "center 30%",
  filter: "brightness(0.35)",
}}>
  {/* 하단 그라디언트 오버레이 */}
  <div style={{
    position: "absolute", bottom: 0, left: 0, right: 0, height: "60%",
    background: "linear-gradient(to top, rgba(13,13,13,1) 0%, transparent 100%)",
  }} />
</div>
```

> **트레이드오프**:
> - `filter: brightness(0.35)` + 하단 그라디언트로 어두운 편집 분위기 유지.
> - `next/image` 컴포넌트를 사용하면 자동 최적화(WebP 변환, lazy load)가 되나, 배경 이미지로 사용 시 CSS background-image가 더 단순하다. 이 케이스에서는 CSS 방식이 적합.
> - 이미지 저작권: 국립중앙도서관 공식 홈페이지(nl.go.kr) 보도자료 이미지 또는 Creative Commons 라이선스 이미지 사용 권장.

### 3-2. About 본문 텍스트 교체

**수정 파일**: `pages/about.js` — 2컬럼 텍스트 섹션

```jsx
{/* 국문 */}
<p style={{ fontSize: 14, lineHeight: 2.1, fontWeight: 300, color: "rgba(245,240,232,0.5)", marginBottom: 20 }}>
  'Prison of Literature(책은 죄수다)' 프로젝트는 우연히 책장을 바라보다
  발견한 책과 죄수 사이의 놀라운 물리적, 체계적 유사성에서 시작되었습니다.
</p>
<p style={{ fontSize: 14, lineHeight: 2.1, fontWeight: 300, color: "rgba(245,240,232,0.5)", marginBottom: 20 }}>
  이 프로젝트에서 책의 모든 정보는 죄수의 인적 사항으로 재정의됩니다.
  책의 제목은 죄수를 부르는 이름이 되며, 책의 판형과 무게는 죄수의 신장 및 체중과 같은
  신체 스펙으로 재정의됩니다. 또한 초판 발행일은 죄수의 생년월일이 되고,
  책을 체계적으로 관리하기 위해 부여된 고유 번호인 ISBN은 이 감옥에서
  부여하는 죄수 번호의 역할을 수행합니다.
</p>
<p style={{ fontSize: 14, lineHeight: 2.1, fontWeight: 300, color: "rgba(245,240,232,0.5)" }}>
  심지어 책의 청구기호는 죄수의 수인 번호로 재정의됩니다. 모든 책은 기존의 화려한 표지를
  벗고, 판형에 따라 S, M, L 사이즈로 규격화된 '죄수복(북 커버)'을 입게 되며
  책등에는 수감 번호가 부착됩니다.
</p>

{/* 영문 */}
<p style={{ fontSize: 14, lineHeight: 2.1, fontWeight: 300, color: "rgba(245,240,232,0.5)", marginBottom: 20 }}>
  The project <em>Prison of Literature</em> originated from the discovery of striking
  physical and systemic parallels between books and prisoners, observed by chance
  while gazing at a bookshelf.
</p>
<p style={{ fontSize: 14, lineHeight: 2.1, fontWeight: 300, color: "rgba(245,240,232,0.5)", marginBottom: 20 }}>
  Within this framework, every piece of information regarding a book is reimagined
  as a prisoner's personal profile. The title of the book functions as the inmate's
  name, while its trim size and weight are redefined as physical attributes such as
  height and body mass. The date of first publication serves as the prisoner's date
  of birth, and the ISBN—the unique identifier used for systematic management—takes
  on the role of an inmate identification number within this prison.
</p>
<p style={{ fontSize: 14, lineHeight: 2.1, fontWeight: 300, color: "rgba(245,240,232,0.5)" }}>
  Furthermore, even the call number is repurposed as the specific inmate number
  assigned to the prisoner. Stripped of their vibrant original covers, all books are
  garbed in standardized 'prison uniforms'—custom book covers categorized into S, M,
  and L sizes according to their dimensions—with their inmate numbers clearly
  displayed on the spine.
</p>
```

---

## 4. ✅ P2 — 상세 페이지 메타데이터 은유 완성 (완료)

### 4-1. helpers.js 업데이트

**수정 파일**: `lib/helpers.js`

`BIBFRAME_extent` 필드를 판형/무게 정보로 파싱하여 신장/체중으로 표시. NLK API의 `extent` 필드는 "26 cm" 또는 "198 p.; 22 cm" 형태.

```javascript
// helpers.js에 추가
export function parsePhysical(extent) {
  // "198 p.; 22 cm" → { height: "22 cm", pages: "198 p." }
  const cmMatch = (extent || "").match(/(\d+)\s*cm/);
  const pMatch = (extent || "").match(/(\d+)\s*p/i);
  return {
    height: cmMatch ? `${cmMatch[1]} cm` : "—",
    pages: pMatch ? `${pMatch[1]} p.` : "—",
  };
}

export function prisonSize(extent) {
  const cmMatch = (extent || "").match(/(\d+)\s*cm/);
  if (!cmMatch) return "M";
  const cm = parseInt(cmMatch[1]);
  return cm <= 18 ? "S" : cm <= 24 ? "M" : "L";
}
```

`parse()` 함수에 필드 추가:

```javascript
export function parse(item) {
  const id = item.BIBLIO_ID || "";
  const st = simStatus(id);
  const cl = simClass(id);
  const extentRaw = Array.isArray(item.BIBFRAME_extent)
    ? item.BIBFRAME_extent.join(", ")
    : item.BIBFRAME_extent || "";
  const physical = parsePhysical(extentRaw);

  return {
    // ... 기존 필드들 ...
    extent: extentRaw,
    height: physical.height,       // 신장 (= 판형 높이)
    pages: physical.pages,         // 신체 스펙 보조 (= 페이지수)
    prisonSize: prisonSize(extentRaw), // 죄수복 사이즈
    pubDate: item.DCTERMS_date || item.DCTERMS_created || "", // 생년월일 (= 발행일)
    // ...
  };
}
```

### 4-2. 상세 페이지 메타데이터 그리드 업데이트

**수정 파일**: `pages/books.js` — 뷰 B (detail) 메타데이터 그리드

현재 레이블을 기획서 은유로 교체:

```jsx
{[
  ["죄수 번호 (ISBN)",    sel.isbn || "—"],
  ["서지 ID",            sel.id],
  ["이름 (저자)",        sel.creator || "—"],        // 저자 → 이름 (창작자)
  ["생년월일 (발행일)",  sel.pubDate || sel.year || "—"],  // 신규
  ["신장 (판형)",        sel.height || "—"],          // 신규
  ["죄수복 사이즈",      sel.prisonSize || "—"],       // 신규
  ["수인 번호 (청구기호)", sel.callNo || "—"],
  ["수감 시설",          sel.holding || "—"],
].map(([label, val], i) => (
  <div key={i} className="meta-cell">
    <div style={{ fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase",
                  color: "rgba(245,240,232,0.25)", marginBottom: 3 }}>{label}</div>
    <div style={{ fontSize: 12, color: "rgba(245,240,232,0.65)",
                  fontFamily: (i <= 1 || i === 6) ? "'Courier New', monospace" : "inherit" }}>
      {val}
    </div>
  </div>
))}
```

> **트레이드오프**:
> - NLK API의 `DCTERMS_date` 필드 제공 여부가 불확실. 없을 경우 `BIBLIO_ID`에서 추출한 `year`로 폴백.
> - `BIBFRAME_extent` 파싱은 정규식 기반이라 형식이 다를 경우 "—"로 폴백. 실 데이터 확인 후 조정 필요.

---

## 5. ✅ P2 — 갤러리 뷰 실제 표지 이미지 (완료)

### 5-1. 방안 분석

NLK Open API(`getbookList`)는 **표지 이미지 URL을 직접 제공하지 않는다**.

대안:

| 방안 | 방법 | 장점 | 단점 |
|---|---|---|---|
| A. NLK 표지 이미지 API | `nl.go.kr`의 별도 표지 서비스 URL 추정 (`http://cover.nl.go.kr/...`) | 동일 기관 | 비공식, 불안정 |
| B. ISBN 기반 외부 API | Open Library API (`covers.openlibrary.org/b/isbn/{isbn}-L.jpg`) | 무료, 안정적 | 한국 도서 커버 없을 수 있음 |
| C. Naver 책 API | ISBN으로 표지 이미지 URL 제공 | 한국 도서 강점 | API 키 필요 |
| D. 컬러 플레이스홀더 유지 | 현재 방식 (분류별 색상) | 구현 불필요 | 이미지 없음 |

**권장**: 방안 B (Open Library) 우선 시도. ISBN이 있는 책은 실제 이미지 표시, 없으면 현재 컬러 플레이스홀더로 폴백.

### 5-2. 구현

**수정 파일**: `pages/books.js` — 갤러리 카드

```jsx
// 갤러리 카드 수정
const imgSrc = b.isbn
  ? `https://covers.openlibrary.org/b/isbn/${b.isbn.replace(/-/g, "")}-M.jpg`
  : null;

<div className="card-cover" style={{ background: imgSrc ? "transparent" : coverColor }}>
  {imgSrc ? (
    <img
      src={imgSrc}
      alt={b.title}
      style={{
        width: "100%", height: "100%", objectFit: "cover",
        filter: "grayscale(100%)",  // .gallery-card:hover에서 grayscale(0%)
        transition: "filter 0.4s ease",
      }}
      onError={(e) => {
        // 이미지 로드 실패 시 컬러 배경 폴백
        e.currentTarget.style.display = "none";
        e.currentTarget.parentElement.style.background = coverColor;
      }}
    />
  ) : (
    /* 기존 컬러 플레이스홀더 */
    <div style={{ position: "absolute", inset: 0, background: ... }} />
  )}
</div>
```

> **트레이드오프**:
> - `<img>` 태그 사용 시 외부 도메인 이미지 로드. `next.config.js`에 `images.domains` 설정 불필요 (next/image 미사용).
> - 한국 도서의 경우 Open Library 커버 없을 가능성 높음 → `onError` 폴백이 중요.
> - `grayscale` 필터를 img에 직접 적용하면 `.gallery-card:hover .card-cover` CSS 선택자가 동작하지 않을 수 있음. img에 직접 CSS 클래스 부여하거나 `card-cover` 내 img를 별도로 선택하도록 CSS 수정 필요.

---

## 6. 전체 파일 수정 목록

| 파일 | 작업 | 우선순위 |
|---|---|---|
| (구조 전체) | 서브디렉토리 → Git 루트로 이동 | P0 |
| `pages/api/books.js` | API 키 `process.env.NLK_API_KEY`로 변경 | P0 |
| `.env.local` | `NLK_API_KEY=...` 추가 | P0 |
| `.gitignore` | `.env*.local` 포함 확인 | P0 |
| `pages/_app.js` | 신규 생성 — 전역 레이아웃, 확장 네비게이터 | P1 |
| `pages/index.js` | 헤더 코드 제거 (중복) | P1 |
| `pages/about.js` | 헤더 제거, 전경 사진, 기획서 본문 반영 | P1 |
| `pages/books.js` | 헤더 제거, 메타데이터 은유 업데이트, 갤러리 이미지 | P1–P2 |
| `lib/helpers.js` | `parsePhysical()`, `prisonSize()`, `pubDate` 추가 | P2 |
| `public/nlk-building.jpg` | 국립중앙도서관 전경 사진 추가 | P1 |
| `next.config.js` | 변경 없음 (현재 설정으로 충분) | — |

---

## 7. 배포 체크리스트

```
[x] 1. 서브디렉토리 파일 Git 루트로 이동
[x] 2. npm install & npm run build 로컬 빌드 성공 확인
[x] 3. .env.local에 NLK_API_KEY 설정
[x] 4. .gitignore에 .env*.local 포함 확인
[ ] 5. GitHub 신규 저장소 생성 (prison-of-literature) — GitHub Desktop에서 push
[ ] 6. git push to main — GitHub Desktop에서 실행
[ ] 7. Vercel New Project → GitHub 저장소 연결
[ ] 8. Framework: Next.js 자동 감지 확인
[ ] 9. Root Directory: "." (변경하지 않음) — vercel.json 불필요, 기본값 사용
[ ] 10. Environment Variables: NLK_API_KEY 입력
[ ] 11. Deploy → 빌드 로그 확인
[ ] 12. 배포 URL에서 /api/books 동작 확인
[ ] 13. 홈, About, Index 각 페이지 동작 확인
```

---

## 8. 트레이드오프 종합

### 8-1. `_app.js` 공통 레이아웃 vs. 페이지별 헤더

| | 공통 `_app.js` | 페이지별 인라인 |
|---|---|---|
| 유지보수 | 헤더 1곳만 수정 | 각 페이지 수정 필요 |
| 유연성 | 페이지별 헤더 커스터마이징 어려움 | 각 페이지 자유도 높음 |
| 현재 상황 | `books.js`에 페이지별 서브바 있음 | — |

**결론**: `_app.js`에서 글로벌 헤더(로고 + 메뉴 토글)만 담당하고, `books.js`의 필터/뷰 전환 서브바는 해당 페이지에 유지.

### 8-2. 확장 네비게이터 애니메이션 방식

| 방식 | 구현 | 성능 |
|---|---|---|
| `transform: translateY(-100% → 0)` | CSS transition | GPU 가속, 부드러움 |
| `height: 0 → 100vh` | CSS transition | 레이아웃 리플로우 유발 |
| `opacity + pointer-events` | 검색 오버레이와 동일 | 위치 변경 없이 페이드만 |

**결론**: `transform: translateY` 방식 채택. GPU 합성 레이어에서 처리되어 60fps 유지.

### 8-3. 갤러리 이미지 전략

| 전략 | 미구현 영향 | 구현 난이도 |
|---|---|---|
| Open Library ISBN 이미지 | 한국 도서 커버 부재 시 폴백 작동 | 낮음 |
| 컬러 플레이스홀더 유지 | 기획서 "이미지 인덱스" 미충족 | 없음 |

**결론**: Open Library 시도 + `onError` 폴백으로 현재 플레이스홀더 유지. 실제 전시 환경에서는 Naver 책 API 또는 표지 이미지 별도 수집 검토.

### 8-4. NLK API 검색 범위

현재 검색은 로드된 20건 내 클라이언트 필터링만 동작. 전체 1,200만건 검색 아님. 전체 검색을 구현하려면:
- API 파라미터에 `kwd` (제목 검색) 추가 필요
- NLK API 스펙 확인 후 `/api/books` 서버사이드 검색 파라미터 지원 추가

---

## 9. 구현 순서 요약

```
1. [P0] 구조 재편 + API 키 환경변수화 → 로컬 빌드 확인
2. [P0] GitHub 신규 저장소 생성 + 첫 커밋 + push
3. [P0] Vercel 재연결 + 환경변수 설정 + 첫 배포 성공 확인
       ↓ 배포 안정화 후
4. [P1] pages/_app.js 생성 (확장 네비게이터)
5. [P1] About 전경 사진 + 기획서 본문 텍스트
6. [P1] 각 페이지 헤더 코드 제거 (중복 제거)
7. [P2] helpers.js 메타데이터 확장 (판형→신장, 발행일)
8. [P2] books.js 상세 페이지 메타데이터 레이블 업데이트
9. [P2] 갤러리 뷰 Open Library 이미지 시도
```


### 10. 피드백 메모

현재 폴더는 download에 있는데, 내가 추천받은 방식은 github에 로컬로 연결한 후, Vercel에 연결해서 로컬 파일을 수정했을 때, github desktop에서 push만 누르면 자동으로 업데이트되는 방식이야.
다만 이 방식에서 Error가 발생했었기 때문에 기존에 존재했던 레포지토리를 전부 지웠던거야. 참고해.