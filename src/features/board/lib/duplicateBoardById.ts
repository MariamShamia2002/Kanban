import { createBoard, createCard, createColumn, createLabel, getBoard } from "@/features/board/api/boardsApi";
import type { Board, BoardSummary } from "@/features/board/types/board.types";
export async function duplicateBoardById(token: string, boardId: string): Promise<BoardSummary> {
	const source = await getBoard(token, boardId);
	const copy = await createBoard(token, {
		name: `${source.name} (copy)`,
	});

	const labelIdMap = await copyLabels(token, source, copy.id);
	await copyColumnsAndCards(token, source, copy.id, labelIdMap);

	return copy;
}

async function copyLabels(token: string, source: Board, newBoardId: string): Promise<Map<string, string>> {
	const labelIdMap = new Map<string, string>();

	for (const label of source.labels) {
		const created = await createLabel(token, newBoardId, {
			name: label.name,
			color: label.color,
		});
		labelIdMap.set(label.id, created.id);
	}

	return labelIdMap;
}

async function copyColumnsAndCards(token: string, source: Board, newBoardId: string, labelIdMap: Map<string, string>) {
	const columns = [...source.columns].sort((a, b) => a.position - b.position);

	for (const column of columns) {
		const createdColumn = await createColumn(token, newBoardId, {
			name: column.name,
			position: column.position,
		});

		const cards = [...column.cards].sort((a, b) => a.position - b.position);

		for (const card of cards) {
			const labelIds = card.labels.map((label) => labelIdMap.get(label.id)).filter((id): id is string => Boolean(id));

			await createCard(token, createdColumn.id, {
				title: card.title,
				...(card.description != null ? { description: card.description } : {}),
				...(card.dueDate != null ? { dueDate: card.dueDate } : {}),
				position: card.position,
				...(labelIds.length > 0 ? { labelIds } : {}),
			});
		}
	}
}
