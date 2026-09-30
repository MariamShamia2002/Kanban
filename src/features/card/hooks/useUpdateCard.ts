import { useAuth } from "@/features/auth/hooks/useAuth";
import { useOptimisticBoardMutation } from "@/features/board/hooks/useOptimisticBoardMutation";
import { updateCard } from "@/features/card/api/cardsApi";
import type { Card, UpdateCardBody } from "@/features/card/types/card.types";
import type { Label } from "@/features/label/types/label.types";

interface UpdateCardVariables {
  cardId: string;
  body: UpdateCardBody;
}

/** Applies only the keys present in `body`; `labelIds` is a full replace. */
function applyCardPatch(card: Card, body: UpdateCardBody, boardLabels: Label[]): Card {
  return {
    ...card,
    ...(body.title !== undefined && { title: body.title }),
    ...(body.description !== undefined && { description: body.description }),
    ...(body.dueDate !== undefined && { dueDate: body.dueDate }),
    ...(body.labelIds !== undefined && {
      labels: boardLabels.filter((label) => body.labelIds!.includes(label.id)),
    }),
  };
}

/** Edits card fields with an optimistic update. Moves (`columnId` / `position`) go through `useMoveCard`. */
export function useUpdateCard(boardId: string) {
  const { token } = useAuth();

  return useOptimisticBoardMutation(boardId, {
    mutationFn: ({ cardId, body }: UpdateCardVariables) => updateCard(token!, cardId, body),
    applyOptimistic: (board, { cardId, body }) => ({
      ...board,
      columns: board.columns.map((column) => ({
        ...column,
        cards: column.cards.map((card) => (card.id === cardId ? applyCardPatch(card, body, board.labels) : card)),
      })),
    }),
  });
}
