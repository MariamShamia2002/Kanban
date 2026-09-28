import { CardItem } from "@/features/card/components/CardItem";
import type { ColumnWithCards } from "@/features/column/types/column.types";

interface ColumnViewProps {
	column: ColumnWithCards;
}

export function ColumnView({ column }: ColumnViewProps) {
	const cards = [...column.cards].sort((a, b) => a.position - b.position);

	return (
		<section aria-label={column.name} className="flex w-72 shrink-0 flex-col gap-2 rounded-xl bg-muted/50 p-2">
			<header className="flex items-center justify-between px-1.5 py-1">
				<h2 className="text-sm font-semibold text-foreground">{column.name}</h2>
				<span className="font-mono text-[11px] text-muted-foreground">{cards.length}</span>
			</header>

			{cards.length === 0 ? (
				<p className="px-1.5 pb-2 text-xs text-muted-foreground">No cards yet</p>
			) : (
				<div className="flex flex-col gap-2">
					{cards.map((card) => (
						<CardItem key={card.id} card={card} />
					))}
				</div>
			)}
		</section>
	);
}
