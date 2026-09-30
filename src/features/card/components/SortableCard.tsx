import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { DragItemData } from "@/features/board/components/BoardDnd";
import { CardItem } from "@/features/card/components/CardItem";
import type { Card } from "@/features/card/types/card.types";
import { cn } from "@/lib/utils";

interface SortableCardProps {
	card: Card;
	/** The column the card is shown in right now (changes while dragging across columns). */
	columnId: string;
}

/** Draggable card. While dragged it stays mounted as the blue drop placeholder, so keyboard focus is kept. */
export function SortableCard({ card, columnId }: SortableCardProps) {
	const data: DragItemData = { type: "card", columnId };
	const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({ id: card.id, data });

	return (
		<CardItem
			ref={setNodeRef}
			card={card}
			isDragging={isDragging}
			style={{ transform: CSS.Translate.toString(transform), transition }}
			{...attributes}
			{...listeners}
			className={cn(isDragging && "border-2 border-dashed border-primary/60 bg-primary/10 shadow-none hover:border-primary/60 [&>*]:invisible")}
		/>
	);
}
