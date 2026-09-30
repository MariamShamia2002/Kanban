import { InlineCreateForm } from "@/components/shared/InlineCreateForm";
import { useCreateCard } from "@/features/card/hooks/useCreateCard";
import { cardTitleSchema } from "@/features/card/schemas/cardTitleSchema";

interface CreateCardFormProps {
	boardId: string;
	columnId: string;
	onCancel: () => void;
}

export function CreateCardForm({ boardId, columnId, onCancel }: CreateCardFormProps) {
	const createCard = useCreateCard(boardId, columnId);

	return (
		<InlineCreateForm
			fieldSchema={cardTitleSchema.shape.title}
			onSubmit={(title) => createCard.mutateAsync({ title })}
			onCancel={onCancel}
			placeholder="Card title…"
			submitLabel="Add card"
			pendingLabel="Adding…"
			hint="↵ add"
			multiline
			resetOnSuccess
			className="rounded-lg border border-primary bg-card p-2"
		/>
	);
}
