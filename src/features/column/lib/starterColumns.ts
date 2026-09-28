import { createColumn } from "@/features/column/api/columnsApi";

export const STARTER_COLUMNS = ["To Do", "Doing", "Done"] as const;

/** Creates To Do / Doing / Done on a board. Explicit positions keep the order while requests run in parallel. */
export function createStarterColumns(token: string, boardId: string) {
	return Promise.all(STARTER_COLUMNS.map((name, index) => createColumn(token, boardId, { name, position:(index + 1) * 1000, })));
}
