import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { MoreHorizontal } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { getFieldErrors, getErrorMessage, isApiError } from "@/api/errors";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { DeleteBoardDialog } from "@/features/board/components/DeleteBoardDialog";
import { useDuplicateBoard } from "@/features/board/hooks/useDuplicateBoard";
import { useUpdateBoard } from "@/features/board/hooks/useUpdateBoard";
import { columnBarSegments } from "@/features/board/lib/columnBarSegments";
import { formatRelativeTime } from "@/features/board/lib/formatRelativeTime";
import { boardNameSchema, type BoardNameFormValues } from "@/features/board/schemas/boardNameSchema";
import type { BoardSummary } from "@/features/board/types/board.types";
import { cn } from "@/lib/utils";

interface BoardCardProps {
	board: BoardSummary;
}

export function BoardCard({ board }: BoardCardProps) {
	const navigate = useNavigate();
	const duplicateBoard = useDuplicateBoard();
	const updateBoard = useUpdateBoard();
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [isRenaming, setIsRenaming] = useState(false);
	const segments = columnBarSegments(board);

	const {
		register,
		handleSubmit,
		reset,
		setError,
		setFocus,
		formState: { errors, isSubmitting },
	} = useForm<BoardNameFormValues>({
		resolver: zodResolver(boardNameSchema),
		defaultValues: { name: board.name },
	});
	const nameField = register("name");
	const renameError = errors.name?.message;

	useEffect(() => {
		if (!isRenaming) return;
		requestAnimationFrame(() => setFocus("name", { shouldSelect: true }));
	}, [isRenaming, setFocus]);

	function openBoard() {
		if (isRenaming) return;
		navigate(`/boards/${board.id}`);
	}

	function startRename() {
		reset({ name: board.name });
		setIsRenaming(true);
	}

	function cancelRename() {
		setIsRenaming(false);
		reset({ name: board.name });
	}

	async function onRename(values: BoardNameFormValues) {
		if (values.name === board.name) {
			cancelRename();
			return;
		}

		try {
			await updateBoard.mutateAsync({ boardId: board.id, name: values.name });
			setIsRenaming(false);
		} catch (err) {
			const fields = getFieldErrors(err);
			if (Object.keys(fields).length > 0) {
				for (const [field, message] of Object.entries(fields)) {
					setError(field as keyof BoardNameFormValues, { message });
				}
				return;
			}
			setError("name", {
				message: isApiError(err) ? getErrorMessage(err) : "Something went wrong. Please try again.",
			});
		}
	}

	function submitRename() {
		if (isSubmitting) return;
		void handleSubmit(onRename)();
	}

	return (
		<>
			<article
				role="button"
				tabIndex={isRenaming ? -1 : 0}
				onClick={openBoard}
				onKeyDown={(e) => {
					if (isRenaming) return;
					if (e.key === "Enter" || e.key === " ") {e.preventDefault(); openBoard();}}}
				aria-busy={duplicateBoard.isPending}
				className="group relative flex cursor-pointer flex-col gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:border-foreground/25 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
				<div className="flex items-start justify-between gap-2">
					{isRenaming ? (
						<div className="relative min-w-0 flex-1" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
							<Input
								{...nameField}
								readOnly={isSubmitting}
								aria-busy={isSubmitting}
								aria-invalid={!!renameError}
								aria-describedby={renameError ? `rename-error-${board.id}` : undefined}
								className={cn("h-8", isSubmitting && "pr-8 text-muted-foreground", renameError && "border-destructive focus-visible:ring-destructive/40")}
								onBlur={(e) => {
									void nameField.onBlur(e);
									submitRename();
								}}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										e.preventDefault();
										submitRename();
									}
									if (e.key === "Escape") {
										e.preventDefault();
										cancelRename();
									}
								}}
							/>
							{isSubmitting && <Spinner aria-label="Saving name" className="absolute top-2 right-2.5 text-muted-foreground" />}
							{renameError && (
								<p id={`rename-error-${board.id}`} role="alert" className="mt-1 text-xs text-destructive">
									{renameError}
								</p>
							)}
						</div>
					) : (
						<h2 className="text-sm font-semibold text-foreground leading-snug">{board.name}</h2>
					)}

					<DropdownMenu>
						<DropdownMenuTrigger render={<Button type="button" variant="ghost" size="icon-xs" className="shrink-0 text-muted-foreground" aria-label={`Actions for ${board.name}`} onClick={(e) => e.stopPropagation()} />}>
							<MoreHorizontal />
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="min-w-40" onClick={(e) => e.stopPropagation()}>
							<DropdownMenuItem onClick={openBoard}>Open board</DropdownMenuItem>
							<DropdownMenuItem onClick={startRename}>Rename</DropdownMenuItem>
							<DropdownMenuItem disabled={duplicateBoard.isPending} onClick={() => duplicateBoard.mutate(board.id)}>
								Duplicate
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem variant="destructive" onClick={() => setDeleteOpen(true)}>
								Delete board
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>

				{segments.length > 0 && (
					<div className="flex h-1.5 w-full items-center gap-1.5" aria-hidden>
						{segments.map((segment) => (
							<span
								key={segment.index}
								className="h-full min-w-1 rounded-full"
								style={{
									width: `${segment.percent}%`,
									backgroundColor: segment.color,
								}}
							/>
						))}
					</div>
				)}

				<div className="mt-auto flex items-center justify-between gap-2 text-xs text-muted-foreground">
					<span>
						{board.counts.columns} {board.counts.columns === 1 ? "column" : "columns"} · {board.counts.cards} {board.counts.cards === 1 ? "card" : "cards"}
					</span>
					<time dateTime={board.updatedAt} className="font-mono text-[11px] text-muted-foreground/80">
						{formatRelativeTime(board.updatedAt)}
					</time>
				</div>

				{duplicateBoard.isError && (
					<p role="alert" className="text-xs text-destructive">
						{getErrorMessage(duplicateBoard.error, "Couldn't duplicate board. Please try again.")}
					</p>
				)}

				{duplicateBoard.isPending && (
					<div className="absolute inset-0 flex items-center justify-center gap-2 rounded-xl bg-card/80 text-sm font-medium text-muted-foreground backdrop-blur-[1px]" onClick={(e) => e.stopPropagation()}>
						<Spinner aria-hidden />
						Duplicating…
					</div>
				)}
			</article>

			<DeleteBoardDialog open={deleteOpen} onOpenChange={setDeleteOpen} boardId={board.id} boardName={board.name} />
		</>
	);
}
