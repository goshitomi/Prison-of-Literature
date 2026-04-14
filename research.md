# Prison of Literature — 프로젝트 심층 분석 보고서

> 분석일: 2026-04-14  
> 분석 대상: `/Users/ohseongnoek/Downloads/Prison-of-Literature`  
> 저장소 브랜치: `main` (커밋 `01b6821`)  
> 기획서 반영: Google Docs 기획서 (`1cUHVCa8spCQHHQcNnjNUjxd4USRzVD-KhSi7pG48pTA`)

---

## 1. 프로젝트 개요

**Prison of Literature** (책은 죄수다)는 책장을 바라보다 발견한 **책과 죄수 사이의 놀라운 물리적·체계적 유사성**에서 출발한 개념 예술(Conceptual Art) 웹 프로젝트다.

국립중앙도서관(NLK)의 실제 장서 데이터를 교도소 수감자 기록 시스템으로 재해석하며, 서지 메타데이터를 죄수의 인적 사항으로 완전히 대치한다. 웹사이트를 통해 관람자는 수감자(도서)를 검색하고, 접견 신청서를 제출하는 경험을 함으로써 "책은 죄수다"라는 명제를 직접 체험하게 된다.

> **주목**: 이 프로젝트는 전시(Exhibition) 맥락에서 구현되는 설치 작품의 성격을 가진다.

### 핵심 은유 체계 (기획서 기준 완전판)

| 도서관 / 책의 개념 | 교도소 은유 | 구현 방식 |
|---|---|---|
| 책 (Book) | 수감자 (Inmate) | 모든 도서를 "수감자 파일"로 표시 |
| 책 제목 (Title) | 수감자 이름 (Name) | 수감자명으로 표기 |
| ISBN | 죄수 번호 (Prison ID) | Courier New 폰트 강조 |
| 청구기호 (Call Number) | 수인 번호 (Inmate No.) | 감방 위치 정보로 표기 |
| 판형 / 무게 | 신장 / 체중 (신체 스펙) | 메타데이터 그리드에 신체정보로 표시 |
| 초판 발행일 (Publication Date) | 생년월일 (Date of Birth) | 인적 사항란에 표기 |
| 대출 상태 (Loan Status) | 접견 허가 상태 | AVAILABLE / CHECKED_OUT / RESTRICTED |
| 대출 신청 | 접견 신청서 제출 | 폼 인터랙션 |
| 서가 / 서고 | 감방 (Cell) | 청구기호 = 수인 번호로 위치 표시 |
| 국립중앙도서관 | 서지교정국 (Dept. of Library Corrections) | 기관명 대체 |
| 책 표지 | 죄수복 (Prison Uniform) | 판형에 따라 S/M/L 규격화된 커버 |

---

## 2. 저장소 구조

### 현재 상태 (문제 있음)

```
Prison-of-Literature/              ← Git 루트
└── Prison-of-Literature_Folder/   ← Next.js 프로젝트 루트 (서브디렉토리)
    ├── .vercel/
    │   └── project.json
    ├── lib/
    │   └── helpers.js
    ├── pages/
    │   ├── index.js
    │   ├── about.js
    │   ├── books.js
    │   └── api/books.js
    ├── public/
    ├── next.config.js
    ├── package.json
    └── package-lock.json
```

**배포 실패 원인**: Git 루트(`Prison-of-Literature/`)와 Next.js 프로젝트 루트(`Prison-of-Literature_Folder/`)가 분리된 서브디렉토리 구조로 인해 Vercel의 `rootDirectory` 설정이 충돌. 과거 `vercel.json`을 루트로 이동하는 등 수정을 반복했으나 지속 실패. GitHub + Vercel 저장소 전체 삭제 후 재배포 필요.

### 목표 구조 (플랜 반영 후)

```
Prison-of-Literature/              ← Git 루트 = Next.js 루트 (일치)
├── lib/
│   └── helpers.js
├── pages/
│   ├── index.js
│   ├── about.js
│   ├── books.js
│   └── api/books.js
├── public/
│   └── nlk-building.jpg           ← 국립중앙도서관 전경 사진 (추가 예정)
├── next.config.js
├── package.json
├── .gitignore
└── .env.local                     ← API 키 환경변수화
```

