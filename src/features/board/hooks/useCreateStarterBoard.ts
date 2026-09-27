import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBoard, createColumn } from "@/features/board/api/boardsApi";
import { boardKeys } from "@/features/board/hooks/boardKeys";
import { useAuth } from "@/features/auth/hooks/useAuth";

const STARTER_COLUMNS = ["To Do", "Doing", "Done"] as const;

/** Creates a board with To Do / Doing / Done columns. */
export function useCreateStarterBoard() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      const board = await createBoard(token!, { name });
      for (const columnName of STARTER_COLUMNS) {
        await createColumn(token!, board.id, { name: columnName });
      }
      return board;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: boardKeys.lists() });
    },
  });
}
