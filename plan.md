# Prison of Literature — 전면 리디자인 플랜 v3

> 작성일: 2026-04-14 (v3 업데이트)  
> 기준 커밋: `f4485a9` (main)  
> 레퍼런스: Roma Publications / Shortnotice Studio / Cyberfeminismindex / Faceted Search  
> 변경 사항 (v2→v3): 썸네일뷰 추가, 리스트↔썸네일 토글 구현 전략 반영

---

## 0. 배포 구조 확인 — 어디에 업데이트해야 웹에 반영되는가

### 결론: `Documents/GitHub/Prison-of-Literature`만 수정하면 된다

| 항목 | `Documents/GitHub/Prison-of-Literature` | `Downloads/Prison-of-Literature` |
|---|---|---|
| Git remote | `git@github.com:goshitomi/Prison-of-Literature.git` (SSH) | `https://github.com/goshitomi/Prison-of-Literature.git` (HTTPS) |
| 역할 | **실제 작업 디렉토리** (Claude Code 세션 기준 워킹 디렉토리) | 동일 GitHub 레포의 HTTPS 클론 (백업/참고용) |
| Vercel 연동 | GitHub push → Vercel 자동 빌드/배포 | 이 폴더에서 push해도 동일 레포로 가지만 충돌 위험 |

**자동 배포 흐름:**
```
Documents/GitHub/Prison-of-Literature에서 git push
→ github.com/goshitomi/Prison-of-Literature (main 브랜치)
→ Vercel이 GitHub webhook 감지
→ npm run build → 자동 배포
```

Downloads 폴더는 절대 수정하지 않는다. 혼선 방지를 위해 사용 후 삭제를 권장한다.

---

## 1. 현황 분석 — 무엇이 문제인가

### 1-1. 현재 사이트 구조

```
/ (index.js)       → 전면 히어로 랜딩 페이지 (풀스크린 타이포 + 티커 + 컨셉 섹션)
/books (books.js)  → 수감자 명부 (리스트뷰 + 갤러리뷰 — 둘 다 로딩 불량)
/about (about.js)  → 프로젝트 소개 (2컬럼 한영 병렬)
```

### 1-2. 확인된 문제점 (feedback.md 기반)

| 문제 | 심각도 | 처리 방향 |
|---|---|---|
| 리스트뷰 데이터 로딩 불량 | Critical | index.js 전면 재작성으로 해결 |
| 갤러리뷰 데이터 로딩 불량 | Critical | 기존 갤러리뷰 삭제 → 새 썸네일뷰로 대체 |
| 검정 배경 → 흰 배경으로 전환 | Major | 전면 테마 교체 |
| 홈이 히어로 페이지 → 즉시 리스트로 | Major | UX 구조 재설계 |
| 검색바 'Search Inmate' 없음 | Major | 검색 UX 신규 구현 |
| Faceted Search 미구현 | Major | 필터 시스템 신규 구현 |

### 1-3. 현재 테마 vs 목표 테마

| 항목 | 현재 | 목표 |
|---|---|---|
| 배경 | `#0D0D0D` (거의 검정) | `#FFFFFF` (흰색) |
| 텍스트 | `#F5F0E8` (크림화이트) | `#111111` (거의 검정) |
| 분위기 | 다크/에디토리얼/미스테리 | 클린/아카이브/레퍼런스 도서관 |
| 레이아웃 | 히어로 → 스크롤 내려가며 정보 | 즉시 목록(리스트/썸네일 토글) |
| 네비게이션 | 풀스크린 오버레이 메뉴 | 미니멀 고정 헤더 |

---

## 2. 레퍼런스 분석

### 2-1. Roma Publications — 리스트뷰 주 레퍼런스
`https://www.romapublications.org/?book=gerlach-en-koop`

