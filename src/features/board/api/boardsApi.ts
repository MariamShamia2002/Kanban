import { apiClient } from "@/api/client";
import type { Board, BoardSummary, CreateBoardBody, UpdateBoardBody } from "@/features/board/types/board.types";

export function getBoards(token: string) {
	return apiClient<BoardSummary[]>("/api/boards", { token });
}

export function getBoard(token: string, boardId: string) {
	return apiClient<Board>(`/api/boards/${boardId}`, { token });
}

export function createBoard(token: string, body: CreateBoardBody) {
	return apiClient<BoardSummary>("/api/boards", {
		method: "POST",
		token,
		body: JSON.stringify(body),
	});
}

export function updateBoard(token: string, boardId: string, body: UpdateBoardBody) {
	return apiClient<BoardSummary>(`/api/boards/${boardId}`, {
		method: "PATCH",
		token,
		body: JSON.stringify(body),
	});
}

export function deleteBoard(token: string, boardId: string) {
	return apiClient<void>(`/api/boards/${boardId}`, {
		method: "DELETE",
		token,
	});
}