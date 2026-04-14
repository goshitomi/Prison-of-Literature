# Prison of Literature — 수정 이력 및 계획

## 프로젝트 개요

**Prison of Literature** (`prison-of-literature.vercel.app`)
국립중앙도서관(NLK) 오픈 API를 이용한 Next.js 14 도서 카탈로그 사이트.
교도소 수감자 명부 테마. Roma Publications 스타일 정렬 가능 테이블 UI.

---

## 기술 스택

- Next.js 14 (Pages Router)
- `pages/api/books.js` — NLK/Google Books API 프록시 (서버사이드)
- `lib/helpers.js` — 클라이언트 파싱 유틸 (`parse()`, sim* 함수들)
- `pages/index.js` — 메인 페이지 컴포넌트
- 배포: Vercel (GitHub Desktop으로 수동 push)

---

## NLK API 제약 사항 (발견된 사실)

| 항목 | 내용 |
|------|------|
| 페이지당 최대 | 20개 반환 (numOfRows 무시됨) |
| 검색 파라미터 | title/author/kwd 모두 무시 — BIBLIO_ID 순 반환만 지원 |
| 자료 순서 | CDM(중국 학위논문) → CMO → KDM(한국 학위논문) → KJU/KMO(한국 단행본) |
| 한국 단행본 시작 | pageNo ≈ 120,000 (numOfRows=20 기준) |
| 도서 판별 필드 | `RDF_type[]` (bibo URI 배열) + `BIBO_degree` |
| 실제 저자 필드 | `DC_creator[]` (배열) — `DCTERMS_creator`는 항상 null |
| 실제 발행 연도 | `NLON_issuedYear` — `DCTERMS_issued`는 형식 불일정 |

---

## 완료된 수정 사항

### 1단계 — 도서 이외 자료 필터링
- `isBookItem()` 함수 추가: `BIBO_degree`(학위논문) + `RDF_type[]` URI 매칭으로 판별
- 제외 대상: Thesis, Article, AcademicArticle, LegalDocument, Periodical, Journal, Newspaper, Issue
- 포함 조건: `RDF_type[]`에 "Book" URI가 명시된 것만

**버그 기록**: ISBN 존재 여부로 도서 판별 시도 → NLK는 대부분 `BIBO_isbn: null` 반환 → 결과 0건. `RDF_type[]` 방식으로 수정.

### 2단계 — 한국 단행본 페이지 오프셋
- `KOR_MONO_START = 120_000` 상수 추가
- 사용자 pageNo 1 → API pageNo 120,001부터 시작
- 3페이지 병렬 fetch × 20개 = 60개 raw → 필터 후 30개 안정 확보 (KMO 구간 한국어 도서 밀도 ~85%)

### 3단계 — 판형/청구기호/페이지 번호 개선
- `prisonSize()`: S/M/L 버킷 변환 제거 → 원본 cm 값 그대로 반환 (`"23cm"`)
- `callNo`: 분류기호 + 청구기호 결합 (`NLON_classificationNumberOfNLK` + `NLON_itemNumberOfNLK`)
- `ListView`에 `pageOffset` prop 추가 → 2페이지 No.가 31부터 시작하도록 수정

### 4단계 — 청구기호 한글 미표시 수정
- `BookRow` callNo `<td>` fontFamily: `"Courier New, monospace"` → `'"Courier New", "Apple SD Gothic Neo", "Malgun Gothic", monospace'`

### 5단계 — 검색 기능 구현 (Google Books API)
- NLK API는 검색 파라미터를 완전히 무시함 → Google Books API로 대체
- `books.js`에 `parseGoogleBook()`, `searchGoogleBooks()` 함수 추가
- `q` 파라미터 존재 시 Google Books로 라우팅 (langRestrict=ko, printType=books)
- Google Books 결과는 서버에서 pre-parse → `_parsed: true` 플래그 포함
- `index.js` `load()`: `_parsed: true` 아이템은 `parse()` 스킵

### 6단계 — 접견상태 위치 변경
- 리스트뷰 테이블에서 "접견상태" 컬럼 제거 (colSpan 7→6)
- 책 클릭 시 펼쳐지는 `InlineDetail` 패널에 접견상태 뱃지 추가
- 접견 중(CHECKED_OUT)일 경우 반납예정일 + 방문자 번호도 함께 표시

### 7단계 — 책 표지 썸네일
- `InlineDetail`: 표지 이미지 좌측 표시 (width: 80px)
  - 우선순위: `book.coverUrl` (Google Books) → Open Library `covers.openlibrary.org/b/isbn/{isbn}-M.jpg`
  - 이미지 로드 실패 시 imgError 상태로 숨김
- `UniformCard` (그리드뷰): 동일한 커버 우선순위 로직 적용

### Simplify 수정
- `totalCount: r1.totalCount || r2.totalCount || r3.totalCount` → `r1.totalCount` (세 페이지 모두 동일한 totalCount 반환)

---

## 파일별 현재 상태

### `pages/api/books.js`
```
import { simStatus, simClass, simReturn, simVisitor, simCharges } from "../../lib/helpers.js"

const KOR_MONO_START = 120_000
const GOOGLE_BOOKS_BASE = "https://www.googleapis.com/books/v1/volumes"

handler(req, res):
  q 있으면 → searchGoogleBooks() → 즉시 반환
  koreanOnly=true → 3페이지 병렬 fetch + isBookItem + isKoreanItem 필터 → 30개 반환
  else → 단순 단일 fetch
```

### `lib/helpers.js`
```
prisonSize(extent): cm 값 그대로 반환 ("23cm")
parse(item): callNo = classificationNumber + " " + itemNumber
             creator = DC_creator[] (배열 join)
             pubYear = NLON_issuedYear 우선
```

### `pages/index.js`
```
InlineDetail: 표지 이미지 | 접견상태 뱃지 | 서지 정보 그리드
BookRow: 청구기호 td에 한글 폰트 폴백 포함, 접견상태 컬럼 없음
ListView: 컬럼 6개 (No. / 수감자명 / 저자 / 발행 / 판형 / 청구기호)
UniformCard: coverUrl → isbn → 스트라이프 패턴 순으로 커버 표시
load(): _parsed 아이템은 parse() 스킵
```

---

## 알려진 한계 / 향후 고려사항

- NLK 브라우징은 KOR_MONO_START 오프셋 고정 → 실제 KMO 시작 페이지가 변경되면 오프셋 조정 필요
- Google Books API 무인증 사용 → 일일 쿼리 제한 존재 (약 1,000회/일)
- 검색 결과 페이지네이션 미구현 (Google Books는 maxResults=30으로 1페이지만 반환)
- Open Library 커버 이미지는 ISBN 없는 구간 도서에서 표시 안 됨