---

## 3. 기술 스택

### 프레임워크 & 의존성

```json
{
  "name": "prison-of-literature",
  "dependencies": {
    "next": "14.2.21",
    "react": "18.3.1",
    "react-dom": "18.3.1"
  }
}
```

**외부 라이브러리가 전혀 없다.** UI 라이브러리(Tailwind, MUI 등), 상태관리(Redux, Zustand 등), 애니메이션 라이브러리(Framer Motion 등) 모두 불사용. 순수 React + Next.js Pages Router만으로 구성된 극도로 미니멀한 의존성이다.

### 스타일링

- **styled-jsx** (Next.js 내장): 전역 CSS는 `<style jsx global>{...}` 블록에 작성
- **인라인 스타일**: 컴포넌트별 세부 스타일은 모두 JSX `style` prop으로 처리
- CSS 모듈, Tailwind, PostCSS 등 빌드 타임 CSS 도구 미사용

### 폰트

- **Noto Sans KR** (300 / 400 / 500 / 700): 본문, UI 요소
- **Noto Serif KR** (400 / 700): 헤드라인, 제목, 강조 텍스트
- **Courier New** (시스템 폰트): 수감번호, ISBN, ID, 날짜 등 코드성 정보

### 배포

- **플랫폼**: Vercel (재연결 예정)
- **GitHub 저장소**: 삭제 후 재생성 예정
- **이전 배포 오류**: `rootDirectory` 설정 충돌로 인한 지속 실패 → GitHub·Vercel 저장소 전체 삭제

---

## 4. 라우팅 & 페이지 구조

### 기획서 요구사항 vs. 현재 구현 상태

| 기능 | 기획서 요구 | 현재 구현 상태 |
|---|---|---|
| 홈화면 | querida.si 레퍼런스 스타일 | 구현됨 (유사 방향) |
| About 전경 사진 | Full Width 국립중앙도서관 사진 | **미구현** (CSS 플레이스홀더) |
| About 텍스트 | 기획서 정확한 국문/영문 본문 | **부분 불일치** (간략화된 버전) |
| Index 리스트 뷰 | cyberfeminismindex.com 스타일 | 구현됨 |
| Index 갤러리 뷰 | shortnotice.studio 스타일 + 실제 표지 이미지 | **부분 구현** (이미지 없음) |
| 흑백→컬러 호버 | 전역 적용 | 갤러리 뷰에만 적용 |
| 확장형 네비게이터 | graffitiremovals.org 스타일, Arrow 클릭 풀사이즈 확장 | **미구현** |
| 메타데이터: 판형/무게 | 신장/체중으로 표시 | **미반영** |
| 메타데이터: 초판 발행일 | 생년월일로 표시 | **미반영** |
| 죄수복 S/M/L | 판형 기준 규격화 커버 | **미반영** |

---

### 4-1. 홈 (`/`, `pages/index.js`)

랜딩 페이지 겸 진입점. 주요 섹션:

1. **히어로 섹션** (100vh)
   - 배경: 1px 가로선 반복 패턴 (`repeating-linear-gradient`, 79px 간격)
   - 레이블: "서지교정국 — Dept. of Library Corrections"
   - 메인 타이틀: `Prison / of / Literature` (Noto Serif, `clamp(52px, 8.5vw, 130px)`)
   - 부제: "책은 죄수다" (`#C62828`)
   - 총 수감자 수 카운터: API 실시간 조회
   - CTA: "명부 보기 →", "About →"

2. **티커 섹션** (무한 가로 스크롤, 28초 주기)
   - AVAILABLE / 접견가능 / CHECKED OUT / 접견중 / RESTRICTED / 접견불가 / INMATE FILE / 수감자 기록 / PRISON OF LITERATURE / 책은 죄수다 / DEPT. OF LIBRARY CORRECTIONS / 서지교정국

