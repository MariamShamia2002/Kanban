import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { boardKeys } from "@/features/board/hooks/boardKeys";
import type { Board } from "@/features/board/types/board.types";
import { createLabel } from "@/features/label/api/labelsApi";
import type { CreateLabelBody } from "@/features/label/types/label.types";

/** Creates a board label and adds it to the cached board so pickers show it immediately. */
export function useCreateLabel(boardId: string) {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = boardKeys.detail(boardId);

  return useMutation({
    mutationFn: (body: CreateLabelBody) => createLabel(token!, boardId, body),
    onSuccess: (label) => {
      queryClient.setQueryData<Board>(queryKey, (board) => board && { ...board, labels: [...board.labels, label] });
      void queryClient.invalidateQueries({ queryKey });
    },
  });
}