**핵심 패턴:**
- 흰 배경(`#FFFFFF`), 검정 텍스트. 별도 랜딩 없이 즉시 테이블 표시
- 상단 실시간 텍스트 필터 인풋 (`tableSearch` 패턴)
- **정렬 가능한 컬럼 헤더** — 클릭 시 ↑↓ 토글
- 컬럼 구성: No. / TITLE / ARTIST(S) / PAGES / SIZE / YEAR / ORDER
- 핑크/살몬(`#FFBBBB`) hover accent, 각진 모서리(border-radius: 0)
- 어바웃 섹션은 아코디언으로 접혀 있음
- 타이포: 클린 sans-serif (Arial/Helvetica 계열)

**Prison of Literature 차용:**
- 흰 배경 + 정렬 가능 테이블
- 실시간 텍스트 필터
- 컬럼 구조 → 수감자 메타데이터로 매핑
- 최소한의 헤더 (로고 + About 링크)

---

### 2-2. Shortnotice Studio — 썸네일뷰 주 레퍼런스
`https://shortnotice.studio/index/`

**핵심 패턴:**
- 다단 플렉스 그리드 (데스크톱 고정 컬럼 / 모바일 단일 컬럼 자동 전환)
- 카드 간격: `gap: 29px`, 모바일 하단 마진: `2%`
- 카드 구성: 이미지 + 타이틀 + 설명/태그
- 이미지: lazy-load, `object-fit: cover`, 비율 `contain-intrinsic-size: 3000px 1500px` (가로형 2:1 기본)
- 진입 애니메이션: `opacity: 0 → 1`, `transition: all 400ms ease-out`
- **필터: pill 형태 태그 버블** (`border-radius: 100px`)
  - active 상태: `opacity 0.5 → 1`
- 검색: 흰색 반투명 오버레이 (`rgba(255,255,255,0.85)`)
- 타이포: ABCDiatype-Black, 텍스트 `#d1d1d1` (다크 배경 기반)

**Prison of Literature 차용:**
- 다단 그리드 + `gap` 기반 간격
- lazy-load fade-in 진입 애니메이션
- pill 태그 필터 (썸네일뷰에서 패싯 필터를 태그 버블로 표현)
- hover 시 카드 오버레이로 메타데이터 노출

**핵심 차이점 — 이미지 없음 문제:**  
NLK API는 표지 이미지를 제공하지 않는다. 따라서 썸네일뷰는 실제 이미지 대신 **CSS로 생성한 "죄수복(Prison Uniform) 카드"** 를 사용한다. 이는 프로젝트 개념(모든 책이 표지를 벗고 규격화된 죄수복을 입는다)과 정확히 일치하여 기능적 제약이 오히려 개념적 강점이 된다.

---

### 2-3. Cyberfeminism Index — 구조 보조 레퍼런스
`https://cyberfeminismindex.com/`

**Prison of Literature 차용:**
- 홈 = 즉시 인덱스 패턴 (별도 랜딩 없음)
- 좌측 패싯 필터 패널 구조

---

### 2-4. Faceted Search 요건
복수의 독립 필터를 동시에 적용하는 검색 시스템.

**적용할 패싯:**
- **접견 상태**: 접견가능 / 접견중 / 접견불가 (체크박스 or pill 태그)
- **발행 연도**: 범위 인풋 (yearFrom ~ yearTo)
- **자료 분류**: 일반 / 특별소장 / 접근제한 (체크박스 or pill 태그)
- **텍스트 검색**: 수감자명(제목) / 저자명 / ISBN ("Search Inmate" 인풋)

---

## 3. 목표 아키텍처

### 3-1. 페이지 구조 재편

```
현재:                       변경 후:
/ (히어로)         →       / (즉시 리스트뷰 — 토글로 썸네일뷰 전환)
/books (리스트)    →       삭제 (/ 로 리다이렉트)
/about             →       /about (경량화, 흰 배경)
```

### 3-2. 파일 구조

```
pages/
├── _app.js           ← 글로벌 스타일(흰 테마), 단순 헤더
├── index.js          ← 메인 인덱스: 검색 + 패싯 + 뷰토글 + 리스트/썸네일
├── about.js          ← 어바웃 (색상 값만 교체)
└── api/
    └── books.js      ← API 프록시 (q 파라미터 추가)

lib/
└── helpers.js        ← 색상 상수 업데이트
```

