import { apiClient } from "@/api/client";
import type { CreateLabelBody, Label, UpdateLabelBody } from "@/features/label/types/label.types";

export function getLabels(token: string, boardId: string) {
	return apiClient<Label[]>(`/api/boards/${boardId}/labels`, { token });
}

export function createLabel(token: string, boardId: string, body: CreateLabelBody) {
	return apiClient<Label>(`/api/boards/${boardId}/labels`, {
		method: "POST",
		token,
		body: JSON.stringify(body),
	});
}

export function updateLabel(token: string, labelId: string, body: UpdateLabelBody) {
	return apiClient<Label>(`/api/labels/${labelId}`, {
		method: "PATCH",
		token,
		body: JSON.stringify(body),
	});
}

export function deleteLabel(token: string, labelId: string) {
	return apiClient<void>(`/api/labels/${labelId}`, {
		method: "DELETE",
		token,
	});
}
