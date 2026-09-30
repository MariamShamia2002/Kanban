import { daysUntilDue, formatShortDate } from "@/features/card/lib/dueDate";
import { cn } from "@/lib/utils";

const DUE_SOON_DAYS = 3;

interface DueDateChipProps {
	dueDate: string;
}

export function DueDateChip({ dueDate }: DueDateChipProps) {
	const days = daysUntilDue(dueDate);
	const overdue = days < 0;
	const marker = overdue ? "⚑" : days <= DUE_SOON_DAYS ? "●" : "○";

	return (
		<time
			dateTime={dueDate}
			title={overdue ? "Overdue" : undefined}
			className={cn("inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[11px] leading-none", overdue ? "bg-destructive/10 text-destructive" : "text-muted-foreground")}>
			<span aria-hidden>{marker}</span>
			{formatShortDate(dueDate)}
		</time>
	);
}
