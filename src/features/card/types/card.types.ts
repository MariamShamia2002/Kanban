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


// Omit a key to leave it untouched; null clears description/ dueDate.
// labelIds is a full replace — [] clears every label.
 
export type UpdateCardBody = Partial<CreateCardBody> & {
  columnId?: string;
};
