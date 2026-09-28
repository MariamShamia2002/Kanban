import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBoard } from "@/features/board/api/boardsApi";
import { boardKeys } from "@/features/board/hooks/boardKeys";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { Board } from "@/features/board/types/board.types";

export function useCreateBoard() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => createBoard(token!, { name }),
    onSuccess: (board) => {
      queryClient.setQueryData<Board>(boardKeys.detail(board.id), {
        ...board,
        columns: [],
        labels: [],
      });
      void queryClient.invalidateQueries({ queryKey: boardKeys.lists() });
    },
  });
}
