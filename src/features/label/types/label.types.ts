export interface Label {
  id: string;
  name: string;
  color: string;
  boardId?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** `color` must be a hex string such as `#F59E0B`; names are unique per board. */
export interface CreateLabelBody {
  name: string;
  color: string;
}

export type UpdateLabelBody = Partial<CreateLabelBody>;
