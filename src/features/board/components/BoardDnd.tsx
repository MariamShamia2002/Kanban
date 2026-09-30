import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
	closestCenter,
	DndContext,
	DragOverlay,
	KeyboardCode,
	KeyboardSensor,
	PointerSensor,
	pointerWithin,
	rectIntersection,
	useSensor,
	useSensors,
	type Announcements,
	type CollisionDetection,
	type DragEndEvent,
	type DragOverEvent,
	type DragStartEvent,
	type KeyboardCoordinateGetter,
	type UniqueIdentifier,
} from "@dnd-kit/core";
import { arrayMove, horizontalListSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import { getErrorMessage } from "@/api/errors";
import { dropPosition } from "@/features/board/lib/dropPosition";
import type { Board } from "@/features/board/types/board.types";
import { CardItem } from "@/features/card/components/CardItem";
import { useMoveCard } from "@/features/card/hooks/useMoveCard";
import { useUpdateColumn } from "@/features/column/hooks/useUpdateColumn";
import type { ColumnWithCards } from "@/features/column/types/column.types";

/** Put on every sortable's `data` so drag handlers know what they are dealing with. */
export type DragItemData = { type: "card"; columnId: string } | { type: "column" };

/** Order of columns and cards while a drag is in progress; `null` when idle. */
interface DragState {
	columnOrder: string[];
	cardIds: Record<string, string[]>;
}

interface BoardDndProps {
	board: Board;
	/** Board columns sorted by position. */
	columns: ColumnWithCards[];
	/** Receives the columns in their live order (reordered while dragging). */
	children: (columns: ColumnWithCards[]) => ReactNode;
}

const ERROR_TIMEOUT_MS = 5000;

const screenReaderInstructions = {
	draggable: "To pick up, press Space. Use the arrow keys to move, Enter to drop, or Escape to cancel.",
};

/** `useSortable` adds `sortable.items` (ids of the item's list, in order) and `sortable.index` to `data`. */
type SortableItemData = DragItemData & { sortable?: { index: number; items: UniqueIdentifier[] } };

function dragType(data: unknown): DragItemData["type"] | undefined {
	return (data as DragItemData | undefined)?.type;
}

/**
 * Arrow keys follow the board structure instead of geometry (the default getter can pick the card's
 * own column, which starts left of and above the card, and loop in place):
 * cards — Up/Down to the neighbouring card, Left/Right to the top of the neighbouring column;
 * columns — Left/Right to the neighbouring column.
 */
const boardKeyboardCoordinates: KeyboardCoordinateGetter = (event, { context: { active, over, droppableRects, droppableContainers } }) => {
	const vertical = event.code === KeyboardCode.Up || event.code === KeyboardCode.Down;
	const horizontal = event.code === KeyboardCode.Left || event.code === KeyboardCode.Right;
	if (!vertical && !horizontal) return undefined;
	event.preventDefault();

	// `active.data` keeps the data of the node picked up; a card remounts when it changes column,
	// so read the live data registered by the current node instead.
	const data = (active ? droppableContainers.get(active.id)?.data.current : undefined) as SortableItemData | undefined;
	if (!data?.sortable) return undefined;

	const step = event.code === KeyboardCode.Up || event.code === KeyboardCode.Left ? -1 : 1;
	// Sortable lists only reorder visually while dragging, so the dragged item's current slot is the one it is over.
	const neighbourOf = (item: SortableItemData | undefined, currentId?: UniqueIdentifier) => {
		if (!item?.sortable) return undefined;
		const { items, index } = item.sortable;
		const currentIndex = currentId !== undefined && items.includes(currentId) ? items.indexOf(currentId) : index;
		return items[currentIndex + step];
	};
	let targetId: UniqueIdentifier | undefined;

	if (data.type === "column") {
		if (horizontal) targetId = neighbourOf(data, over?.id);
	} else if (vertical) {
		targetId = neighbourOf(data, over?.id);
	} else {
		const nextColumnId = neighbourOf(droppableContainers.get(data.columnId)?.data.current as SortableItemData | undefined);
		if (nextColumnId !== undefined) {
			const firstCard = droppableContainers.getEnabled().find((container) => {
				const item = container.data.current as SortableItemData | undefined;
				return item?.type === "card" && item.columnId === nextColumnId && item.sortable?.index === 0;
			});
			targetId = firstCard?.id ?? nextColumnId;
		}
	}

	const rect = targetId !== undefined ? droppableRects.get(targetId) : undefined;
	return rect ? { x: rect.left, y: rect.top } : undefined;
};

/** Cards: find the column under the pointer (or overlapping, for keyboard), then the closest card in it. */
const collisionDetection: CollisionDetection = (args) => {
	const columns = args.droppableContainers.filter((c) => dragType(c.data.current) === "column");

	if (dragType(args.active.data.current) === "column") {
		return closestCenter({ ...args, droppableContainers: columns });
	}

	const columnHits = args.pointerCoordinates ? pointerWithin({ ...args, droppableContainers: columns }) : rectIntersection({ ...args, droppableContainers: columns });
	const columnId = columnHits[0]?.id;
	const cards = args.droppableContainers.filter((c) => {
		const data = c.data.current as DragItemData | undefined;
		return data?.type === "card" && (columnId === undefined || data.columnId === columnId);
	});

	if (cards.length > 0) return closestCenter({ ...args, droppableContainers: cards });
	return columnId !== undefined ? [{ id: columnId }] : [];
};

export function BoardDnd({ board, columns, children }: BoardDndProps) {
	const moveCard = useMoveCard(board.id);
	const updateColumn = useUpdateColumn(board.id);
	const [dragState, setDragState] = useState<DragState | null>(null);
	const [activeId, setActiveId] = useState<string | null>(null);
	const [moveError, setMoveError] = useState<string | null>(null);

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
		useSensor(KeyboardSensor, {
			coordinateGetter: boardKeyboardCoordinates,
			scrollBehavior: "auto",
			keyboardCodes: { start: ["Space"], cancel: ["Escape"], end: ["Enter", "Space"] },
		}),
	);

	const cardsById = useMemo(() => new Map(columns.flatMap((column) => column.cards).map((card) => [card.id, card])), [columns]);
	const columnsById = useMemo(() => new Map(columns.map((column) => [column.id, column])), [columns]);

	const liveColumns = useMemo(() => {
		if (!dragState) return columns;
		return dragState.columnOrder.map((id) => ({
			...columnsById.get(id)!,
			cards: dragState.cardIds[id].map((cardId) => cardsById.get(cardId)!),
		}));
	}, [dragState, columns, columnsById, cardsById]);

	useEffect(() => {
		if (!moveError) return;
		const timer = setTimeout(() => setMoveError(null), ERROR_TIMEOUT_MS);
		return () => clearTimeout(timer);
	}, [moveError]);

	function findColumnId(state: DragState, id: UniqueIdentifier): string | undefined {
		if (id in state.cardIds) return String(id);
		return Object.keys(state.cardIds).find((columnId) => state.cardIds[columnId].includes(String(id)));
	}

	function nameOf(id: UniqueIdentifier) {
		return cardsById.get(String(id))?.title ?? columnsById.get(String(id))?.name ?? "item";
	}

	const announcements: Announcements = {
		onDragStart: ({ active }) => `Picked up ${nameOf(active.id)}.`,
		onDragOver: ({ active, over }) => (over ? `${nameOf(active.id)} is over ${nameOf(over.id)}.` : `${nameOf(active.id)} is no longer over a drop area.`),
		onDragEnd: ({ active, over }) => (over ? `Dropped ${nameOf(active.id)}.` : `${nameOf(active.id)} was dropped outside a drop area.`),
		onDragCancel: ({ active }) => `Cancelled. ${nameOf(active.id)} returned to its place.`,
	};

	function handleDragStart({ active }: DragStartEvent) {
		setMoveError(null);
		setActiveId(String(active.id));
		setDragState({
			columnOrder: columns.map((column) => column.id),
			cardIds: Object.fromEntries(columns.map((column) => [column.id, column.cards.map((card) => card.id)])),
		});
	}

	/** Moves a card into another column as soon as it hovers there, so its placeholder follows. */
	function handleDragOver({ active, over }: DragOverEvent) {
		if (!over || dragType(active.data.current) !== "card") return;

		setDragState((state) => {
			if (!state) return state;
			const fromId = findColumnId(state, active.id);
			const toId = findColumnId(state, over.id);
			if (!fromId || !toId || fromId === toId) return state;

			const target = state.cardIds[toId];
			const overIndex = target.indexOf(String(over.id));
			const insertAt = overIndex === -1 ? target.length : overIndex;

			return {
				...state,
				cardIds: {
					...state.cardIds,
					[fromId]: state.cardIds[fromId].filter((id) => id !== active.id),
					[toId]: [...target.slice(0, insertAt), String(active.id), ...target.slice(insertAt)],
				},
			};
		});
	}

	function handleDragEnd({ active, over }: DragEndEvent) {
		const state = dragState;
		setDragState(null);
		setActiveId(null);
		if (!state || !over) return;

		const id = String(active.id);
		const onError = (err: unknown) => setMoveError(getErrorMessage(err, "Couldn't move it. Your change was undone."));

		if (dragType(active.data.current) === "column") {
			const order = arrayMove(state.columnOrder, state.columnOrder.indexOf(id), state.columnOrder.indexOf(String(over.id)));
			const newIndex = order.indexOf(id);
			if (newIndex === columns.findIndex((column) => column.id === id)) return;

			const ordered = order.map((columnId) => columnsById.get(columnId)!);
			updateColumn.mutate({ columnId: id, body: { position: dropPosition(ordered, id, newIndex) } }, { onError });
			return;
		}

		const columnId = findColumnId(state, id);
		if (!columnId) return;

		let ids = state.cardIds[columnId];
		const overIndex = ids.indexOf(String(over.id));
		if (overIndex !== -1) ids = arrayMove(ids, ids.indexOf(id), overIndex);

		const newIndex = ids.indexOf(id);
		const card = cardsById.get(id)!;
		const original = columnsById.get(card.columnId)!;
		if (columnId === card.columnId && newIndex === original.cards.findIndex((c) => c.id === id)) return;

		const ordered = ids.map((cardId) => cardsById.get(cardId)!);
		moveCard.mutate({ cardId: id, toColumnId: columnId, position: dropPosition(ordered, id, newIndex) }, { onError });
	}

	const activeCard = activeId ? cardsById.get(activeId) : undefined;
	const activeColumn = activeId ? columnsById.get(activeId) : undefined;

	return (
		<DndContext
			sensors={sensors}
			collisionDetection={collisionDetection}
			accessibility={{ announcements, screenReaderInstructions }}
			onDragStart={handleDragStart}
			onDragOver={handleDragOver}
			onDragEnd={handleDragEnd}
			onDragCancel={() => {
				setDragState(null);
				setActiveId(null);
			}}>
			<SortableContext items={liveColumns.map((column) => column.id)} strategy={horizontalListSortingStrategy}>
				{children(liveColumns)}
			</SortableContext>

			<DragOverlay>
				{activeCard && (
					<div className="rotate-2 cursor-grabbing shadow-lg">
						<CardItem card={activeCard} />
					</div>
				)}
				{activeColumn && (
					<div className="flex w-72 rotate-1 cursor-grabbing items-center justify-between rounded-xl bg-muted px-3 py-2.5 shadow-lg ring-1 ring-primary/30">
						<span className="text-sm font-semibold text-foreground">{activeColumn.name}</span>
						<span className="font-mono text-[11px] text-muted-foreground">{activeColumn.cards.length}</span>
					</div>
				)}
			</DragOverlay>

			{moveError && (
				<p role="alert" className="fixed bottom-12 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-destructive px-4 py-2 text-sm text-white shadow-lg">
					{moveError}
				</p>
			)}
		</DndContext>
	);
}
