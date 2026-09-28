import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { boardKeys } from "@/features/board/hooks/boardKeys";
import { createStarterColumns } from "@/features/column/lib/starterColumns";

/** Adds To Do / Doing / Done to an existing board. */
export function useCreateStarterColumns(boardId: string) {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => createStarterColumns(token!, boardId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) });
      void queryClient.invalidateQueries({ queryKey: boardKeys.lists() });
    },
  });
}
