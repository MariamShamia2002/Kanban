import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBoard } from "@/features/board/api/boardsApi";
import { boardKeys } from "@/features/board/hooks/boardKeys";
import { useAuth } from "@/features/auth/hooks/useAuth";

export function useCreateBoard() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => createBoard(token!, { name }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: boardKeys.lists() });
    },
  });
}
