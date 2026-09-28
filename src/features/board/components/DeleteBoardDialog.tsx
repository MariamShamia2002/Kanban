import { getErrorMessage } from "@/api/errors";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner";
import { useDeleteBoard } from "@/features/board/hooks/useDeleteBoard";

interface DeleteBoardDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	boardId: string;
	boardName: string;
}

export function DeleteBoardDialog({ open, onOpenChange, boardId, boardName }: DeleteBoardDialogProps) {
	const deleteBoard = useDeleteBoard();

	async function handleDelete() {
		try {
			await deleteBoard.mutateAsync(boardId);
			onOpenChange(false);
		} catch {
			// Keep dialog open so the user can retry; error surfaces via mutation state.
		}
	}

	const busy = deleteBoard.isPending;

	return (
		<AlertDialog
			open={open}
			onOpenChange={(next) => {
				if (!next) deleteBoard.reset();
				onOpenChange(next);
			}}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Delete board?</AlertDialogTitle>
					<AlertDialogDescription>This permanently deletes &ldquo;{boardName}&rdquo; and all of its columns and cards. There is no undo.</AlertDialogDescription>
				</AlertDialogHeader>
				{deleteBoard.isError && (
					<p role="alert" className="text-sm text-destructive">
						{getErrorMessage(deleteBoard.error, "Couldn't delete board. Please try again.")}
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
							"Delete board"
						)}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
