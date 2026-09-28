import type { Label } from "@/features/label/types/label.types";

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

export interface CreateCardBody {
  title: string;
  description?: string | null;
  dueDate?: string | null;
  position?: number;
  labelIds?: string[];
}
