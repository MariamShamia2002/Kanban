import { useEffect, useState, type ReactElement } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { getFieldErrors, getErrorMessage, isApiError } from "@/api/errors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverHeader, PopoverTitle, PopoverTrigger } from "@/components/ui/popover";
import { useCreateBoard } from "@/features/board/hooks/useCreateBoard";
import { boardNameSchema, type BoardNameFormValues } from "@/features/board/schemas/boardNameSchema";

interface CreateBoardPopoverProps {
	children: ReactElement;
	align?: "start" | "center" | "end";
}

export function CreateBoardPopover({ children, align = "end" }: CreateBoardPopoverProps) {
	const [open, setOpen] = useState(false);
	const createBoard = useCreateBoard();

	const {
		register,
		handleSubmit,
		reset,
		setError,
		formState: { errors, isSubmitting },
	} = useForm<BoardNameFormValues>({
		resolver: zodResolver(boardNameSchema),
		defaultValues: { name: "" },
	});

	useEffect(() => {
		if (open) {
			reset({ name: "" });
			createBoard.reset();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps -- reset when popover opens
	}, [open]);

	async function onSubmit(values: BoardNameFormValues) {
		try {
			await createBoard.mutateAsync(values.name);
			setOpen(false);
		} catch (err) {
			const fields = getFieldErrors(err);
			if (Object.keys(fields).length > 0) {
				for (const [field, message] of Object.entries(fields)) {
					setError(field as keyof BoardNameFormValues, { message });
				}
				return;
			}

			setError("name", {
				message: isApiError(err) ? getErrorMessage(err) : "Something went wrong. Please try again.",
			});
		}
	}

	const busy = isSubmitting || createBoard.isPending;

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger render={children} />
			<PopoverContent align={align} className="w-72 p-3">
				<PopoverHeader className="mb-1">
					<PopoverTitle>Create board</PopoverTitle>
				</PopoverHeader>

				<form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3">
					<div className="flex flex-col gap-1.5">
						<Label htmlFor="board-name-popover">
							Board title <span className="text-destructive">*</span>
						</Label>
						<Input id="board-name-popover" autoFocus placeholder="e.g. Product Roadmap" aria-invalid={!!errors.name} aria-describedby={errors.name ? "board-name-popover-error" : undefined} className={errors.name ? "border-destructive focus-visible:ring-destructive/40" : ""} {...register("name")} />
						{errors.name && (
							<p id="board-name-popover-error" role="alert" className="text-xs text-destructive">
								{errors.name.message}
							</p>
						)}
					</div>

					<Button type="submit" disabled={busy} className="w-full">
						{busy ? (
							<>
								<Loader2 className="animate-spin" />
								Creating…
							</>
						) : (
							"Create"
						)}
					</Button>
				</form>
			</PopoverContent>
		</Popover>
	);
}
