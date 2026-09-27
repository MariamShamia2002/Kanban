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

export interface Label {
  id: string;
  name: string;
  color: string;
  boardId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Card {
  id: string;
  columnId: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  position: number;
  createdAt: string;
  updatedAt: string;
  labels: Label[];
}

export interface ColumnWithCards {
  id: string;
  boardId: string;
  name: string;
  position: number;
  createdAt: string;
  updatedAt: string;
  cards: Card[];
}

export interface Board {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    counts: BoardCounts;
    columns: ColumnWithCards[];
    labels: Label[];
}

export interface CreateColumnBody {
  name: string;
  position?: number;
}

export interface CreateLabelBody {
  name: string;
  color: string;
}

export interface CreateCardBody {
  title: string;
  description?: string | null;
  dueDate?: string | null;
  position?: number;
  labelIds?: string[];
}

export interface Column {
  id: string;
  boardId: string;
  name: string;
  position: number;
  createdAt: string;
  updatedAt: string;
}
