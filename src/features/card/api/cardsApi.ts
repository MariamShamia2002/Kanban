import { apiClient } from "@/api/client";
import type { Card, CreateCardBody, UpdateCardBody } from "@/features/card/types/card.types";
import type { PositionsMeta } from "@/lib/position";

export function getCard(token: string, cardId: string) {
	return apiClient<Card>(`/api/cards/${cardId}`, { token });
}

export function createCard(token: string, columnId: string, body: CreateCardBody) {
	return apiClient<Card>(`/api/columns/${columnId}/cards`, {
		method: "POST",
		token,
		body: JSON.stringify(body),
	});
}

/** Also used for moves (`columnId` and/or `position`); `meta` reports server re-spacing. */
export function updateCard(token: string, cardId: string, body: UpdateCardBody) {
	return apiClient<Card, PositionsMeta>(`/api/cards/${cardId}`, {
		method: "PATCH",
		token,
		body: JSON.stringify(body),
		withMeta: true,
	});
}

export function deleteCard(token: string, cardId: string) {
	return apiClient<void>(`/api/cards/${cardId}`, {
		method: "DELETE",
		token,
	});
}
