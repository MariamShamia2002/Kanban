import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteBoard } from "@/features/board/api/boardsApi";
import { boardKeys } from "@/features/board/hooks/boardKeys";
import { useAuth } from "@/features/auth/hooks/useAuth";

export function useDeleteBoard() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (boardId: string) => deleteBoard(token!, boardId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: boardKeys.lists() });
    },
  });
}
