import { useAuth } from "@/features/auth/hooks/useAuth";
import { useOptimisticBoardMutation } from "@/features/board/hooks/useOptimisticBoardMutation";
import { updateColumn } from "@/features/column/api/columnsApi";
import type { UpdateColumnBody } from "@/features/column/types/column.types";
import { applyPositions, sortByPosition } from "@/lib/position";

interface UpdateColumnVariables {
  columnId: string;
  body: UpdateColumnBody;
}

/** Renames and/or moves a column. Moves apply server re-spacing from `meta` when it happens. */
export function useUpdateColumn(boardId: string) {
  const { token } = useAuth();

  return useOptimisticBoardMutation(boardId, {
    mutationFn: ({ columnId, body }: UpdateColumnVariables) => updateColumn(token!, columnId, body),
    applyOptimistic: (board, { columnId, body }) => ({
      ...board,
      columns: sortByPosition(board.columns.map((column) => (column.id === columnId ? { ...column, ...body } : column))),
    }),
    applyResult: (board, { data, meta }) => ({
      ...board,
      columns: applyPositions(
        board.columns.map((column) => (column.id === data.id ? { ...column, name: data.name, position: data.position } : column)),
        meta,
      ),
    }),
  });
}
