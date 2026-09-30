import { getErrorMessage } from "@/api/errors";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner";
import { useDeleteCard } from "@/features/card/hooks/useDeleteCard";

interface DeleteCardDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	boardId: string;
	cardId: string;
	cardTitle: string;
	onDeleted?: () => void;
}

export function DeleteCardDialog({ open, onOpenChange, boardId, cardId, cardTitle, onDeleted }: DeleteCardDialogProps) {
	const deleteCard = useDeleteCard(boardId);
	const busy = deleteCard.isPending;

	async function handleDelete() {
		try {
			await deleteCard.mutateAsync(cardId);
			onOpenChange(false);
			onDeleted?.();
		} catch {
			// Stays open; the error is rendered from mutation state.
		}
	}

	return (
		<AlertDialog
			open={open}
			onOpenChange={(next) => {
				if (!next) deleteCard.reset();
				onOpenChange(next);
			}}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Delete this card?</AlertDialogTitle>
					<AlertDialogDescription>&ldquo;{cardTitle}&rdquo; will be removed from the board.</AlertDialogDescription>
				</AlertDialogHeader>
				{deleteCard.isError && (
					<p role="alert" className="text-sm text-destructive">
						{getErrorMessage(deleteCard.error, "Couldn't delete card. Please try again.")}
					</p>
				)}
				<AlertDialogFooter>
					<AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
					<AlertDialogAction
						variant="destructive"
						disabled={busy}
						onClick={(e) => {
							e.preventDefault();
							void handleDelete();
						}}>
						{busy ? (
							<>
								<Spinner />
								Deleting…
							</>
						) : (
							"Delete card"
						)}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
