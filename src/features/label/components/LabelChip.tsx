import type { Label } from "@/features/label/types/label.types";
import { cn } from "@/lib/utils";

interface LabelChipProps {
	label: Pick<Label, "name" | "color">;
	className?: string;
}

/** Label name on a light tint of its color, with darker text for contrast. */
export function LabelChip({ label, className }: LabelChipProps) {
	return (
		<span
			className={cn("inline-flex items-center rounded px-1.5 py-0.5 text-[11px] leading-none font-medium", className)}
			style={{
				backgroundColor: `color-mix(in srgb, ${label.color} 16%, transparent)`,
				color: `color-mix(in srgb, ${label.color} 75%, black)`,
			}}>
			{label.name}
		</span>
	);
}