### 3-3. 전체 레이아웃 와이어프레임

```
┌──────────────────────────────────────────────────────┐
│  PRISON OF LITERATURE                        About   │  ← 고정 헤더 56px
├──────────────────────────────────────────────────────┤
│  수감자 명부 — 총 1,247,382명 수감 중                 │  ← 페이지 타이틀 + 카운터
├──────────────────────────────────────────────────────┤
│  [🔍 Search Inmate...]              [≡ LIST] [⊞ GRID]│  ← 검색바 + 뷰 토글
├──────────┬───────────────────────────────────────────┤
│ FILTERS  │  (리스트뷰)                                │
│          │  NO.  수감자명        저자    발행  판형  상태│
│ 접견상태  │  001  ──────────  ──────  2021   M   접견가능│
│ □접견가능 │  002  ──────────  ──────  2019   L   접견중 │
│ □접견중   │  003  ──────────  ──────  2018   S   접견불가│
│ □접견불가 │  ...                                       │
│          │  (썸네일뷰로 전환 시)                       │
│ 발행연도  │  ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐               │
│ [──~──]  │  │  │ │  │ │  │ │  │ │  │               │
│          │  └──┘ └──┘ └──┘ └──┘ └──┘               │
│ 자료분류  │  ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐               │
│ □일반     │  │  │ │  │ │  │ │  │ │  │               │
│ □특별소장 │  └──┘ └──┘ └──┘ └──┘ └──┘               │
│ □접근제한 │                                            │
└──────────┴───────────────────────────────────────────┘
```

**모바일**: 패싯 필터는 "Filters ▼" 토글 버튼으로 접힘. 썸네일뷰는 2열로 축소.

---

## 4. 뷰 토글 설계

### 4-1. 상태 관리

```javascript
// 기본값: 리스트뷰. URL 쿼리로 상태 유지 (공유/북마크 가능)
const router = useRouter();
const viewParam = router.query.view; // "list" | "grid"
const [view, setView] = useState("list");

useEffect(() => {
  if (viewParam === "grid" || viewParam === "list") setView(viewParam);
}, [viewParam]);

function switchView(v) {
  setView(v);
  router.replace({ query: { ...router.query, view: v } }, undefined, { shallow: true });
}
```

### 4-2. 토글 버튼 UI

```jsx
function ViewToggle({ view, onSwitch }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[
        { id: "list", icon: "≡", label: "List" },
        { id: "grid", icon: "⊞", label: "Grid" },
      ].map(({ id, icon, label }) => (
        <button
          key={id}
          onClick={() => onSwitch(id)}
          title={label}
          style={{
            padding: "6px 12px",
            fontSize: 14,
            border: "1px solid",
            borderColor: view === id ? "#111" : "#DDD",
            background: view === id ? "#111" : "#FFF",
            color: view === id ? "#FFF" : "#999",
            cursor: "pointer",
            transition: "all 0.15s",
            lineHeight: 1,
          }}
        >
          {icon}
        </button>
      ))}
    </div>
  );
}
```

---

## 5. 리스트뷰 설계 (Roma Publications 패턴)

### 5-1. 테이블 컬럼 매핑

| 컬럼 헤더 | 데이터 필드 | 정렬 | 비고 |
|---|---|---|---|
| No. | 행 순번 | ✗ | `001`, `002` … (tabular-nums) |
| 수감자명 | `title` | ✓ | 최대 너비 280px, ellipsis |
| 저자 | `creator` | ✓ | 없으면 "—" |
| 발행 | `pubDate` (연도만) | ✓ | `slice(0,4)` |
| 판형 | `prisonSize` | ✓ | S / M / L |
| 수인번호 | `callNo` | ✓ | Courier New 폰트 |
| 접견상태 | `status` | ✓ | StatusBadge 컴포넌트 |

### 5-2. 정렬 구현

