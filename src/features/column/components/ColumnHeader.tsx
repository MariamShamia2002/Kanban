import { useState, type HTMLAttributes } from "react";
import { GripVertical, MoreHorizontal } from "lucide-react";
import { InlineRenameInput } from "@/components/shared/InlineRenameInput";
import { Button } from "@/components/ui/button";
import { dropPosition } from "@/features/board/lib/dropPosition";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DeleteColumnDialog } from "@/features/column/components/DeleteColumnDialog";
import { useUpdateColumn } from "@/features/column/hooks/useUpdateColumn";
import { columnNameSchema } from "@/features/column/schemas/columnNameSchema";
import type { ColumnWithCards } from "@/features/column/types/column.types";
interface ColumnHeaderProps {
	column: ColumnWithCards;
	/** All columns of the board, sorted by position. */
	columns: ColumnWithCards[];
	/** The grip is the only place a column drag starts (activator ref + sortable attributes/listeners). */
	gripRef: (element: HTMLElement | null) => void;
	gripProps: HTMLAttributes<HTMLButtonElement>;
}

export function ColumnHeader({ column, columns, gripRef, gripProps }: ColumnHeaderProps) {
	const updateColumn = useUpdateColumn(column.boardId);
	const [isRenaming, setIsRenaming] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);

	const index = columns.findIndex((c) => c.id === column.id);
	const isFirst = index === 0;
	const isLast = index === columns.length - 1;
	const targetColumn = columns.find((c) => c.id !== column.id);

	function move(direction: "left" | "right") {
		const targetIndex = direction === "left" ? index - 1 : index + 1;
		updateColumn.mutate({ columnId: column.id, body: { position: dropPosition(columns, column.id, targetIndex) } });
	}

	return (
		<header className="flex items-center gap-1.5 px-1 py-1">
			<button
				type="button"
				ref={gripRef}
				{...gripProps}
				aria-label={`Move column ${column.name}`}
				className="-ml-0.5 flex size-5 shrink-0 cursor-grab touch-none items-center justify-center rounded text-muted-foreground/60 transition-colors hover:bg-foreground/5 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:cursor-grabbing">
				<GripVertical className="size-3.5" aria-hidden />
			</button>

			{isRenaming ? (
				<InlineRenameInput
					value={column.name}
					fieldSchema={columnNameSchema.shape.name}
					onSave={(name) => updateColumn.mutateAsync({ columnId: column.id, body: { name } })}
					onDone={() => setIsRenaming(false)}
					aria-label="Column name"
				/>
			) : (
				<h2 className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">{column.name}</h2>
			)}

			<span className="font-mono text-[11px] text-muted-foreground">{column.cards.length}</span>

			<DropdownMenu>
				<DropdownMenuTrigger render={<Button type="button" variant="ghost" size="icon-xs" className="shrink-0 text-muted-foreground" aria-label={`Actions for ${column.name}`} />}>
					<MoreHorizontal />
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="min-w-44">
					<DropdownMenuItem onClick={() => setIsRenaming(true)}>Rename column</DropdownMenuItem>
					<DropdownMenuItem disabled={isFirst} onClick={() => move("left")}>
						Move left
					</DropdownMenuItem>
					<DropdownMenuItem disabled={isLast} onClick={() => move("right")}>
						Move right
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem variant="destructive" onClick={() => setDeleteOpen(true)}>
						Delete column
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<DeleteColumnDialog open={deleteOpen} onOpenChange={setDeleteOpen} column={column} targetColumn={targetColumn} />
		</header>
	);
}
