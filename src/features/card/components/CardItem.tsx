import type { Card } from "@/features/card/types/card.types";

interface CardItemProps {
	card: Card;
}

export function CardItem({ card }: CardItemProps) {
	return (
		<article className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3 shadow-xs">
			{card.labels.length > 0 && (
				<ul className="flex flex-wrap gap-1">
					{card.labels.map((label) => (
						<li key={label.id} className="rounded-full px-2 py-0.5 text-[11px] font-medium text-white" style={{ backgroundColor: label.color }}>
							{label.name}
						</li>
					))}
				</ul>
			)}
			<h3 className="text-sm leading-snug text-foreground">{card.title}</h3>
			{card.dueDate && (
				<time dateTime={card.dueDate} className="font-mono text-[11px] text-muted-foreground">
					Due {new Date(card.dueDate).toLocaleDateString()}
				</time>
			)}
		</article>
	);
}
