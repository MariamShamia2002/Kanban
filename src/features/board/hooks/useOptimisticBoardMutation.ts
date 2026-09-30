import { useMutation, useQueryClient } from "@tanstack/react-query";
import { boardKeys } from "@/features/board/hooks/boardKeys";
import type { Board } from "@/features/board/types/board.types";

interface OptimisticBoardMutationOptions<TVariables, TData> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  /** Applied to the cached board before the request is sent. */
  applyOptimistic: (board: Board, variables: TVariables) => Board;
  /** Applied after success, e.g. server-normalized positions from `meta`. */
  applyResult?: (board: Board, data: TData, variables: TVariables) => Board;
  /** Also refresh the boards list (for changes to column/card counts). */
  invalidateLists?: boolean;
}

/**
 * Mutation that updates the cached board immediately, rolls back on error,
 * and refetches afterwards so the server stays the source of truth.
 */
export function useOptimisticBoardMutation<TVariables, TData>(boardId: string, { mutationFn, applyOptimistic, applyResult, invalidateLists = false }: OptimisticBoardMutationOptions<TVariables, TData>) {
  const queryClient = useQueryClient();
  const queryKey = boardKeys.detail(boardId);

  function updateBoard(update: (board: Board) => Board) {
    queryClient.setQueryData<Board>(queryKey, (board) => board && update(board));
  }

  return useMutation({
    mutationFn,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Board>(queryKey);
      updateBoard((board) => applyOptimistic(board, variables));
      return { previous };
    },
    onSuccess: (data, variables) => {
      if (applyResult) updateBoard((board) => applyResult(board, data, variables));
    },
    onError: (_err, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
    },
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey }),
        invalidateLists && queryClient.invalidateQueries({ queryKey: boardKeys.lists() }),
      ]),
  });
}
