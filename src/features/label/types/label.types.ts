export interface Label {
  id: string;
  name: string;
  color: string;
  boardId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateLabelBody {
  name: string;
  color: string;
}
