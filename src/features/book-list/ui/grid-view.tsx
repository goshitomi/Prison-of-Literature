"use client";

import React from "react";
import { Grid } from "react-window";
import type { CellComponentProps } from "react-window";
import { UniformCard } from "@/entities/book/ui/uniform-card";
import { VIRTUALIZATION_THRESHOLD } from "@/shared/config/design-tokens";
import type { Book } from "@/entities/book/model/types";

const CARD_WIDTH  = 170;
const CARD_HEIGHT = 280;
const GAP         = 20;

interface GridViewProps {
  books:      Book[];
  expandedId: string | null;
  onToggle:   (id: string) => void;
}

/* ─── 일반 그리드 (< VIRTUALIZATION_THRESHOLD) ─── */
function PlainGridView({ books, expandedId, onToggle }: GridViewProps) {
  return (
    <div
      style={{
        display:             "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
        gap:                 GAP,
      }}
    >
      {books.map((book) => (
        <UniformCard
          key={book.id}
          book={book}
          expanded={expandedId === book.id}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
}

/* ─── 가상화 그리드 (react-window v2) ─── */
/*
 * react-window v2: cellProps에는 금지 키(ariaAttributes, columnIndex, rowIndex, style) 제외.
 * cellComponent 함수는 금지 키 + cellProps를 함께 받는다.
 */
interface CellCustomProps {
  books:       Book[];
  columnCount: number;
  expandedId:  string | null;
  onToggle:    (id: string) => void;
}

type VirtualCellProps = CellComponentProps<CellCustomProps>;

function VirtualCell({ ariaAttributes, rowIndex, columnIndex, style, books, columnCount, expandedId, onToggle }: VirtualCellProps) {
  const idx  = rowIndex * columnCount + columnIndex;
  const book = books[idx];
  if (!book) return null;

  return (
    <div
      {...ariaAttributes}
      style={{ ...style, padding: `0 ${GAP / 2}px ${GAP}px` }}
    >
      <UniformCard
        book={book}
        expanded={expandedId === book.id}
        onToggle={onToggle}
      />
    </div>
  );
}

function VirtualizedGridView({ books, expandedId, onToggle }: GridViewProps) {
  const containerWidth = typeof window !== "undefined" ? window.innerWidth - 48 : 1200;
  const columnCount    = Math.max(1, Math.floor(containerWidth / (CARD_WIDTH + GAP)));
  const rowCount       = Math.ceil(books.length / columnCount);

  return (
    <Grid<CellCustomProps>
      cellComponent={VirtualCell}
      cellProps={{ books, columnCount, expandedId, onToggle }}
      columnCount={columnCount}
      columnWidth={CARD_WIDTH + GAP}
      rowCount={rowCount}
      rowHeight={CARD_HEIGHT + GAP}
      style={{ height: 600, width: "100%" }}
    />
  );
}

/* ─── 공개 컴포넌트 ─── */
export function GridView(props: GridViewProps) {
  if (props.books.length >= VIRTUALIZATION_THRESHOLD) {
    return <VirtualizedGridView {...props} />;
  }
  return <PlainGridView {...props} />;
}
