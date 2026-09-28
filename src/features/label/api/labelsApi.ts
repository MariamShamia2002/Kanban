import { apiClient } from "@/api/client";
import type { CreateLabelBody, Label } from "@/features/label/types/label.types";

export function createLabel(token: string, boardId: string, body: CreateLabelBody) {
	return apiClient<Label>(`/api/boards/${boardId}/labels`, {
		method: "POST",
		token,
		body: JSON.stringify(body),
	});
}
