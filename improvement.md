기술 스택 고도화 및 구조 개선 지침
본 문서는 AI 코딩 에이전트가 '문학의 감옥' 웹 사이트의 기존 구조적 결함을 해결하고, Next.js 기반의 고성능 문학 플랫폼으로 전환하기 위한 기술 규칙 및 구현 로드맵을 정의한다.
1. 아키텍처 및 디렉토리 구조 규칙 (FSD 패턴)
AI 에이전트는 코드 수정 및 파일 생성 시 다음의 Feature-Sliced Design (FSD) 계층 구조를 엄격히 준수해야 한다.
src/app/: Next.js App Router 정의 전용. 비즈니스 로직 포함 금지.
src/features/: 사용자 행동 단위 기능(예: SearchBook, AddReview).
src/entities/: 비즈니스 도메인 개체(예: Book, Author). 데이터 정규화 및 타입 정의 포함.
src/shared/: 재사용 가능한 UI 컴포넌트(components/ui/), 유틸리티(lib/), 전역 스타일.
에이전트 준수 규칙:
모든 파일 및 폴더 이름은 kebab-case를 사용한다.
UI 컴포넌트는 **Pure Component(Presentational)**로 유지하며, 비즈니스 로직은 .actions.ts 또는 커스텀 훅으로 격리한다.
상위 계층이 하위 계층을 참조하는 단방향 의존성 규칙을 유지한다.
2. 데이터 렌더링 및 성능 최적화 전략
대규모 도서 데이터를 효율적으로 처리하기 위해 다음 기술 사양을 적용한다.
2.1 하이브리드 렌더링 (ISR/SSR/SSG)
도서 상세 페이지: Incremental Static Regeneration (ISR)을 적용하여 빌드 시간을 단축하고 데이터 최신성을 유지한다.
검색/필터 결과: 실시간 쿼리 처리를 위해 Server-Side Rendering (SSR) 또는 클라이언트 사이드 스트리밍을 사용한다.
2.2 대규모 리스트 가상화 (Virtualization)
1,000개 이상의 도서 목록 렌더링 시 react-window 또는 react-virtualized를 필수 적용한다. 렌더링 요소 수 $R$은 다음 공식을 기준으로 계산하여 DOM 노드를 최소화한다:
$$R = \left\lceil \frac{H_{viewport}}{H_{item}} \right\rceil + Buffer$$
(여기서 $Buffer$는 스크롤 성능 향상을 위한 예비 노드이다.)
3. SEO 및 메타데이터 자동화 스크립트
에이전트는 모든 동적 경로(app/books/[id]/page.tsx)에 대해 다음을 구현해야 한다.
Metadata API: generateMetadata 함수를 구현하여 도서 제목, 저자, 비평 요약을 메타 태그에 자동 주입한다.
JSON-LD 주입: 검색 엔진 최적화를 위해 Book 타입의 구조화된 데이터를 페이지에 삽입한다.
필수 필드: name, author, datePublished, description.
이미지 최적화: 모든 도서 표지는 next/image를 사용하며, LCP 개선을 위해 최상단 이미지는 priority 속성을 부여한다.
4. 데이터 무결성 및 상태 관리
데이터 정규화: API 응답 데이터를 ID 기반의 Flat한 객체로 변환하여 관리한다.
불변성 유지: 상태 업데이트 시 Immer 등을 활용하여 불변 객체 구조를 유지하고 불필요한 리렌더링을 차단한다.
검색 최적화: 검색 필터링 시 ignoreAccents: false 설정을 통해 불필요한 문자열 연산을 방지한다.
5. AI 에이전트 가독성 설정 (AI Readiness)
에이전트가 프로젝트를 스스로 관리할 수 있도록 다음 파일을 루트 디렉토리에 생성/업데이트한다.
AGENTS.md: 프로젝트의 특정 규칙 및 Next.js 버전 맞춤 문서 위치를 명시한다.
llms.txt: 사이트 구조를 AI가 빠르게 파악할 수 있는 Markdown 요약본을 제공한다.
robots.txt: AI 봇이 프로젝트 문서를 인덱싱할 수 있도록 허용한다.

단계별 구현 체크리스트 (Agent Task List)
[ ] Task 1: 구조 개편 - src/ 디렉토리 생성 및 FSD 패턴에 따른 폴더 트리 구축.
[ ] Task 2: 렌더링 최적화 - 도서 상세 페이지에 ISR 도입 및 revalidate 설정.
[ ] Task 3: 성능 고도화 - 도서 목록 페이지에 react-window 적용 및 윈도잉 로직 구현.
[ ] Task 4: SEO 강화 - generateMetadata 연동 및 JSON-LD 스키마 템플릿 작성.
[ ] Task 5: 이미지 관리 - next/image 전환 및 CLS 방지를 위한 blur-up 효과 적용.
[ ] Task 6: AI 에이전트 최적화 - AGENTS.md 및 llms.txt 파일 생성.

