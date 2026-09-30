import { useAuth } from "@/features/auth/hooks/useAuth";
import { useOptimisticBoardMutation } from "@/features/board/hooks/useOptimisticBoardMutation";
import { deleteCard } from "@/features/card/api/cardsApi";

/** Removes the card optimistically and restores it if the request fails. */
export function useDeleteCard(boardId: string) {
  const { token } = useAuth();

  return useOptimisticBoardMutation(boardId, {
    invalidateLists: true,
    mutationFn: (cardId: string) => deleteCard(token!, cardId),
    applyOptimistic: (board, cardId) => ({
      ...board,
      counts: { ...board.counts, cards: Math.max(0, board.counts.cards - 1) },
      columns: board.columns.map((column) => ({
        ...column,
        cards: column.cards.filter((card) => card.id !== cardId),
      })),
    }),
  });
}
