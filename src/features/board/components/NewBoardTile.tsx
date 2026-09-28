import { useNavigate } from "react-router";
import { getErrorMessage } from "@/api/errors";
import { Spinner } from "@/components/ui/spinner";
import { useCreateBoard } from "@/features/board/hooks/useCreateBoard";

const UNTITLED_BOARD_NAME = "Untitled board";

/** Creates an "Untitled board" and opens it right away. */
export function NewBoardTile() {
	const navigate = useNavigate();
	const createBoard = useCreateBoard();

	function handleClick() {
		if (createBoard.isPending) return;
		createBoard.mutate(UNTITLED_BOARD_NAME, {
			onSuccess: (board) => navigate(`/boards/${board.id}`),
		});
	}

	return (
		<button
			type="button"
			onClick={handleClick}
			disabled={createBoard.isPending}
			aria-busy={createBoard.isPending}
			className="flex min-h-[120px] w-full flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border bg-transparent text-sm font-medium text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground disabled:cursor-wait">
			{createBoard.isPending ? (
				<span className="flex items-center gap-1.5">
					<Spinner />
					Creating…
				</span>
			) : (
				"+ New board"
			)}
			{createBoard.isError && (
				<span role="alert" className="text-xs font-normal text-destructive">
					{getErrorMessage(createBoard.error, "Couldn't create board. Try again.")}
				</span>
			)}
		</button>
	);
}