```javascript
const [sortCol, setSortCol] = useState("title");
const [sortDir, setSortDir] = useState("asc");

function toggleSort(col) {
  if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
  else { setSortCol(col); setSortDir("asc"); }
}

const sorted = [...filtered].sort((a, b) => {
  const va = a[sortCol] ?? "";
  const vb = b[sortCol] ?? "";
  const cmp = typeof va === "number"
    ? va - vb
    : String(va).localeCompare(String(vb), "ko");
  return sortDir === "asc" ? cmp : -cmp;
});
```

### 5-3. 행 클릭 → 인라인 상세 확장

행 클릭 시 `expandedId` 상태를 토글하여 바로 아래에 상세 행(`<tr colSpan>`) 삽입.

```jsx
function BookRow({ book, idx, expanded, onToggle }) {
  return (
    <>
      <tr onClick={() => onToggle(book.id)}
        style={{
          borderBottom: "1px solid #EBEBEB",
          cursor: "pointer",
          background: expanded ? "#FAFAFA" : "transparent",
          transition: "background 0.1s",
        }}>
        <td style={tdNum}>{String(idx + 1).padStart(3, "0")}</td>
        <td style={tdTitle}>{book.title}</td>
        <td style={tdMeta}>{book.creator || "—"}</td>
        <td style={tdMeta}>{(book.pubDate || "").slice(0, 4) || "—"}</td>
        <td style={tdMeta}>{book.prisonSize}</td>
        <td style={{ ...tdMeta, fontFamily: "Courier New, monospace", fontSize: 11 }}>
          {book.callNo || "—"}
        </td>
        <td style={tdMeta}><StatusBadge status={book.status} /></td>
      </tr>
      {expanded && (
        <tr style={{ background: "#FAFAFA" }}>
          <td colSpan={7} style={{ padding: "16px 16px 20px 52px",
                                    borderBottom: "1px solid #EBEBEB" }}>
            <InlineDetail book={book} />
          </td>
        </tr>
      )}
    </>
  );
}
```

---

## 6. 썸네일뷰 설계 (Shortnotice Studio 패턴)

### 6-1. 핵심 결정: CSS "죄수복 카드"

NLK API는 표지 이미지를 제공하지 않는다. 두 가지 옵션:

| 옵션 | 방법 | 장점 | 단점 |
|---|---|---|---|
| A. CSS 죄수복 카드 | CSS만으로 카드 생성 | 개념 일관성 완벽, 외부 의존 없음, 로딩 즉시 | 시각적 다양성 낮음 |
| B. Open Library 표지 | `covers.openlibrary.org/b/isbn/{isbn}-M.jpg` | 실제 이미지 | ISBN 없는 책 많음, 404 처리 필요, 외부 의존 |

→ **결정: A + B 혼합** — ISBN이 있으면 Open Library 이미지 시도, 실패(404)하거나 ISBN 없으면 CSS 죄수복 카드로 fallback. 개념적으로 "모든 책은 죄수복을 입는다"는 메시지를 유지하면서 이미지가 있을 때는 표지를 보여주는 현실적 절충.

### 6-2. CSS 죄수복 카드 디자인

판형 S/M/L에 따라 카드 배경 패턴과 높이가 달라진다. 죄수복의 줄무늬(`repeating-linear-gradient`)를 CSS로 표현.

```
┌─────────────┐
│░░░░░░░░░░░░│  ← 상태 색상 바 (4px)
│             │
│    #0342    │  ← 수인번호 (Courier New, 대형)
│             │
│  ████████  │  ← 줄무늬 패턴 영역
│  ████████  │    (repeating-linear-gradient)
│  ████████  │
│             │
│  [접견가능] │  ← StatusBadge
│             │
│  S          │  ← 판형 라벨
└─────────────┘
  책 제목 (2줄)
  저자명
```

