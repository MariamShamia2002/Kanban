import { colorForBar } from "@/features/board/lib/barColors";
import type { BoardSummary } from "@/features/board/types/board.types";

export interface ColumnBarSegment {
  index: number;
  percent: number;
  color: string;
}


  // One equal-width bar per column from list summary counts.
  // List API has no cards-per-column, so widths are equal shares.

export function columnBarSegments(board: BoardSummary): ColumnBarSegment[] {
  const columns = board.counts.columns;
  if (columns <= 0) return [];

  const percent = 100 / columns;

  return Array.from({ length: columns }, (_, index) => ({
    index,
    percent,
    color: colorForBar(index),
  }));
}
