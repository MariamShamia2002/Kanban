import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { getErrorMessage, getFieldErrors, isConflict } from "@/api/errors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Spinner } from "@/components/ui/spinner";
import { useCreateLabel } from "@/features/label/hooks/useCreateLabel";
import { LABEL_COLORS, labelSchema, type LabelFormValues } from "@/features/label/schemas/labelSchema";
import type { Label } from "@/features/label/types/label.types";
import { cn } from "@/lib/utils";

interface CreateLabelPopoverProps {
	boardId: string;
	onCreated?: (label: Label) => void;
}

export function CreateLabelPopover({ boardId, onCreated }: CreateLabelPopoverProps) {
	const [open, setOpen] = useState(false);
	const createLabel = useCreateLabel(boardId);

	const {
		register,
		control,
		handleSubmit,
		reset,
		setError,
		formState: { errors, isSubmitting },
	} = useForm<LabelFormValues>({
		resolver: zodResolver(labelSchema),
		defaultValues: { name: "", color: LABEL_COLORS[0] },
	});

	async function submit(values: LabelFormValues) {
		try {
			const label = await createLabel.mutateAsync(values);
			onCreated?.(label);
			setOpen(false);
		} catch (err) {
			if (isConflict(err)) {
				setError("name", { message: getErrorMessage(err) });
				return;
			}
			const fields = getFieldErrors(err);
			if (fields.name || fields.color) {
				if (fields.name) setError("name", { message: fields.name });
				if (fields.color) setError("color", { message: fields.color });
				return;
			}
			setError("name", { message: getErrorMessage(err, "Couldn't create label. Please try again.") });
		}
	}

	return (
		<Popover
			open={open}
			onOpenChange={(next) => {
				if (next) reset({ name: "", color: LABEL_COLORS[0] });
				setOpen(next);
			}}>
			<PopoverTrigger className="inline-flex items-center rounded-md border border-dashed border-primary/50 px-2.5 py-1 text-sm font-medium text-primary transition-colors hover:border-primary hover:bg-primary/5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none data-popup-open:border-primary data-popup-open:bg-primary/5">
				+ New label
			</PopoverTrigger>
			<PopoverContent align="start" className="w-80 p-3">
				<form
					noValidate
					className="flex flex-col gap-3"
					onSubmit={(e) => {
						// The popover is portaled but React events still bubble to the card dialog's form.
						e.stopPropagation();
						void handleSubmit(submit)(e);
					}}>
					<Input autoFocus placeholder="Label name" aria-label="Label name" aria-invalid={!!errors.name} readOnly={isSubmitting} {...register("name")} />
					{errors.name && (
						<p role="alert" className="-mt-1 text-xs text-destructive">
							{errors.name.message}
						</p>
					)}

					<div className="flex items-center justify-between gap-2">
						<Controller
							control={control}
							name="color"
							render={({ field }) => (
								<div role="radiogroup" aria-label="Label color" className="flex gap-2">
									{LABEL_COLORS.map((color) => {
										const checked = field.value === color;
										return (
											<button
												key={color}
												type="button"
												role="radio"
												aria-checked={checked}
												aria-label={`Color ${color}`}
												onClick={() => field.onChange(color)}
												className={cn("size-7 rounded-md transition-shadow focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none", checked && "ring-2 ring-foreground ring-offset-2 ring-offset-popover")}
												style={{ backgroundColor: color }}
											/>
										);
									})}
								</div>
							)}
						/>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? (
								<>
									<Spinner />
									Creating…
								</>
							) : (
								"Create"
							)}
						</Button>
					</div>
					{errors.color && (
						<p role="alert" className="-mt-1 text-xs text-destructive">
							{errors.color.message}
						</p>
					)}
				</form>
			</PopoverContent>
		</Popover>
	);
}