```jsx
function UniformCard({ book }) {
  const stripeColor = {
    AVAILABLE:   ["#E8F5E9", "#C8E6C9"],
    CHECKED_OUT: ["#FFF3EE", "#FFE0CC"],
    RESTRICTED:  ["#FFF0F0", "#FFCDD2"],
  }[book.status] ?? ["#F5F5F5", "#E0E0E0"];

  const statusBarColor = {
    AVAILABLE:   "#1B5E20",
    CHECKED_OUT: "#BF360C",
    RESTRICTED:  "#B71C1C",
  }[book.status] ?? "#999";

  return (
    <div className="uniform-card" style={{ cursor: "pointer" }}>
      {/* 상태 색상 바 */}
      <div style={{ height: 4, background: statusBarColor }} />

      {/* 카드 본체 */}
      <div style={{
        aspectRatio: "2/3",
        background: `repeating-linear-gradient(
          0deg,
          ${stripeColor[0]} 0px,
          ${stripeColor[0]} 12px,
          ${stripeColor[1]} 12px,
          ${stripeColor[1]} 14px
        )`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px 12px",
        gap: 12,
        position: "relative",
        overflow: "hidden",
      }}>
        {/* 수인번호 */}
        <div style={{
          fontFamily: "Courier New, monospace",
          fontSize: "clamp(18px, 3vw, 28px)",
          fontWeight: 700,
          letterSpacing: "0.1em",
          color: "#111",
          textAlign: "center",
          lineHeight: 1.2,
        }}>
          {book.callNo ? book.callNo.slice(0, 8) : book.id.slice(0, 8)}
        </div>

        {/* StatusBadge */}
        <StatusBadge status={book.status} />

        {/* 판형 */}
        <div style={{
          position: "absolute", bottom: 10, right: 12,
          fontSize: 11, fontWeight: 700,
          color: "rgba(0,0,0,0.3)", letterSpacing: "0.1em",
        }}>
          {book.prisonSize}
        </div>
      </div>

      {/* 카드 하단 텍스트 */}
      <div style={{ padding: "8px 2px" }}>
        <div style={{
          fontSize: 12, fontWeight: 600, lineHeight: 1.4,
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          marginBottom: 4,
        }}>
          {book.title}
        </div>
        <div style={{ fontSize: 11, color: "#767676" }}>
          {book.creator || "—"}
        </div>
      </div>
    </div>
  );
}
```

### 6-3. Open Library 이미지 fallback 처리

```jsx
function BookCover({ book }) {
  const [imgError, setImgError] = useState(false);
  const coverUrl = book.isbn && !imgError
    ? `https://covers.openlibrary.org/b/isbn/${book.isbn}-M.jpg`
    : null;

  if (!coverUrl) return <UniformCard book={book} />;

  return (
    <div className="uniform-card" style={{ cursor: "pointer" }}>
      <div style={{ height: 4, background: statusBarColor[book.status] }} />
      <div style={{ aspectRatio: "2/3", position: "relative", overflow: "hidden" }}>
        <img
          src={coverUrl}
          alt={book.title}
          onError={() => setImgError(true)}
          style={{
            width: "100%", height: "100%",
            objectFit: "cover",
            opacity: 0,
            transition: "opacity 400ms ease-out",
          }}
          onLoad={e => { e.target.style.opacity = 1; }}
        />
      </div>
      {/* 하단 텍스트 동일 */}
    </div>
  );
}
```

### 6-4. 그리드 레이아웃

```jsx
<div style={{
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
  gap: 24,
}}>
  {sorted.map((book, i) => (
    <BookCover key={book.id} book={book} />
  ))}
