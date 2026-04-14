"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { SearchForm } from "@/features/search-books/ui/search-form";
import { FilterBar } from "@/features/filter-books/ui/filter-bar";
import { ListView } from "@/features/book-list/ui/list-view";
import { FONT, MUTED, ROW_BORDER, ACCENT } from "@/shared/config/design-tokens";
import { parseBook } from "@/entities/book/model/parse";
import type { Book, BookFilters, SortCol } from "@/entities/book/model/types";

const MAX_BOOKS      = 1000;
const EMPTY_FILTERS: BookFilters = { status: [], yearFrom: "", yearTo: "", classification: [] };

interface BooksPageClientProps {
  initialBooks: Book[];
  initialQ:     string;
}

export function BooksPageClient({ initialBooks, initialQ }: BooksPageClientProps) {
  /* ── 데이터 상태 ── */
  const [allBooks,  setAllBooks]  = useState<Book[]>(initialBooks);
  const [accPage,   setAccPage]   = useState(1);        // 다음에 불러올 accPage (서버가 0 로드)
  const [hasMore,   setHasMore]   = useState(initialBooks.length >= 1); // 초기 로드가 있으면 more 시도
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [isSearch,  setIsSearch]  = useState(Boolean(initialQ));

  /* ── UI 상태 ── */
  const [q,          setQ]          = useState(initialQ);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortCol,    setSortCol]    = useState<SortCol>("title");
  const [sortDir,    setSortDir]    = useState<"asc" | "desc">("asc");

  /* 필터: pending(UI) vs applied(검색 시 적용) */
  const [filters,        setFilters]        = useState<BookFilters>(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<BookFilters>(EMPTY_FILTERS);

  const sentinelRef = useRef<HTMLDivElement>(null);

  /* ── 무한 스크롤: 다음 NLK ISBN 배치 로드 ── */
  const loadMore = useCallback(async () => {
    if (loading || !hasMore || isSearch || allBooks.length >= MAX_BOOKS) return;
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch(`/api/books?accPage=${accPage}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data?.error) throw new Error(data.error);
      const newBooks: Book[] = (data.items ?? []).map(
        (item: Book) => (item._parsed ? item : parseBook(item as never)),
      );
      setAllBooks((prev) => {
        const combined = [...prev, ...newBooks];
        return combined.slice(0, MAX_BOOKS);
      });
      setAccPage((p) => p + 1);
      if (!data.hasMore || newBooks.length === 0 || allBooks.length + newBooks.length >= MAX_BOOKS) {
        setHasMore(false);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, isSearch, allBooks.length, accPage]);

  /* ── IntersectionObserver: 센티널 감지 시 loadMore ── */
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore(); },
      { rootMargin: "400px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  /* ── 검색 ── */
  const searchRef = useRef(q);
  searchRef.current = q;

  const handleSearch = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setAppliedFilters(filters);
      const term = searchRef.current.trim();

      if (!term) {
        /* 검색 초기화 → 브라우징 모드 복귀 */
        setIsSearch(false);
        setAllBooks(initialBooks);
        setAccPage(1);
        setHasMore(true);
        setExpandedId(null);
        return;
      }

      setIsSearch(true);
      setLoading(true);
      setError(null);
      setExpandedId(null);
      try {
        const res  = await fetch(`/api/books?q=${encodeURIComponent(term)}&numOfRows=30`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data?.error) throw new Error(data.error);
        setAllBooks(
          (data.items ?? []).map((item: Book) => (item._parsed ? item : parseBook(item as never))),
        );
        setHasMore(false); // 검색 결과는 무한 스크롤 없음
      } catch (err) {
        setError((err as Error).message);
        setAllBooks([]);
      } finally {
        setLoading(false);
      }
    },
    [filters, initialBooks],
  );

  /* ── 필터 UI 변경 (pending 상태만) ── */
  function handleFilterChange(group: string, key: string) {
    if (group === "reset") {
      setFilters(EMPTY_FILTERS);
      setAppliedFilters(EMPTY_FILTERS);
      return;
    }
    if (group === "yearFrom" || group === "yearTo") {
      setFilters((prev) => ({ ...prev, [group]: key }));
      return;
    }
    setFilters((prev) => {
      const arr = prev[group as keyof BookFilters] as string[];
      return { ...prev, [group]: arr.includes(key) ? arr.filter((v) => v !== key) : [...arr, key] };
    });
  }

  /* ── 정렬 ── */
  function toggleSort(col: SortCol) {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortCol(col); setSortDir("asc"); }
  }

  /* ── 적용된 필터 + 정렬로 display 계산 ── */
  let display = allBooks.filter((book) => {
    if (appliedFilters.status.length         && !appliedFilters.status.includes(book.status))                return false;
    if (appliedFilters.classification.length && !appliedFilters.classification.includes(book.classification)) return false;
    if (appliedFilters.yearFrom && parseInt(book.year) < parseInt(appliedFilters.yearFrom)) return false;
    if (appliedFilters.yearTo   && parseInt(book.year) > parseInt(appliedFilters.yearTo))   return false;
    return true;
  });
  display = [...display].sort((a, b) => {
    const va = a[sortCol] ?? "";
    const vb = b[sortCol] ?? "";
    const cmp = String(va).localeCompare(String(vb), "ko");
    return sortDir === "asc" ? cmp : -cmp;
  });

  const hasActive =
    appliedFilters.status.length > 0 || appliedFilters.classification.length > 0 ||
    !!appliedFilters.yearFrom || !!appliedFilters.yearTo;

  const handleToggle = useCallback(
    (id: string) => setExpandedId((prev) => (prev === id ? null : id)),
    [],
  );

  return (
    <>
      <main style={{ padding: "0 24px 48px", fontFamily: FONT }}>
        {/* ── 서브헤더 ── */}
        <div
          style={{
            display:        "flex",
            alignItems:     "center",
            justifyContent: "space-between",
            padding:        "8px 0",
            borderBottom:   `1px solid ${ROW_BORDER}`,
            flexWrap:       "wrap",
            gap:            8,
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span style={{ fontFamily: FONT, fontSize: 12, fontWeight: "bold" }}>수감자 명부</span>
            <span style={{ fontFamily: FONT, fontSize: 11, color: MUTED }}>
              {isSearch
                ? `${display.length}건 검색 결과`
                : `${allBooks.length.toLocaleString()}명 로드 / ${MAX_BOOKS.toLocaleString()}명 한도`}
            </span>
          </div>
          <SearchForm q={q} onChange={setQ} onSubmit={handleSearch} />
        </div>

        {/* ── 필터 바 ── */}
        <FilterBar filters={filters} onChange={handleFilterChange} />

        {/* ── 에러 ── */}
        {error && (
          <div style={{ fontFamily: FONT, fontSize: 12, padding: "6px 0", color: ACCENT, borderTop: `1px solid ${ROW_BORDER}` }}>
            오류: {error}
          </div>
        )}

        {/* ── 목록 ── */}
        {!loading && !error && display.length === 0 && (
          <EmptyRow hasActive={hasActive} />
        )}
        {display.length > 0 && (
          <>
            {hasActive && (
              <div style={{ fontFamily: FONT, fontSize: 11, color: MUTED, padding: "4px 0", borderTop: `1px solid ${ROW_BORDER}` }}>
                {display.length}명 / 필터 결과 (로드된 {allBooks.length}명 중)
              </div>
            )}
            <ListView
              books={display}
              pageOffset={0}
              sortCol={sortCol}
              sortDir={sortDir}
              onSort={toggleSort}
              expandedId={expandedId}
              onToggle={handleToggle}
            />
          </>
        )}

        {/* ── 로딩 인디케이터 ── */}
        {loading && <LoadingRow />}

        {/* ── 완료 메시지 ── */}
        {!loading && !hasMore && allBooks.length > 0 && !isSearch && (
          <div
            style={{
              fontFamily: FONT, fontSize: 11, color: MUTED,
              padding: "14px 0", textAlign: "center",
              borderTop: `1px solid ${ROW_BORDER}`,
            }}
          >
            {allBooks.length >= MAX_BOOKS
              ? `${MAX_BOOKS.toLocaleString()}명 수감자 명부 완료`
              : `${allBooks.length}명 전체 로드 완료`}
          </div>
        )}

        {/* ── 무한 스크롤 센티널 ── */}
        <div ref={sentinelRef} style={{ height: 1 }} />
      </main>

      <footer
        style={{
          borderTop:      `1px solid ${ROW_BORDER}`,
          padding:        "6px 24px",
          display:        "flex",
          justifyContent: "space-between",
          alignItems:     "center",
          fontFamily:     FONT,
          fontSize:       11,
          color:          MUTED,
        }}
      >
        <span>Prison of Literature — 서지교정국 — Dept. of Library Corrections</span>
        <span>국립중앙도서관 오픈 API</span>
      </footer>
    </>
  );
}

/* ── 보조 컴포넌트 ── */
function LoadingRow() {
  return (
    <div
      style={{
        fontFamily: FONT, fontSize: 12,
        padding: "24px 0 24px 16px",
        borderTop: `1px solid ${ROW_BORDER}`,
        color: MUTED,
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      <span
        style={{
          display: "inline-block", width: 11, height: 11,
          border: "1.5px solid #DDD", borderTop: "1.5px solid #999",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
          flexShrink: 0,
        }}
      />
      수감자 명부 수집 중…
    </div>
  );
}

function EmptyRow({ hasActive }: { hasActive: boolean }) {
  return (
    <div
      style={{
        fontFamily: FONT, fontSize: 12,
        padding: "14px 0 14px 16px",
        borderTop: `1px solid ${ROW_BORDER}`,
        color: MUTED,
      }}
    >
      {hasActive ? "현재 필터 조건에 맞는 수감자가 없습니다." : "검색 결과가 없습니다."}
    </div>
  );
}
