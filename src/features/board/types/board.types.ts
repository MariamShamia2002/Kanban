import type { ColumnWithCards } from "@/features/column/types/column.types";
import type { Label } from "@/features/label/types/label.types";

export interface BoardCounts {
  columns: number;
  cards: number;
}

export interface BoardSummary {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  counts: BoardCounts;
}

export interface CreateBoardBody {
  name: string;
}

export interface UpdateBoardBody {
  name: string;
}

export interface Board extends BoardSummary {
  columns: ColumnWithCards[];
  labels: Label[];
}
