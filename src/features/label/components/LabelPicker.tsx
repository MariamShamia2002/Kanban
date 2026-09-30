import { Check } from "lucide-react";
import { CreateLabelPopover } from "@/features/label/components/CreateLabelPopover";
import type { Label } from "@/features/label/types/label.types";
import { cn } from "@/lib/utils";

interface LabelPickerProps {
	boardId: string;
	/** The board's labels — the only ones a card may use. */
	labels: Label[];
	selectedIds: string[];
	onToggle: (labelId: string) => void;
	onLabelCreated?: (label: Label) => void;
}

/** Toggle chips for any number of board labels (including none), plus "+ New label". */
export function LabelPicker({ boardId, labels, selectedIds, onToggle, onLabelCreated }: LabelPickerProps) {
	return (
		<div className="flex flex-wrap gap-1.5">
			{labels.map((label) => {
				const selected = selectedIds.includes(label.id);
				return (
					<button
						key={label.id}
						type="button"
						aria-pressed={selected}
						onClick={() => onToggle(label.id)}
						className={cn("inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none", selected ? "border-transparent font-medium" : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground")}
						style={selected ? { backgroundColor: `color-mix(in srgb, ${label.color} 16%, transparent)`, color: `color-mix(in srgb, ${label.color} 75%, black)` } : undefined}>
						<span className="size-2 rounded-full" style={{ backgroundColor: label.color }} aria-hidden />
						{label.name}
						{selected && <Check className="size-3.5" aria-hidden />}
					</button>
				);
			})}
			<CreateLabelPopover boardId={boardId} onCreated={onLabelCreated} />
		</div>
	);
}
