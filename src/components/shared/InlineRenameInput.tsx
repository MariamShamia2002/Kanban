import { useEffect, useId, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { getErrorMessage, getFieldErrors } from "@/api/errors";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

interface InlineRenameInputProps {
	value: string;
	/** Schema for the single field, e.g. `columnNameSchema.shape.name`. */
	fieldSchema: z.ZodType<string, string>;
	/** Called only when the trimmed value changed. */
	onSave: (value: string) => Promise<unknown>;
	/** Called on Escape, and on Enter/blur when nothing changed. */
	onDone: () => void;
	"aria-label": string;
	className?: string;
}

/** Autofocused rename field: Enter or blur saves, Escape cancels. */
export function InlineRenameInput({ value, fieldSchema, onSave, onDone, "aria-label": ariaLabel, className }: InlineRenameInputProps) {
	const errorId = useId();
	const schema = useMemo(() => z.object({ value: fieldSchema }), [fieldSchema]);

	const {
		register,
		handleSubmit,
		setError,
		setFocus,
		formState: { errors, isSubmitting },
	} = useForm<{ value: string }>({
		resolver: zodResolver(schema),
		defaultValues: { value },
	});
	const field = register("value");
	const error = errors.value?.message;

	useEffect(() => {
		setFocus("value", { shouldSelect: true });
	}, [setFocus]);

	async function save({ value: next }: { value: string }) {
		if (next === value) return onDone();
		try {
			await onSave(next);
			onDone();
		} catch (err) {
			const [fieldMessage] = Object.values(getFieldErrors(err));
			setError("value", { message: fieldMessage ?? getErrorMessage(err, "Couldn't rename. Please try again.") });
		}
	}

	function submit() {
		if (!isSubmitting) void handleSubmit(save)();
	}

	return (
		<div className={cn("relative min-w-0 flex-1", className)}>
			<input
				{...field}
				aria-label={ariaLabel}
				aria-invalid={!!error}
				aria-describedby={error ? errorId : undefined}
				aria-busy={isSubmitting}
				readOnly={isSubmitting}
				className={cn("w-full rounded-md border-2 border-primary bg-card px-2 py-0.5 text-sm font-semibold text-foreground ring-2 ring-primary/20 outline-none", isSubmitting && "pr-7 text-muted-foreground", error && "border-destructive ring-destructive/20")}
				onBlur={(e) => {
					void field.onBlur(e);
					submit();
				}}
				onKeyDown={(e) => {
					if (e.key === "Enter") {
						e.preventDefault();
						submit();
					}
					if (e.key === "Escape") {
						e.preventDefault();
						e.stopPropagation();
						onDone();
					}
				}}
			/>
			{isSubmitting && <Spinner aria-label="Saving" className="absolute top-1.5 right-2 size-3.5 text-muted-foreground" />}
			{error && (
				<p id={errorId} role="alert" className="mt-1 text-xs text-destructive">
					{error}
				</p>
			)}
		</div>
	);
}
