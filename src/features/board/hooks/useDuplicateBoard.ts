import { useMutation, useQueryClient } from "@tanstack/react-query";
import { boardKeys } from "@/features/board/hooks/boardKeys";
import { duplicateBoardById } from "@/features/board/lib/duplicateBoardById";
import { useAuth } from "@/features/auth/hooks/useAuth";

/** Deep-duplicates a board by id (columns, cards, labels). */
export function useDuplicateBoard() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (boardId: string) => duplicateBoardById(token!, boardId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: boardKeys.lists() });
    },
  });
}
