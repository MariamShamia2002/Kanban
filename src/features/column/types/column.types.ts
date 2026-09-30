import type { Card } from "@/features/card/types/card.types";

export interface Column {
  id: string;
  boardId: string;
  name: string;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface ColumnWithCards extends Column {
  cards: Card[];
}

export interface CreateColumnBody {
  name: string;
  position?: number;
}

/** Rename (`name`), move (`position`), or both. */
export type UpdateColumnBody = Partial<CreateColumnBody>;
