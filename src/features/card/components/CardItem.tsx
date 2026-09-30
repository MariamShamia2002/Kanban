import type { HTMLAttributes, Ref } from "react";
import { AlignLeft } from "lucide-react";
import { useSearchParams } from "react-router";
import { DueDateChip } from "@/features/card/components/DueDateChip";
import type { Card } from "@/features/card/types/card.types";
import { LabelChip } from "@/features/label/components/LabelChip";
import { cn } from "@/lib/utils";

/** Search param holding the id of the card open in the detail dialog. */
export const OPEN_CARD_PARAM = "card";

interface CardItemProps extends HTMLAttributes<HTMLElement> {
	card: Card;
	ref?: Ref<HTMLElement>;
	/** While picked up, Enter drops the card instead of opening it. */
	isDragging?: boolean;
}

/** Extra props (drag attributes, listeners, style) are spread onto the card so it stays a single focus target. */
export function CardItem({ card, ref, isDragging = false, className, onKeyDown, ...rest }: CardItemProps) {
	const [, setSearchParams] = useSearchParams();
	const hasMeta = card.dueDate !== null || !!card.description;

	function openDetail() {
		setSearchParams(
			(params) => {
				params.set(OPEN_CARD_PARAM, card.id);
				return params;
			},
			{ replace: true },
		);
	}

	return (
		<article
			ref={ref}
			role="button"
			tabIndex={0}
			aria-label={`Open card: ${card.title}`}
			onClick={openDetail}
			{...rest}
			onKeyDown={(e) => {
				if (e.key === "Enter" && !isDragging) {
					e.preventDefault();
					openDetail();
					return;
				}
				onKeyDown?.(e);
			}}
			className={cn("flex cursor-grab flex-col gap-2 rounded-lg border border-border bg-card p-3 shadow-xs transition-colors hover:border-foreground/25 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:cursor-grabbing", className)}>
			{card.labels.length > 0 && (
				<ul className="flex flex-wrap gap-1" aria-label="Labels">
					{card.labels.map((label) => (
						<li key={label.id}>
							<LabelChip label={label} />
						</li>
					))}
				</ul>
			)}

			<h3 className="text-sm leading-snug text-foreground">{card.title}</h3>

			{hasMeta && (
				<div className="flex items-center gap-2">
					{card.dueDate && <DueDateChip dueDate={card.dueDate} />}
					{card.description && <AlignLeft className="size-3 text-muted-foreground" aria-label="Has description" />}
				</div>
			)}
		</article>
	);
}