</div>
```

**반응형 컬럼 수:**
- 1200px+: 약 6열
- 900px: 약 4열
- 600px: 약 3열
- 400px 이하: 2열

`auto-fill` + `minmax(160px, 1fr)` 조합으로 별도 미디어쿼리 없이 자동 처리.

### 6-5. 썸네일뷰에서의 패싯 필터 — pill 태그 버블

리스트뷰: 좌측 사이드바 체크박스 형태  
썸네일뷰: 검색바 아래 가로 스크롤 pill 태그 버블 (Shortnotice Studio 패턴)

```jsx
function FilterPills({ filters, onChange }) {
  const pills = [
    { group: "status", key: "AVAILABLE",          label: "접견가능" },
    { group: "status", key: "CHECKED_OUT",        label: "접견중" },
    { group: "status", key: "RESTRICTED",         label: "접견불가" },
    { group: "classification", key: "GENERAL",           label: "일반" },
    { group: "classification", key: "SPECIAL COLLECTION", label: "특별소장" },
    { group: "classification", key: "RESTRICTED",         label: "접근제한" },
  ];

  return (
    <div style={{
      display: "flex", gap: 8, flexWrap: "wrap",
      padding: "8px 0",
    }}>
      {pills.map(({ group, key, label }) => {
        const active = filters[group].includes(key);
        return (
          <button
            key={`${group}-${key}`}
            onClick={() => onChange(group, key)}
            style={{
              padding: "4px 14px",
              borderRadius: 100,                          // pill 형태
              border: "1px solid",
              borderColor: active ? "#111" : "#DDD",
              background: active ? "#111" : "#FFF",
              color: active ? "#FFF" : "#555",
              fontSize: 11,
              letterSpacing: "0.05em",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {label}
          </button>
        );
      })}
      {hasActiveFilters(filters) && (
        <button
          onClick={() => onChange("reset")}
          style={{
            padding: "4px 14px", borderRadius: 100,
            border: "1px solid #C62828",
            background: "transparent", color: "#C62828",
            fontSize: 11, cursor: "pointer",
          }}
        >
          초기화 ×
        </button>
      )}
    </div>
  );
}
```

**뷰별 필터 UI 분기:**
```jsx
{view === "list"
  ? <FilterSidebar filters={filters} onChange={handleFilterChange} books={books} />
  : <FilterPills   filters={filters} onChange={handleFilterChange} />
}
```

---

## 7. 패싯 필터 공통 로직

두 뷰가 동일한 `filters` 상태와 `filtered` 결과를 공유한다. 뷰 전환 시 필터가 유지된다.

```javascript
const [filters, setFilters] = useState({
  status: [],
  yearFrom: "",
  yearTo: "",
  classification: [],
});

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

const filtered = books.filter(book => {
  if (filters.status.length && !filters.status.includes(book.status)) return false;
  if (filters.yearFrom && parseInt(book.pubDate) < parseInt(filters.yearFrom)) return false;
  if (filters.yearTo   && parseInt(book.pubDate) > parseInt(filters.yearTo))   return false;
  if (filters.classification.length && !filters.classification.includes(book.classification)) return false;
  if (q) {
    const lq = q.toLowerCase();
    return book.title.toLowerCase().includes(lq)
        || (book.creator || "").toLowerCase().includes(lq)
        || (book.isbn   || "").includes(lq);
  }
  return true;
});

function hasActiveFilters(f) {
  return f.status.length || f.yearFrom || f.yearTo || f.classification.length;
}
```

**필터+정렬 적용 순서:** `books → filtered (패싯) → sorted (컬럼 정렬) → 렌더링`

---

## 8. 글로벌 스타일 (`_app.js`)

### 8-1. 색상 시스템

```javascript
const BG     = "#FFFFFF";
const TEXT   = "#111111";
const ACCENT = "#C62828";   // 강조/링크/초기화 버튼
const BORDER = "#E0E0E0";   // 구분선
const MUTED  = "#767676";   // 보조 텍스트
```

### 8-2. 상태 뱃지 색상 (흰 배경용)

```javascript
// lib/helpers.js 업데이트
export const ST = {
  AVAILABLE:   { ko: "접견가능", en: "AVAILABLE",   c: "#1B5E20", bg: "#F1F8F1" },
  CHECKED_OUT: { ko: "접견중",   en: "CHECKED OUT", c: "#BF360C", bg: "#FFF3EE" },
  RESTRICTED:  { ko: "접견불가", en: "RESTRICTED",  c: "#B71C1C", bg: "#FFF0F0" },
};
```

### 8-3. 헤더 (단순화)

풀스크린 오버레이 네비 삭제. 단순한 2-item 헤더.

```jsx
<header style={{
  position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
  height: 52,
  borderBottom: "1px solid #E0E0E0",
  background: "rgba(255,255,255,0.97)",
  backdropFilter: "blur(8px)",
  display: "flex", alignItems: "center", justifyContent: "space-between",
  padding: "0 24px",
}}>
  <Link href="/" style={{ fontSize: 13, fontWeight: 700,
                           letterSpacing: "0.15em", textTransform: "uppercase" }}>
    Prison of Literature
  </Link>
  <Link href="/about" style={{ fontSize: 11, letterSpacing: "0.1em",
                                color: "#767676", textTransform: "uppercase" }}>
    About
  </Link>
</header>
```

### 8-4. CSS 클래스 정의

```css
/* 리스트뷰 행 hover */
.book-row:hover { background: #FAFAFA !important; }
.book-row:hover .row-num { color: #C62828 !important; }

/* 썸네일 카드 hover */
.uniform-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
.uniform-card:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(0,0,0,0.1); }

/* fade-in (lazy load 애니메이션) */
@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
.fade-in { animation: fadeIn 400ms ease-out forwards; }

/* pill 필터 hover */
.filter-pill:hover { border-color: #999 !important; }
```

---

## 9. `pages/api/books.js` — 검색 파라미터 확장

```javascript
export default async function handler(req, res) {
  const {
    pageNo    = "1",
    numOfRows = "30",   // 20 → 30 (더 많은 데이터)
    q         = "",     // 텍스트 검색 추가
    koreanOnly = "true",
  } = req.query;

  const fetchRows = koreanOnly === "true"
    ? String(Math.min(parseInt(numOfRows) * 5, 100))
    : numOfRows;

  const params = new URLSearchParams({
    serviceKey: process.env.NLK_API_KEY,
    pageNo,
    numOfRows: fetchRows,
    type: "JSON",
    ...(q ? { title: q } : {}),
  });
  // 기존 fetch/parse 로직 유지
}
```

---

## 10. `next.config.js` 수정

```javascript
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [{ source: "/books", destination: "/", permanent: true }];
  },
};
module.exports = nextConfig;
```

---

## 11. 구현 우선순위

### Phase 1 — 핵심 기반 (즉시)
| 작업 | 파일 | 난이도 |
|---|---|---|
| ~~흰 테마 전환, 헤더 단순화~~ | ~~`_app.js`~~ | ~~낮음~~ |
| ~~히어로 제거 → 즉시 인덱스 레이아웃~~ | ~~`index.js` 전면 재작성~~ | ~~중간~~ |
| ~~리스트뷰 테이블 (Roma Publications 패턴)~~ | ~~`index.js`~~ | ~~중간~~ |
| ~~"Search Inmate" 검색바~~ | ~~`index.js`~~ | ~~낮음~~ |
| ~~정렬 가능 컬럼 헤더~~ | ~~`index.js`~~ | ~~중간~~ |
| ~~뷰 토글 버튼 (List / Grid)~~ | ~~`index.js`~~ | ~~낮음~~ |
| ~~CSS 죄수복 카드 그리드뷰~~ | ~~`index.js`~~ | ~~중간~~ |
| ~~`books.js` 삭제 + 리다이렉트~~ | ~~`next.config.js`~~ | ~~낮음~~ |

### Phase 2 — 필터 고도화
| 작업 | 파일 | 난이도 |
|---|---|---|
| ~~리스트뷰 패싯 사이드바~~ | ~~`index.js`~~ | ~~중간~~ |
| ~~썸네일뷰 pill 태그 필터~~ | ~~`index.js`~~ | ~~중간~~ |
| ~~연도 범위 필터~~ | ~~`index.js`~~ | ~~중간~~ |
| ~~URL 쿼리 파라미터 동기화~~ | ~~`index.js`~~ | ~~중간~~ |
| ~~Open Library 표지 이미지 + fallback~~ | ~~`index.js`~~ | ~~중간~~ |

### Phase 3 — 디테일
| 작업 | 파일 | 난이도 |
|---|---|---|
| 모바일 반응형 (필터 토글, 그리드 축소) | `index.js` | 중간 |
| ~~인라인 행 확장 상세 메타~~ | ~~`index.js`~~ | ~~높음~~ |
| ~~About 흰 배경 교체~~ | ~~`about.js`~~ | ~~낮음~~ |
| 키보드 접근성 (aria) | 전체 | 중간 |

---

## 12. 트레이드오프 종합

### 12-1. 히어로 페이지 제거
- **잃는 것**: "책은 죄수다" 개념적 임팩트 전달 장치
- **얻는 것**: 즉각 기능 접근, 레퍼런스 일관성
- **완화책**: 헤더 아래 한 줄 개념 설명 + 수감자 카운터 유지

### 12-2. 다크 → 화이트 테마
- **잃는 것**: 교도소 감시 시스템 분위기
- **얻는 것**: 레퍼런스 도서관/아카이브 미학, 가독성
- **완화책**: 빨간 accent(`#C62828`), 헤더/테이블 보더로 긴장감 유지

### 12-3. 기존 갤러리뷰 삭제 → CSS 죄수복 카드로 대체
- **잃는 것**: 실제 표지 이미지 기반 갤러리
- **얻는 것**: 프로젝트 개념과 완벽히 일치하는 시각 언어, 외부 의존 없음, 로딩 즉각
- **추가 옵션**: Open Library fallback으로 ISBN 있는 책은 실제 표지 표시 가능

### 12-4. 풀스크린 오버레이 네비 제거
- **잃는 것**: 인상적인 풀스크린 메뉴 애니메이션
- **얻는 것**: 단순하고 빠른 네비게이션
- **근거**: 페이지가 2개(Index + About)에 불과

### 12-5. 뷰 전환 시 필터 상태 유지
- **결정**: `view` 토글이 `filters`와 `q`를 초기화하지 않는다. 리스트뷰에서 검색하다가 썸네일뷰로 전환해도 같은 결과를 다른 레이아웃으로 보는 것.
- **이유**: 뷰는 표현 방식의 차이이지 데이터의 차이가 아니다.

### 12-6. 클라이언트 사이드 패싯 필터
- **잃는 것**: 전체 데이터셋에 대한 정확한 결과 (현재 페이지 내에만 적용)
- **얻는 것**: API 확장 없이 즉각 구현 가능
- **완화책**: `numOfRows` 확대(30→50 이상), 텍스트 검색은 API 레벨 처리

---

## 13. 수정 파일 목록 요약

| 파일 | 변경 유형 | 내용 |
|---|---|---|
| ~~`pages/_app.js`~~ | ~~대폭 수정~~ | ~~흰 테마, 단순 헤더, 오버레이 삭제~~ |
| ~~`pages/index.js`~~ | ~~**전면 재작성**~~ | ~~히어로 제거 → 검색+패싯+뷰토글+리스트/썸네일~~ |
| ~~`pages/books.js`~~ | ~~삭제~~ | ~~index.js로 통합~~ |
| ~~`pages/about.js`~~ | ~~경량 수정~~ | ~~색상 값만 흰 테마로 교체~~ |
| ~~`pages/api/books.js`~~ | ~~소폭 수정~~ | ~~`q` 파라미터 추가~~ |
| ~~`lib/helpers.js`~~ | ~~소폭 수정~~ | ~~상태 색상 흰 배경용으로 업데이트 + DC_creator 버그 수정~~ |
| ~~`next.config.js`~~ | ~~소폭 수정~~ | ~~`/books` → `/` 리다이렉트~~ |

---

## 14. 구현 시작 전 체크리스트

- [x] `Documents/GitHub/Prison-of-Literature`에서 작업 확인 (`pwd`)
- [x] `git pull origin main` 최신 동기화
- [x] Downloads 폴더 혼동 주의
- [x] Vercel 환경변수 `NLK_API_KEY` 설정 확인
- [x] `npm run dev`로 로컬 테스트 후 push

---

*plan.md v3 — Claude Sonnet 4.6 / 2026-04-14*