3. **컨셉 섹션** (2컬럼 그리드)
   - 국문 "도서관은 감옥이다." / 영문 설명

4. **상태 키 섹션** (3컬럼): 접견가능 / 접견중 / 접견불가

5. **진입 CTA**: "수감자 명부 열람 →"

---

### 4-2. 소개 (`/about`, `pages/about.js`)

#### 현재 구현

- 국립중앙도서관 전경 사진 없음 (CSS 그라디언트 플레이스홀더)
- 약식 국문/영문 설명 (기획서 본문과 불일치)
- 제도적 정보 3컬럼, 개념 노트 Q&A

#### 기획서 요구 (업데이트 필요)

- **상단 주소**: "201, Banpo-daero, Seocho-gu, Seoul, Republic of Korea"
- **Full Width 전경 사진**: 국립중앙도서관 전경 이미지 (`/public/nlk-building.jpg`)
- **정확한 국문 본문**:
  > "'Prison of Literature(책은 죄수다)' 프로젝트는 우연히 책장을 바라보다 발견한 책과 죄수 사이의 놀라운 물리적, 체계적 유사성에서 시작되었습니다. 이 프로젝트에서 책의 모든 정보는 죄수의 인적 사항으로 재정의됩니다. 책의 제목은 죄수를 부르는 이름이 되며, 책의 판형과 무게는 죄수의 신장 및 체중과 같은 신체 스펙으로 재정의됩니다. 또한 초판 발행일은 죄수의 생년월일이 되고, 책을 체계적으로 관리하기 위해 부여된 고유 번호인 ISBN은 이 감옥에서 부여하는 죄수 번호의 역할을 수행합니다. 심지어 책의 청구기호는 죄수의 수인 번호로 재정의됩니다. 모든 책은 기존의 화려한 표지를 벗고, 판형에 따라 S, M, L 사이즈로 규격화된 '죄수복(북 커버)'을 입게 되며 책등에는 수감 번호가 부착됩니다."
- **정확한 영문 본문**:
  > "The project 'Prison of Literature' originated from the discovery of striking physical and systemic parallels between books and prisoners, observed by chance while gazing at a bookshelf. Within this framework, every piece of information regarding a book is reimagined as a prisoner's personal profile. The title of the book functions as the inmate's name, while its trim size and weight are redefined as physical attributes such as height and body mass. The date of first publication serves as the prisoner's date of birth, and the ISBN—the unique identifier used for systematic management—takes on the role of an inmate identification number within this prison. Furthermore, even the call number is repurposed as the specific inmate number assigned to the prisoner. Stripped of their vibrant original covers, all books are garbed in standardized 'prison uniforms'—custom book covers categorized into S, M, and L sizes according to their dimensions—with their inmate numbers clearly displayed on the spine."

---

### 4-3. 수감자 명부 (`/books`, `pages/books.js`)

단일 파일 SPA 구조. `pg` 상태값으로 세 뷰 전환.

#### 상태 변수

```javascript
const [pg, setPg] = useState("list");      // "list" | "detail" | "visit"
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
const [viewMode, setViewMode] = useState("list"); // "list" | "gallery"
const [searchOpen, setSearchOpen] = useState(false);
const [localQ, setLocalQ] = useState("");
const [scrolled, setScrolled] = useState(false);

const [sel, setSel] = useState(null);
const [vf, setVf] = useState({ n: "", r: "", s: "", a: false });
const [vs, setVs] = useState(false);
```

#### 뷰 A: 목록 (리스트 / 갤러리)

**리스트 뷰**: `<table>` 6컬럼 (No. / 수감자명 / 저자 / 연도 / 위치 / 접견상태)

**갤러리 뷰**: `repeat(auto-fill, minmax(200px, 1fr))` 그리드, `aspect-ratio: 3/4`
- 기본 흑백(`grayscale(100%)`), 호버 시 컬러 복원 — **기획서 요구사항과 일치**
- 현재는 단색 배경 플레이스홀더. **실제 책 표지 이미지 추가 필요**

#### 뷰 B: 상세 (Inmate File)

