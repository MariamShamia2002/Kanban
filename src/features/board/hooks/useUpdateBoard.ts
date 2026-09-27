import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateBoard } from "@/features/board/api/boardsApi";
import { boardKeys } from "@/features/board/hooks/boardKeys";
import { useAuth } from "@/features/auth/hooks/useAuth";

export function useUpdateBoard() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ boardId, name }: { boardId: string; name: string }) =>
      updateBoard(token!, boardId, { name }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: boardKeys.lists() });
    },
  });
}
