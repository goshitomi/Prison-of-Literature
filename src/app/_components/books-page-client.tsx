"use client";

import React, { useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SearchForm } from "@/features/search-books/ui/search-form";
import { FilterBar } from "@/features/filter-books/ui/filter-bar";
import { ListView } from "@/features/book-list/ui/list-view";
import { GridView } from "@/features/book-list/ui/grid-view";
import { Pager } from "@/shared/ui/pager";
import { FONT, MUTED, ROW_BORDER, PER_PAGE, ACCENT } from "@/shared/config/design-tokens";
import { parseBook } from "@/entities/book/model/parse";
import type { Book, BookFilters, SortCol } from "@/entities/book/model/types";

interface BooksPageClientProps {
  initialBooks: Book[];
  initialTotal: number;
  initialPage:  number;
  initialView:  "list" | "grid";
  initialQ:     string;
}

export function BooksPageClient({
  initialBooks,
  initialTotal,
  initialPage,
  initialView,
  initialQ,
}: BooksPageClientProps) {
  const router       = useRouter();
  const searchParams = useSearchParams();

  /* ── 데이터 상태 ── */
  const [books,   setBooks]   = useState<Book[]>(initialBooks);
  const [total,   setTotal]   = useState<number | null>(initialTotal);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [pn,      setPn]      = useState(initialPage);

  /* ── UI 상태 ── */
  const [view,       setView]       = useState<"list" | "grid">(initialView);
  const [q,          setQ]          = useState(initialQ);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortCol,    setSortCol]    = useState<SortCol>("title");
  const [sortDir,    setSortDir]    = useState<"asc" | "desc">("asc");
  const [filters,    setFilters]    = useState<BookFilters>({
    status: [], yearFrom: "", yearTo: "", classification: [],
  });

  /* ── 클라이언트 사이드 데이터 로드 ── */
  const load = useCallback(async (page = 1, searchQ = "") => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        pageNo:     String(page),
        numOfRows:  String(PER_PAGE),
        koreanOnly: "true",
      });
      if (searchQ.trim()) params.set("q", searchQ.trim());
      const res = await fetch(`/api/books?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data?.error) throw new Error(data.error);
      const body = data?.body ?? data;
      setBooks(
        (body?.items ?? []).map((item: Book) => (item._parsed ? item : parseBook(item as never)))
      );
      setTotal(body?.totalCount ?? 0);
      setPn(page);
      setExpandedId(null);
    } catch (e) {
      setError((e as Error).message);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /* ── 검색 ── */
  const searchRef = useRef(q);
  searchRef.current = q;

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      load(1, searchRef.current);
      const params = new URLSearchParams(searchParams?.toString() ?? "");
      if (searchRef.current) params.set("q", searchRef.current);
      else params.delete("q");
      router.replace(`?${params}`, { scroll: false });
    },
    [load, router, searchParams],
  );

  /* ── 필터 ── */
  function handleFilterChange(group: string, key: string) {
    if (group === "reset") {
      setFilters({ status: [], yearFrom: "", yearTo: "", classification: [] });
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

  /* ── 뷰 전환 ── */
  function switchView(v: "list" | "grid") {
    setView(v);
    setExpandedId(null);
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    params.set("view", v);
    router.replace(`?${params}`, { scroll: false });
  }

  /* ── 정렬 ── */
  function toggleSort(col: SortCol) {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortCol(col); setSortDir("asc"); }
  }

  /* ── 클라이언트 필터 + 정렬 ── */
  let display = books.filter((book) => {
    if (filters.status.length         && !filters.status.includes(book.status))               return false;
    if (filters.classification.length && !filters.classification.includes(book.classification)) return false;
    if (filters.yearFrom && parseInt(book.year) < parseInt(filters.yearFrom)) return false;
    if (filters.yearTo   && parseInt(book.year) > parseInt(filters.yearTo))   return false;
    return true;
  });
  display = [...display].sort((a, b) => {
    const va = a[sortCol] ?? "";
    const vb = b[sortCol] ?? "";
    const cmp = String(va).localeCompare(String(vb), "ko");
    return sortDir === "asc" ? cmp : -cmp;
  });

  const totalPages = Math.ceil((total ?? 0) / PER_PAGE);
  const hasActive  =
    filters.status.length > 0 || filters.classification.length > 0 ||
    !!filters.yearFrom || !!filters.yearTo;

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
            {total !== null && (
              <span style={{ fontFamily: FONT, fontSize: 11, color: MUTED }}>
                {total.toLocaleString()}명 수감 중
              </span>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <SearchForm q={q} onChange={setQ} onSubmit={handleSearch} />

            {/* 뷰 토글 */}
            <div style={{ display: "flex", gap: 6 }}>
              {(
                [
                  { id: "list" as const, icon: "≡" },
                  { id: "grid" as const, icon: "⊞" },
                ] as { id: "list" | "grid"; icon: string }[]
              ).map(({ id, icon }) => (
                <button
                  key={id}
                  title={id}
                  onClick={() => switchView(id)}
                  style={{
                    fontFamily: FONT,
                    fontSize:   15,
                    lineHeight: 1,
                    background: "none",
                    border:     "none",
                    padding:    "0 2px",
                    color:      view === id ? "#000" : "#CCC",
                    fontWeight: view === id ? "bold" : "normal",
                    cursor:     "pointer",
                    transition: "color 0.1s",
                  }}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── 필터 바 ── */}
        <FilterBar filters={filters} onChange={handleFilterChange} />

        {/* ── 에러 ── */}
        {error && (
          <div
            style={{
              fontFamily: FONT, fontSize: 12,
              padding: "6px 0", color: ACCENT,
              borderTop: `1px solid ${ROW_BORDER}`,
            }}
          >
            오류: {error}
          </div>
        )}

        {/* ── 리스트뷰 ── */}
        {view === "list" && (
          <>
            {loading && <LoadingRow />}
            {!loading && !error && display.length === 0 && (
              <EmptyRow hasActive={hasActive} />
            )}
            {!loading && display.length > 0 && (
              <>
                <CountRow books={books} display={display} hasActive={hasActive} />
                <ListView
                  books={display}
                  pageOffset={(pn - 1) * PER_PAGE}
                  sortCol={sortCol}
                  sortDir={sortDir}
                  onSort={toggleSort}
                  expandedId={expandedId}
                  onToggle={handleToggle}
                />
              </>
            )}
          </>
        )}

        {/* ── 그리드뷰 ── */}
        {view === "grid" && (
          <>
            {loading && (
              <div
                style={{
                  fontFamily: FONT, fontSize: 12,
                  padding: "40px 0", color: MUTED, textAlign: "center",
                  borderTop: `1px solid ${ROW_BORDER}`,
                }}
              >
                조회 중…
              </div>
            )}
            {!loading && display.length > 0 && (
              <div style={{ paddingTop: 20 }}>
                <GridView
                  books={display}
                  expandedId={expandedId}
                  onToggle={handleToggle}
                />
              </div>
            )}
          </>
        )}

        {/* ── 페이지네이션 ── */}
        {!loading && (
          <Pager pn={pn} totalPages={totalPages} onLoad={(p) => load(p, q)} />
        )}
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
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <tbody>
        <tr>
          <td
            style={{
              fontFamily: FONT, fontSize: 12,
              padding: "32px 0 32px 16px",
              borderTop: `1px solid ${ROW_BORDER}`,
              color: MUTED,
            }}
          >
            <span
              style={{
                display: "inline-block", width: 11, height: 11,
                border: "1.5px solid #DDD", borderTop: "1.5px solid #999",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
                marginRight: 8, verticalAlign: "middle",
              }}
            />
            조회 중…
          </td>
        </tr>
      </tbody>
    </table>
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

function CountRow({ books, display, hasActive }: { books: Book[]; display: Book[]; hasActive: boolean }) {
  return (
    <div
      style={{
        fontFamily: FONT, fontSize: 11, color: MUTED,
        padding: "4px 0",
        borderTop: `1px solid ${ROW_BORDER}`,
      }}
    >
      {hasActive
        ? `${display.length}명 / 필터 결과 (페이지 내 ${books.length}명 중)`
        : `${books.length}명 / 이 페이지`}
    </div>
  );
}