메타데이터 그리드 표시. **기획서 요구 추가 필드**:
- 판형/무게 → **신장/체중** 표시
- 초판 발행일 → **생년월일** 표시

#### 뷰 C: 접견 신청 (Visit Request)

상태별 분기: RESTRICTED→DENIED 스탬프 / CHECKED_OUT→IN PROGRESS / AVAILABLE→폼 → APPROVED 스탬프

---

### 4-4. 헤더 / 네비게이터 (미구현 핵심 기능)

#### 기획서 요구사항

- 레퍼런스: graffitiremovals.org
- **Arrow 클릭 → 풀 사이즈 확장 네비게이터**
  - 평소: 고정 헤더 (현재 구현과 유사)
  - Arrow 클릭 시: 전체 화면 크기로 확장
  - 확장 상태에서 각 메뉴 항목 호버 시: 해당 항목이 세로로 더 확장되는 인터랙션
- **네비게이션 항목**: About / Index / Search bar

#### 현재 구현

단순 링크 기반 헤더. 확장 없음.

---

### 4-5. API 라우트 (`/api/books`)

```
GET /api/books?pageNo=1&numOfRows=20&koreanOnly=true
```

NLK Open API 프록시. 한국어 필터 적용 (5배 요청 후 한국어만 필터링).

- **캐싱**: `s-maxage=300, stale-while-revalidate=600`
- **API 키**: 현재 소스코드 하드코딩 → `.env.local` 이동 예정
- **API URL**: `https://apis.data.go.kr/1371029/BookInformationService/getbookList`

---

## 5. 데이터 모델

### NLK API 원천 필드

```
BIBLIO_ID             서지 고유 ID
DCTERMS_title         제목 → 수감자 이름
DCTERMS_creator       저자
BIBO_isbn             ISBN → 죄수 번호
NLON_itemNumberOfNLK  청구기호 → 수인 번호
BIBFRAME_extent       형태사항 (판형·페이지수) → 신체 스펙
NLON_publicationPlace 발행지
NLON_localHolding     소장정보
DCTERMS_abstract      초록
NLON_genre            장르
```

### 파싱 후 내부 모델 (`lib/helpers.js: parse()`)

```typescript
type Book = {
  id: string;          // BIBLIO_ID
  title: string;       // 수감자 이름 (= 책 제목)
  creator: string;     // 저자
  isbn: string;        // 죄수 번호 (= ISBN)
  callNo: string;      // 수인 번호 (= 청구기호)
  extent: string;      // 신체 스펙 (= 판형/페이지)
  pubDate: string;     // 생년월일 (= 초판 발행일) ← 현재 미파싱
  holding: string;     // 소장정보
  abstract: string;    // 사건 개요
  genre: string;       // 장르
  status: "AVAILABLE" | "CHECKED_OUT" | "RESTRICTED";  // 시뮬레이션
  classification: "GENERAL" | "SPECIAL COLLECTION" | "RESTRICTED";
  charges: string;     // 기소 사유
  returnDate: string;  // 반납 예정일
  visitor: string;     // 접견인 ID
  year: string;        // 4자리 연도
  prisonSize: "S" | "M" | "L"; // 죄수복 사이즈 (= 판형) ← 미구현
}
```

### 시뮬레이션 로직 (결정적 해시)

동일 `BIBLIO_ID` → 항상 동일 상태 보장. `hash(id) % 100` 기반:

| 상태 | 범위 | 확률 |
|---|---|---|
| AVAILABLE | 0–54 | 55% |
| CHECKED_OUT | 55–79 | 25% |
| RESTRICTED | 80–99 | 20% |

분류 분포: GENERAL 70% / SPECIAL COLLECTION 20% / RESTRICTED 10%

---

## 6. 컴포넌트 구조

모든 컴포넌트는 `pages/books.js` 상단 인라인 정의:

