import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { CreateColumnForm } from "@/features/column/components/CreateColumnForm";
import { useCreateStarterColumns } from "@/features/column/hooks/useCreateStarterColumns";
import { STARTER_COLUMNS } from "@/features/column/lib/starterColumns";
import { getErrorMessage } from "@/api/errors";

interface BoardEmptyStateProps {
	boardId: string;
}

export function BoardEmptyState({ boardId }: BoardEmptyStateProps) {
	const [isAdding, setIsAdding] = useState(false);
	const createStarter = useCreateStarterColumns(boardId);

	return (
		<div className="flex flex-col items-center justify-center px-6 py-20 text-center">
			<div className="mb-5 flex gap-1.5" aria-hidden>
				<span className="h-10 w-8 rounded-md border border-dashed border-destructive/30" />
				<span className="h-10 w-8 rounded-md border border-border" />
				<span className="h-10 w-8 rounded-md border border-border/50" />
			</div>

			<h2 className="text-base font-semibold text-foreground">This board has no columns</h2>
			<p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
				Columns are the stages work moves through. Add your first one, or start from a standard three-stage flow.
			</p>

			<div className="mt-6 flex flex-wrap items-start justify-center gap-2">
				{isAdding ? (
					<CreateColumnForm boardId={boardId} position={0} onCancel={() => setIsAdding(false)} className="text-left" />
				) : (
					<Button type="button" onClick={() => setIsAdding(true)}>
						+ Add column
					</Button>
				)}
				<Button type="button" variant="outline" onClick={() => createStarter.mutate()} disabled={createStarter.isPending}>
					{createStarter.isPending ? (
						<>
							<Spinner />
							Creating…
						</>
					) : (
						STARTER_COLUMNS.join(" / ")
					)}
				</Button>
			</div>

			{createStarter.isError && (
				<p role="alert" className="mt-3 text-xs text-destructive">
					{getErrorMessage(createStarter.error, "Couldn't create columns. Please try again.")}
				</p>
			)}
		</div>
	);
}
