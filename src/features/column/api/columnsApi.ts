import { apiClient } from "@/api/client";
import type { Column, CreateColumnBody, UpdateColumnBody } from "@/features/column/types/column.types";
import type { PositionsMeta } from "@/lib/position";

export function createColumn(token: string, boardId: string, body: CreateColumnBody) {
	return apiClient<Column>(`/api/boards/${boardId}/columns`, {
		method: "POST",
		token,
		body: JSON.stringify(body),
	});
}

/** Also used for moves (`position`); `meta` reports server re-spacing. */
export function updateColumn(token: string, columnId: string, body: UpdateColumnBody) {
	return apiClient<Column, PositionsMeta>(`/api/columns/${columnId}`, {
		method: "PATCH",
		token,
		body: JSON.stringify(body),
		withMeta: true,
	});
}

/** Cascades: deletes every card in the column. Confirm in the UI first. */
export function deleteColumn(token: string, columnId: string) {
	return apiClient<void>(`/api/columns/${columnId}`, {
		method: "DELETE",
		token,
	});
}
