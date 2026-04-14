"use client";

import React, { useCallback } from "react";
import { List } from "react-window";
import type { RowComponentProps } from "react-window";
import { BookRow } from "@/entities/book/ui/book-row";
import { SortTh } from "@/shared/ui/sort-th";
import { FONT, ROW_BORDER, VIRTUALIZATION_THRESHOLD } from "@/shared/config/design-tokens";
import type { Book, SortCol } from "@/entities/book/model/types";

const ROW_BASE_HEIGHT   = 26;  // 기본 행 높이 (px)
const ROW_EXPAND_HEIGHT = 240; // 확장 행 높이 (px, 근사치)

interface ListViewProps {
  books:      Book[];
  pageOffset: number;
  sortCol:    string;
  sortDir:    "asc" | "desc";
  onSort:     (col: SortCol) => void;
  expandedId: string | null;
  onToggle:   (id: string) => void;
}

/* ─── 일반 테이블 렌더링 (< VIRTUALIZATION_THRESHOLD) ─── */
function PlainListView({
  books, pageOffset, sortCol, sortDir, onSort, expandedId, onToggle,
}: ListViewProps) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table
        style={{
          width:          "100%",
          borderCollapse: "collapse",
          fontFamily:     FONT,
          fontSize:       12,
          lineHeight:     "1.4em",
          minWidth:       580,
        }}
      >
        <thead>
          <tr>
            <th
              style={{
                fontFamily:  FONT,
                fontSize:    12,
                fontWeight:  "bold",
                lineHeight:  "1.4em",
                padding:     "2px 0 4px 16px",
                borderTop:   "2px solid #000",
                width:       44,
                textAlign:   "left",
                userSelect:  "none",
                whiteSpace:  "nowrap",
              }}
            >
              No.
            </th>
            <SortTh col="title"      label="수감자 / TITLE"    sortCol={sortCol} sortDir={sortDir} onSort={onSort} />
            <SortTh col="isbn"       label="ISBN"               sortCol={sortCol} sortDir={sortDir} onSort={onSort} />
            <SortTh col="year"       label="발행 / YEAR"       sortCol={sortCol} sortDir={sortDir} onSort={onSort} style={{ width: 52 }} />
            <SortTh col="prisonSize" label="판형 / SIZE"       sortCol={sortCol} sortDir={sortDir} onSort={onSort} style={{ width: 56 }} />
            <SortTh col="callNo"     label="청구기호"           sortCol={sortCol} sortDir={sortDir} onSort={onSort} style={{ width: 160 }} />
          </tr>
        </thead>
        <tbody>
          {books.map((book, i) => (
            <BookRow
              key={book.id}
              book={book}
              idx={pageOffset + i}
              expanded={expandedId === book.id}
              onToggle={onToggle}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── 가상화 행 (react-window v2) ─── */
/*
 * rowProps에는 금지 키(ariaAttributes, index, style) 제외.
 * rowComponent 함수는 금지 키 + rowProps를 함께 받는다.
 */
interface RowCustomProps {
  books:      Book[];
  pageOffset: number;
  expandedId: string | null;
  onToggle:   (id: string) => void;
}

type VirtualRowProps = RowComponentProps<RowCustomProps>;

const GRID_COLS = "44px 1fr 180px 52px 56px 160px";

function VirtualRow({
  ariaAttributes, index, style, books, pageOffset, expandedId, onToggle,
}: VirtualRowProps) {
  const book = books[index];
  if (!book) return null;

  const isExpanded = expandedId === book.id;
  const cellBase: React.CSSProperties = {
    fontFamily:   FONT,
    fontSize:     12,
    lineHeight:   "1.4em",
    padding:      "2px 0px 2px 16px",
    overflow:     "hidden",
    textOverflow: "ellipsis",
    whiteSpace:   "nowrap",
    borderTop:    `1px solid ${ROW_BORDER}`,
  };

  return (
    <div
      {...ariaAttributes}
      style={{ ...style, cursor: "pointer", background: isExpanded ? "#FFFAFA" : "transparent" }}
      onClick={() => onToggle(book.id)}
    >
      <div style={{ display: "grid", gridTemplateColumns: GRID_COLS }}>
        <div style={{ ...cellBase, color: "#BBB", fontVariantNumeric: "tabular-nums" }}>
          {String(pageOffset + index + 1).padStart(3, "0")}
        </div>
        <div style={{ ...cellBase, fontWeight: "bold" }}>{book.title}</div>
        <div style={cellBase}>{book.isbn || "—"}</div>
        <div style={{ ...cellBase, fontVariantNumeric: "tabular-nums" }}>{book.year || "—"}</div>
        <div style={{ ...cellBase, fontVariantNumeric: "tabular-nums" }}>{book.prisonSize}</div>
        <div style={cellBase}>
          {book.callNo || "—"}
        </div>
      </div>
      {isExpanded && (
        <div
          style={{
            padding:      "6px 16px 10px 60px",
            borderTop:    `1px solid ${ROW_BORDER}`,
            borderBottom: "2px solid #000",
            background:   "#FFFAFA",
            fontSize:     12,
            fontFamily:   FONT,
            color:        "#444",
            lineHeight:   1.6,
          }}
        >
          {book.abstract || book.title}
        </div>
      )}
    </div>
  );
}

/* ─── 가상화 헤더 ─── */
function VirtualListHeader({
  sortCol, sortDir, onSort,
}: Pick<ListViewProps, "sortCol" | "sortDir" | "onSort">) {
  const thBase: React.CSSProperties = {
    fontFamily:   FONT,
    fontSize:     12,
    fontWeight:   "bold",
    lineHeight:   "1.4em",
    padding:      "2px 0 4px 16px",
    borderTop:    "2px solid #000",
    borderBottom: `1px solid ${ROW_BORDER}`,
    whiteSpace:   "nowrap",
    overflow:     "hidden",
  };
  const cols: { col: SortCol; label: string }[] = [
    { col: "title",      label: "수감자 / TITLE" },
    { col: "isbn",       label: "ISBN" },
    { col: "year",       label: "발행 / YEAR" },
    { col: "prisonSize", label: "판형 / SIZE" },
    { col: "callNo",     label: "청구기호" },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: GRID_COLS }}>
      <div style={thBase}>No.</div>
      {cols.map(({ col, label }) => (
        <div
          key={col}
          onClick={() => onSort(col)}
          style={{ ...thBase, cursor: "pointer", userSelect: "none" }}
        >
          {label}{" "}
          <span style={{ fontSize: 10, opacity: sortCol === col ? 1 : 0.25 }}>
            {sortCol === col ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ─── 가상화 리스트 뷰 ─── */
function VirtualizedListView({
  books, pageOffset, sortCol, sortDir, onSort, expandedId, onToggle,
}: ListViewProps) {
  const getRowHeight = useCallback(
    (index: number) =>
      expandedId === books[index]?.id ? ROW_EXPAND_HEIGHT : ROW_BASE_HEIGHT,
    [books, expandedId],
  );

  return (
    <div style={{ overflowX: "auto" }}>
      <VirtualListHeader sortCol={sortCol} sortDir={sortDir} onSort={onSort} />
      <List<RowCustomProps>
        rowComponent={VirtualRow}
        rowCount={books.length}
        rowHeight={getRowHeight}
        rowProps={{ books, pageOffset, expandedId, onToggle }}
        style={{ height: 600, width: "100%" }}
      />
    </div>
  );
}

/* ─── 공개 컴포넌트: 임계값 기반 자동 전환 ─── */
export function ListView(props: ListViewProps) {
  if (props.books.length >= VIRTUALIZATION_THRESHOLD) {
    return <VirtualizedListView {...props} />;
  }
  return <PlainListView {...props} />;
}
