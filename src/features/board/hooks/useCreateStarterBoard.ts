import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBoard } from "@/features/board/api/boardsApi";
import { boardKeys } from "@/features/board/hooks/boardKeys";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { createStarterColumns } from "@/features/column/lib/starterColumns";

/** Creates a board with To Do / Doing / Done columns. */
export function useCreateStarterBoard() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      const board = await createBoard(token!, { name });
      await createStarterColumns(token!, board.id);
      return board;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: boardKeys.lists() });
    },
  });
}
