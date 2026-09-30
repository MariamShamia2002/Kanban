import { InlineCreateForm } from "@/components/shared/InlineCreateForm";
import { useCreateColumn } from "@/features/column/hooks/useCreateColumn";
import { columnNameSchema } from "@/features/column/schemas/columnNameSchema";
import { cn } from "@/lib/utils";

interface CreateColumnFormProps {
	boardId: string;
	position?: number;
	onCancel: () => void;
	onCreated?: () => void;
	className?: string;
}

export function CreateColumnForm({ boardId, position, onCancel, onCreated, className }: CreateColumnFormProps) {
	const createColumn = useCreateColumn(boardId);

	return (
		<InlineCreateForm
			fieldSchema={columnNameSchema.shape.name}
			onSubmit={async (name) => {
				await createColumn.mutateAsync({ name, position });
				onCreated?.();
			}}
			onCancel={onCancel}
			placeholder="Column name…"
			submitLabel="Add column"
			pendingLabel="Adding…"
			resetOnSuccess
			className={cn("w-72 shrink-0 rounded-xl border border-primary bg-card p-2", className)}
		/>
	);
}
