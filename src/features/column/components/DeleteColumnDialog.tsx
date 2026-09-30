import { useState } from "react";
import { getErrorMessage } from "@/api/errors";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useDeleteColumn } from "@/features/column/hooks/useDeleteColumn";
import type { ColumnWithCards } from "@/features/column/types/column.types";
import { sortByPosition } from "@/lib/position";

type DeleteAction = "move" | "delete";

interface DeleteColumnDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	column: ColumnWithCards;
	/** Where cards go when the user chooses to keep them; none when this is the only column. */
	targetColumn?: ColumnWithCards;
}

export function DeleteColumnDialog({ open, onOpenChange, column, targetColumn }: DeleteColumnDialogProps) {
	const deleteColumn = useDeleteColumn(column.boardId);
	const [pendingAction, setPendingAction] = useState<DeleteAction | null>(null);
	const cardCount = column.cards.length;
	const cardsLabel = `${cardCount} ${cardCount === 1 ? "card" : "cards"}`;
	const busy = pendingAction !== null;

	async function run(action: DeleteAction) {
		setPendingAction(action);
		try {
			await deleteColumn.mutateAsync({
				columnId: column.id,
				moveCards: action === "move" && targetColumn ? { toColumnId: targetColumn.id, cardIds: sortByPosition(column.cards).map((card) => card.id) } : undefined,
			});
			onOpenChange(false);
		} catch {
			// Stays open; the error is rendered from mutation state.
		} finally {
			setPendingAction(null);
		}
	}

	function actionLabel(action: DeleteAction, idle: string, pending: string) {
		return pendingAction === action ? (
			<>
				<Spinner />
				{pending}
			</>
		) : (
			idle
		);
	}

	return (
		<AlertDialog
			open={open}
			onOpenChange={(next) => {
				if (busy) return;
				if (!next) deleteColumn.reset();
				onOpenChange(next);
			}}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{cardCount === 0 ? `Delete "${column.name}"?` : `Delete "${column.name}" and its ${cardsLabel}?`}</AlertDialogTitle>
					<AlertDialogDescription>
						{cardCount === 0 ? "This column is empty. There is no undo." : targetColumn ? "Cards live inside their column. You can move them somewhere safe first, or delete everything together." : "Cards live inside their column, so they will be deleted too. There is no undo."}
					</AlertDialogDescription>
				</AlertDialogHeader>

				{cardCount > 0 && targetColumn && (
					<p className="rounded-lg border border-orange-200 bg-orange-50 px-3 py-2.5 text-sm text-orange-900">
						Moving keeps all {cardsLabel} and appends them to &ldquo;{targetColumn.name}&rdquo;.
					</p>
				)}

				{deleteColumn.isError && (
					<p role="alert" className="text-sm text-destructive">
						{getErrorMessage(deleteColumn.error, "Couldn't delete column. Please try again.")}
					</p>
				)}

				<AlertDialogFooter className="flex-wrap">
					<AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
					{cardCount > 0 && targetColumn && (
						<Button type="button" variant="outline" className="border-primary text-primary hover:text-primary" disabled={busy} onClick={() => void run("move")}>
							{actionLabel("move", `Move cards to "${targetColumn.name}"`, "Moving cards…")}
						</Button>
					)}
					<Button type="button" variant="destructive" className="bg-destructive text-white hover:bg-destructive/90" disabled={busy} onClick={() => void run("delete")}>
						{actionLabel("delete", cardCount === 0 ? "Delete column" : "Delete column + cards", "Deleting…")}
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
