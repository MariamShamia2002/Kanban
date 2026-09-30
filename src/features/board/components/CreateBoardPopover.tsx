import { useState, type ReactElement } from "react";
import { InlineCreateForm } from "@/components/shared/InlineCreateForm";
import { Popover, PopoverContent, PopoverHeader, PopoverTitle, PopoverTrigger } from "@/components/ui/popover";
import { useCreateBoard } from "@/features/board/hooks/useCreateBoard";
import { boardNameSchema } from "@/features/board/schemas/boardNameSchema";

interface CreateBoardPopoverProps {
	children: ReactElement;
	align?: "start" | "center" | "end";
}

export function CreateBoardPopover({ children, align = "end" }: CreateBoardPopoverProps) {
	const [open, setOpen] = useState(false);
	const createBoard = useCreateBoard();

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger render={children} />
			<PopoverContent align={align} className="w-72 p-3">
				<PopoverHeader className="mb-1">
					<PopoverTitle>Create board</PopoverTitle>
				</PopoverHeader>

				<InlineCreateForm
					fieldSchema={boardNameSchema.shape.name}
					onSubmit={async (name) => {
						await createBoard.mutateAsync(name);
						setOpen(false);
					}}
					onCancel={() => setOpen(false)}
					label={
						<>
							Board title <span className="text-destructive">*</span>
						</>
					}
					placeholder="e.g. Product Roadmap"
					submitLabel="Create"
					pendingLabel="Creating…"
					fullWidthSubmit
					className="gap-3"
				/>
			</PopoverContent>
		</Popover>
	);
}
