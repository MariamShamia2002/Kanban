import { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import { getErrorMessage, isNotFound } from "@/api/errors";
import { Button, buttonVariants } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { BoardDnd } from "@/features/board/components/BoardDnd";
import { BoardEmptyState } from "@/features/board/components/BoardEmptyState";
import { KeyboardHints } from "@/features/board/components/KeyboardHints";
import { useBoard } from "@/features/board/hooks/useBoard";
import { CardDetailDialog } from "@/features/card/components/CardDetailDialog";
import { OPEN_CARD_PARAM } from "@/features/card/components/CardItem";
import { ColumnView } from "@/features/column/components/ColumnView";
import { CreateColumnForm } from "@/features/column/components/CreateColumnForm";
import { cn } from "@/lib/utils";
import { sortByPosition } from "@/lib/position";

export default function BoardPage() {
	const { boardId = "" } = useParams<{ boardId: string }>();
	const [searchParams, setSearchParams] = useSearchParams();
	const { data: board, isPending, isError, error, refetch, isFetching } = useBoard(boardId);
	const [isAddingColumn, setIsAddingColumn] = useState(false);

	if (isPending) {
		return (
			<div role="status" aria-live="polite" className="flex flex-col items-center justify-center gap-3 py-24 text-sm text-muted-foreground">
				<Spinner aria-hidden className="size-6" />
				Loading board…
			</div>
		);
	}

	if (isError) {
		const notFound = isNotFound(error);
		return (
			<div className="mx-auto max-w-md rounded-xl border border-border bg-card px-6 py-10 text-center">
				<p className="text-sm font-medium text-foreground">{notFound ? "Board not found" : "Couldn't load board"}</p>
				<p className="mt-1 text-sm text-muted-foreground">
					{notFound ? "It may have been deleted." : getErrorMessage(error, "Something went wrong. Please try again.")}
				</p>
				<div className="mt-4 flex justify-center gap-2">
					{!notFound && (
						<Button type="button" variant="outline" onClick={() => void refetch()} disabled={isFetching}>
							Try again
						</Button>
					)}
					<Link to="/boards" className={cn(buttonVariants({ variant: notFound ? "default" : "ghost" }))}>
						Back to boards
					</Link>
				</div>
			</div>
		);
	}

	if (board.columns.length === 0) {
		return <BoardEmptyState boardId={board.id} />;
	}

	const columns = sortByPosition(board.columns);

	const openCardId = searchParams.get(OPEN_CARD_PARAM);
	const openColumn = openCardId ? columns.find((column) => column.cards.some((card) => card.id === openCardId)) : undefined;
	const openCard = openColumn?.cards.find((card) => card.id === openCardId);

	function closeCard() {
		setSearchParams(
			(params) => {
				params.delete(OPEN_CARD_PARAM);
				return params;
			},
			{ replace: true },
		);
	}

	return (
		<div className="flex items-start gap-3 overflow-x-auto pb-12">
			<BoardDnd board={board} columns={columns}>
				{(liveColumns) => liveColumns.map((column) => <ColumnView key={column.id} column={column} columns={liveColumns} />)}
			</BoardDnd>

			{isAddingColumn ? (
				<CreateColumnForm boardId={board.id} onCancel={() => setIsAddingColumn(false)} />
			) : (
				<button
					type="button"
					onClick={() => setIsAddingColumn(true)}
					className="flex h-11 w-72 shrink-0 items-center justify-center rounded-xl border border-dashed border-border text-sm font-medium text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground">
					+ Add column
				</button>
			)}

			<KeyboardHints />

			{openCard && openColumn && (
				<CardDetailDialog key={openCard.id} boardId={board.id} boardName={board.name} columnName={openColumn.name} card={openCard} labels={board.labels} onClose={closeCard} />
			)}
		</div>
	);
}
