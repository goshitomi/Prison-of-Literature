# Prison of Literature — Agent Guidance

## 프로젝트 개요
국립중앙도서관(NLK) 오픈 API를 이용한 Next.js 14 도서 카탈로그 사이트.
교도소 수감자 명부 테마. Roma Publications 스타일 정렬 가능 테이블 UI.
배포: `prison-of-literature.vercel.app` (GitHub → Vercel 자동 배포)

## 기술 스택
- **Next.js 14** — App Router (`src/app/`)
- **TypeScript** — 전체 프로젝트
- **react-window** — 대규모 목록 가상화 (100개 이상 시 자동 활성화)
- **NLK Open API** — 국립중앙도서관 서지 데이터
- **Google Books API** — 검색 기능 (NLK는 검색 파라미터 미지원)
- **next/image** — 도서 표지 최적화

## 디렉토리 구조 (FSD 패턴)
```
src/
  app/             # Next.js App Router (라우팅만)
    api/books/     # GET /api/books  — NLK 브라우징 + Google Books 검색
    api/books/[id] # GET /api/books/:id — 단일 도서 조회
    books/[id]/    # 도서 상세 페이지 (ISR, revalidate: 86400)
    about/         # 프로젝트 소개 (Server Component)
    _components/   # layout 전용 컴포넌트 (Header 등)
  shared/
    config/        # design-tokens.ts — FONT, ACCENT, ROW_BORDER 등
    lib/           # helpers.ts, nlk-api.ts, google-books-api.ts
    ui/            # StatusBadge, SortTh, FilterBtn, Pager
  entities/
    book/
      model/       # types.ts (Book, NLKRawItem, BookFilters), parse.ts
      ui/          # BookRow, UniformCard, InlineDetail
  features/
    book-list/ui/  # ListView (react-window), GridView (react-window)
    search-books/  # SearchForm
    filter-books/  # FilterBar
```

## NLK API 핵심 제약
| 항목 | 내용 |
|------|------|
| 페이지당 최대 | 20개 반환 (numOfRows 무시됨) |
| 검색 파라미터 | title/author 등 무시 — BIBLIO_ID 순 반환만 지원 |
| 한국 단행본 시작 | `KOR_MONO_START = 120_000` (pageNo ≈ 120,000) |
| 병렬 fetch 전략 | 3페이지 × 20개 = 60 raw → 필터 후 30개 확보 |
| 도서 판별 | `RDF_type[]` + `BIBO_degree` (ISBN은 대부분 null) |
| 실제 저자 필드 | `DC_creator[]` (`DCTERMS_creator`는 항상 null) |
| 실제 발행 연도 | `NLON_issuedYear` (`DCTERMS_issued`는 형식 불일정) |

## 도서 ID 규칙 (URL 용)
- NLK 도서: `nlk-{BIBLIO_ID}` → `/books/nlk-MONO1234567890`
- Google Books: `gb-{volumeId}` → `/books/gb-abc123xyz`

## 렌더링 전략
| 페이지 | 전략 | 이유 |
|--------|------|------|
| `/` | SSR (초기 데이터) + Client (인터랙션) | 검색·필터·정렬 |
| `/about` | Server Component | 정적 콘텐츠 |
| `/books/[id]` | ISR (`revalidate: 86400`) | SEO + 데이터 최신성 |
| `/api/books` | Dynamic Route Handler | NLK/Google Books 프록시 |

## 디자인 토큰
- `FONT`: `"Arial, Helvetica, sans-serif"`
- `ACCENT`: `"#C62828"` (빨강)
- `ROW_BORDER`: `"#FFE0E0"` (연한 빨강)
- Roma Publications 패턴 준수: 흰 배경, 정렬 가능 테이블

## 에이전트 준수 규칙
1. 모든 파일·폴더: kebab-case
2. UI 컴포넌트: Pure Component (비즈니스 로직은 hooks/actions로 격리)
3. 상위 계층이 하위 계층만 참조 (단방향 의존성: app → features → entities → shared)
4. 클라이언트 컴포넌트에는 `"use client"` 필수
5. 이미지는 `next/image` 사용 (LCP 최상단 이미지에 `priority={true}`)
6. 새 NLK 필드 발견 시 `src/entities/book/model/types.ts`의 `NLKRawItem` 업데이트

## 테스트 방법
```bash
npm run dev   # 개발 서버 (localhost:3000)
npm run build # 프로덕션 빌드 확인
```

## 배포
```bash
git push origin main
# → Vercel이 GitHub webhook 감지 → npm run build → 자동 배포
```
