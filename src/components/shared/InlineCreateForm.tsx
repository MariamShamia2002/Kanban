import { useEffect, useId, useMemo, type ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { getErrorMessage, getFieldErrors } from "@/api/errors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

interface InlineCreateFormProps {
	/** Schema for the single field, e.g. `boardNameSchema.shape.name`. */
	fieldSchema: z.ZodType<string, string>;
	onSubmit: (value: string) => Promise<unknown>;
	onCancel?: () => void;
	submitLabel: string;
	pendingLabel: string;
	placeholder?: string;
	/** Visible label; when omitted, `placeholder` is used as the accessible name. */
	label?: ReactNode;
	/** Textarea instead of input. Enter submits, Shift+Enter adds a new line. */
	multiline?: boolean;
	/** Small text on the right of the actions row, e.g. "↵ add". */
	hint?: ReactNode;
	/** Clear and refocus after a successful submit so the user can add another. */
	resetOnSuccess?: boolean;
	fullWidthSubmit?: boolean;
	className?: string;
}

const textareaClassName =
	"min-h-16 w-full resize-none rounded-lg border border-input bg-transparent px-2.5 py-2 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm";

export function InlineCreateForm({ fieldSchema, onSubmit, onCancel, submitLabel, pendingLabel, placeholder, label, multiline = false, hint, resetOnSuccess = false, fullWidthSubmit = false, className }: InlineCreateFormProps) {
	const inputId = useId();
	const errorId = `${inputId}-error`;
	const schema = useMemo(() => z.object({ value: fieldSchema }), [fieldSchema]);

	const {
		register,
		handleSubmit,
		reset,
		setError,
		setFocus,
		formState: { errors, isSubmitting },
	} = useForm<{ value: string }>({
		resolver: zodResolver(schema),
		defaultValues: { value: "" },
	});
	const error = errors.value?.message;

	useEffect(() => {
		setFocus("value");
	}, [setFocus]);

	async function submit({ value }: { value: string }) {
		try {
			await onSubmit(value);
			if (resetOnSuccess) {
				reset({ value: "" });
				setFocus("value");
			}
		} catch (err) {
			const [fieldMessage] = Object.values(getFieldErrors(err));
			setError("value", { message: fieldMessage ?? getErrorMessage(err, "Something went wrong. Please try again.") });
		}
	}

	const fieldProps = {
		id: inputId,
		placeholder,
		"aria-label": label ? undefined : placeholder,
		"aria-invalid": !!error,
		"aria-describedby": error ? errorId : undefined,
		readOnly: isSubmitting,
		...register("value"),
	};

	return (
		<form
			onSubmit={handleSubmit(submit)}
			noValidate
			onKeyDown={(e) => {
				if (e.key === "Escape" && onCancel) {
					e.preventDefault();
					onCancel();
				}
			}}
			className={cn("flex flex-col gap-2", className)}>
			{label && <Label htmlFor={inputId}>{label}</Label>}

			{multiline ? (
				<textarea
					{...fieldProps}
					rows={2}
					className={textareaClassName}
					onKeyDown={(e) => {
						if (e.key === "Enter" && !e.shiftKey) {
							e.preventDefault();
							e.currentTarget.form?.requestSubmit();
						}
					}}
				/>
			) : (
				<Input {...fieldProps} />
			)}

			{error && (
				<p id={errorId} role="alert" className="px-0.5 text-xs text-destructive">
					{error}
				</p>
			)}

			<div className="flex items-center gap-1">
				<Button type="submit" disabled={isSubmitting} className={cn(fullWidthSubmit && "flex-1")}>
					{isSubmitting ? (
						<>
							<Spinner />
							{pendingLabel}
						</>
					) : (
						submitLabel
					)}
				</Button>
				{onCancel && (
					<Button type="button" variant="outline" className="text-muted-foreground" onClick={onCancel}>
						Cancel
					</Button>
				)}
				{hint && <span className="ml-auto font-mono text-[11px] text-muted-foreground">{hint}</span>}
			</div>
		</form>
	);
}