| 컴포넌트 | 위치 | 역할 |
|---|---|---|
| `Badge` | books.js:13 | 상태 인라인 배지 (컬러 테두리) |
| `Loader` | books.js:27 | 로딩 스피너 + "조회 중…" |
| `Pager` | books.js:44 | Prev/Next 페이지네이션 |
| `Stamp` | books.js:80 | 회전 스탬프 (DENIED/IN PROGRESS/APPROVED) |
| `InfoBox` | books.js:107 | 좌측 테두리 정보 박스 |

**기획서 요구 추가 예정**:
- `ExpandNav` — 확장형 전체 화면 네비게이터

---

## 7. 시각 디자인 시스템

### 색상 팔레트

| 변수 | 값 | 용도 |
|---|---|---|
| DARK | `#0D0D0D` | 배경 |
| CREAM | `#F5F0E8` | 주 텍스트 |
| RESTRICTED | `#C62828` | 접견불가 / 강조 |
| CHECKED_OUT | `#C25700` | 접견중 |
| AVAILABLE | `#2B6E2B` | 접견가능 |

### 타이포그래피 계층

```
히어로: Noto Serif KR 700, clamp(52px, 8.5vw, 130px)
서브 제목: Noto Serif KR 700, clamp(22px, 2.8vw, 42px)
레이블: Noto Sans KR 400, 10px, letter-spacing 0.2–0.35em, uppercase
본문: Noto Sans KR 300, 13–14px, line-height 1.8–2.1
ID/코드: Courier New, 9–12px
```

### 디자인 레퍼런스 (기획서 명시)

| 페이지/요소 | 레퍼런스 URL |
|---|---|
| 홈화면 | querida.si |
| About 페이지 | amadoart.org/about |
| Index 리스트 뷰 | cyberfeminismindex.com |
| Index 갤러리 뷰 | shortnotice.studio/index |
| 헤더 네비게이터 | graffitiremovals.org |

---

## 8. 미구현 요소 (기획서 기준)

| 우선순위 | 항목 | 설명 |
|---|---|---|
| 높음 | 확장형 네비게이터 | graffitiremovals.org 스타일, Arrow 클릭 풀스크린 |
| 높음 | About 전경 사진 | 국립중앙도서관 Full Width 이미지 |
| 높음 | About 본문 텍스트 | 기획서 정확한 국문/영문 반영 |
| 중간 | 메타데이터 은유 확장 | 판형→신장/체중, 발행일→생년월일 |
| 중간 | 갤러리 실제 이미지 | NLK API 표지 이미지 (제공 여부 확인 필요) |
| 낮음 | 죄수복 S/M/L | 판형 기준 규격화 북 커버 시각화 |

---

## 9. 배포 이력 & 현황

- **GitHub 저장소**: 삭제됨
- **Vercel 프로젝트**: 삭제됨
- **실패 원인**: `Prison-of-Literature_Folder/` 서브디렉토리 구조 + `rootDirectory` 설정 충돌
- **해결 방향**: Next.js 파일을 Git 루트로 이동 → 서브디렉토리 구조 제거 → Vercel 기본 설정으로 배포

---

## 10. 주목할 설계 결정 & 트레이드오프

### 단일 파일 SPA (`books.js`, 1,059줄)
뷰 간 URL 변경 없이 `pg` 상태로 전환. 선택 도서를 메모리에서 바로 참조. 단, 코드가 길어져 유지보수 부담.

### 결정적 해시 시뮬레이션
`BIBLIO_ID` 기반 해시로 상태 결정 → 같은 책은 항상 같은 상태 보장. 하이드레이션 불일치 없음.

### 실제 데이터 기반
도서 데이터는 국립중앙도서관 실제 API. 접견 상태는 시뮬레이션. 현실과 허구의 결합이 작품의 핵심 긴장감.

### API 키 처리
현재 소스코드 직접 노출. Next.js API Route 서버사이드 실행이므로 클라이언트 미노출이나, `.env.local` + Vercel 환경변수로 이전 필요.

### 이미지 부재
표지 이미지 없이 CSS 단색으로 처리 중. NLK API가 표지 URL을 제공하지 않을 경우 외부 도서 이미지 API(ISBN 기반) 연동 고려.
