import { useState } from "react";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { DragItemData } from "@/features/board/components/BoardDnd";
import { CreateCardForm } from "@/features/card/components/CreateCardForm";
import { SortableCard } from "@/features/card/components/SortableCard";
import { ColumnHeader } from "@/features/column/components/ColumnHeader";
import type { ColumnWithCards } from "@/features/column/types/column.types";
import { cn } from "@/lib/utils";

interface ColumnViewProps {
	/** Cards are rendered in the given order (live order while dragging), not re-sorted here. */
	column: ColumnWithCards;
	/** All columns of the board, in order — used for Move left / right and delete. */
	columns: ColumnWithCards[];
}

export function ColumnView({ column, columns }: ColumnViewProps) {
	const [isAddingCard, setIsAddingCard] = useState(false);
	const data: DragItemData = { type: "column" };
	const { setNodeRef, setActivatorNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({ id: column.id, data });

	return (
		<section
			ref={setNodeRef}
			aria-label={column.name}
			style={{ transform: CSS.Translate.toString(transform), transition }}
			className={cn("flex w-72 shrink-0 flex-col gap-2 rounded-xl bg-muted/60 p-2", isDragging && "border-2 border-dashed border-primary/60 bg-primary/10 [&>*]:invisible")}>
			<ColumnHeader column={column} columns={columns} gripRef={setActivatorNodeRef} gripProps={{ ...attributes, ...listeners }} />

			<SortableContext items={column.cards.map((card) => card.id)} strategy={verticalListSortingStrategy}>
				{column.cards.length > 0 && (
					<div className="flex flex-col gap-2">
						{column.cards.map((card) => (
							<SortableCard key={card.id} card={card} columnId={column.id} />
						))}
					</div>
				)}
			</SortableContext>

			{isAddingCard ? (
				<CreateCardForm boardId={column.boardId} columnId={column.id} onCancel={() => setIsAddingCard(false)} />
			) : (
				<button
					type="button"
					onClick={() => setIsAddingCard(true)}
					className="rounded-md px-1.5 py-1.5 text-left text-sm text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
					+ Add card
				</button>
			)}
		</section>
	);
}
