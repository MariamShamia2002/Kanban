import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { boardKeys } from "@/features/board/hooks/boardKeys";
import { createColumn } from "@/features/column/api/columnsApi";
import type { CreateColumnBody } from "@/features/column/types/column.types";

export function useCreateColumn(boardId: string) {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateColumnBody) => createColumn(token!, boardId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) });
      void queryClient.invalidateQueries({ queryKey: boardKeys.lists() });
    },
  });
}
