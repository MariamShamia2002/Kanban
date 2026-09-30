import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { boardKeys } from "@/features/board/hooks/boardKeys";
import { createCard } from "@/features/card/api/cardsApi";
import type { CreateCardBody } from "@/features/card/types/card.types";

/** Creates a card at the end of a column (no `position`, so the server appends). */
export function useCreateCard(boardId: string, columnId: string) {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateCardBody) => createCard(token!, columnId, body),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) }),
        queryClient.invalidateQueries({ queryKey: boardKeys.lists() }),
      ]),
  });
}
