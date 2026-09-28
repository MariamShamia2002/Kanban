import { apiClient } from "@/api/client";
import type { Card, CreateCardBody } from "@/features/card/types/card.types";

export function createCard(token: string, columnId: string, body: CreateCardBody) {
	return apiClient<Card>(`/api/columns/${columnId}/cards`, {
		method: "POST",
		token,
		body: JSON.stringify(body),
	});
}
