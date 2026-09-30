import { useAuth } from "@/features/auth/hooks/useAuth";
import { useOptimisticBoardMutation } from "@/features/board/hooks/useOptimisticBoardMutation";
import { updateCard } from "@/features/card/api/cardsApi";
import { applyPositions, sortByPosition } from "@/lib/position";

export interface MoveCardVariables {
  cardId: string;
  toColumnId: string;
  position: number;
}

/**
 * Moves a card within or between columns of the same board (one PATCH).
 * Cross-board moves are rejected by the API (409) and are not offered in the UI.
 */
export function useMoveCard(boardId: string) {
  const { token } = useAuth();

  return useOptimisticBoardMutation(boardId, {
    mutationFn: ({ cardId, toColumnId, position }: MoveCardVariables) => updateCard(token!, cardId, { columnId: toColumnId, position }),
    applyOptimistic: (board, { cardId, toColumnId, position }) => {
      const card = board.columns.flatMap((column) => column.cards).find((c) => c.id === cardId);
      if (!card) return board;

      const moved = { ...card, columnId: toColumnId, position };
      return {
        ...board,
        columns: board.columns.map((column) => {
          const cards = column.cards.filter((c) => c.id !== cardId);
          return { ...column, cards: column.id === toColumnId ? sortByPosition([...cards, moved]) : cards };
        }),
      };
    },
    applyResult: (board, { data, meta }) => ({
      ...board,
      columns: board.columns.map((column) =>
        column.id === data.columnId
          ? { ...column, cards: applyPositions(column.cards.map((c) => (c.id === data.id ? { ...c, position: data.position } : c)), meta) }
          : column,
      ),
    }),
  });
}
