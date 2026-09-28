import { apiClient } from "@/api/client";
import type { Column, CreateColumnBody } from "@/features/column/types/column.types";

export function createColumn(token: string, boardId: string, body: CreateColumnBody) {
	return apiClient<Column>(`/api/boards/${boardId}/columns`, {
		method: "POST",
		token,
		body: JSON.stringify(body),
	});
}
