import { useAuth } from "@/features/auth/hooks/useAuth";
import { useOptimisticBoardMutation } from "@/features/board/hooks/useOptimisticBoardMutation";
import { updateCard } from "@/features/card/api/cardsApi";
import { deleteColumn } from "@/features/column/api/columnsApi";
import { sortByPosition } from "@/lib/position";

interface DeleteColumnVariables {
  columnId: string;
  /** Keep the column's cards (in their current order) by appending them to another column first. */
  moveCards?: { toColumnId: string; cardIds: string[] };
}

/** Deletes a column (the API cascades to its cards), optionally rescuing the cards first. */
export function useDeleteColumn(boardId: string) {
  const { token } = useAuth();

  return useOptimisticBoardMutation(boardId, {
    invalidateLists: true,
    mutationFn: async ({ columnId, moveCards }: DeleteColumnVariables) => {
      // Sequential with no `position`: the server appends each one, preserving their order.
      for (const cardId of moveCards?.cardIds ?? []) {
        await updateCard(token!, cardId, { columnId: moveCards!.toColumnId });
      }
      await deleteColumn(token!, columnId);
    },
    applyOptimistic: (board, { columnId, moveCards }) => {
      const deleted = board.columns.find((column) => column.id === columnId);
      if (!deleted) return board;

      const moveCardsToColumnId = moveCards?.toColumnId;
      const rescued = moveCardsToColumnId ? sortByPosition(deleted.cards) : [];
      const remaining = board.columns.filter((column) => column.id !== columnId);

      return {
        ...board,
        counts: {
          columns: board.counts.columns - 1,
          cards: board.counts.cards - (deleted.cards.length - rescued.length),
        },
        columns: remaining.map((column) => {
          if (column.id !== moveCardsToColumnId) return column;
          const lastPosition = column.cards.reduce((max, card) => Math.max(max, card.position), 0);
          return {
            ...column,
            cards: [...column.cards, ...rescued.map((card, index) => ({ ...card, columnId: column.id, position: lastPosition + (index + 1) * 1000 }))],
          };
        }),
      };
    },
  });
}
