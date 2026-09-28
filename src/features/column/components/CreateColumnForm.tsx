import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { getErrorMessage, getFieldErrors, isApiError } from "@/api/errors";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { useCreateColumn } from "@/features/column/hooks/useCreateColumn";
import { columnNameSchema, type ColumnNameFormValues } from "@/features/column/schemas/columnNameSchema";
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

	const {
		register,
		handleSubmit,
		reset,
		setError,
		setFocus,
		formState: { errors, isSubmitting },
	} = useForm<ColumnNameFormValues>({
		resolver: zodResolver(columnNameSchema),
		defaultValues: { name: "" },
	});
	const errorId = `create-column-error-${boardId}`;

	useEffect(() => {
		setFocus("name");
	}, [setFocus]);

	async function onSubmit(values: ColumnNameFormValues) {
		try {
			await createColumn.mutateAsync({ name: values.name, position });
			reset({ name: "" });
			setFocus("name");
			onCreated?.();
		} catch (err) {
			const fields = getFieldErrors(err);
			if (Object.keys(fields).length > 0) {
				for (const [field, message] of Object.entries(fields)) {
					setError(field as keyof ColumnNameFormValues, { message });
				}
				return;
			}
			setError("name", {
				message: isApiError(err) ? getErrorMessage(err) : "Something went wrong. Please try again.",
			});
		}
	}

	const busy = isSubmitting || createColumn.isPending;

	return (
		<form
			onSubmit={handleSubmit(onSubmit)}
			noValidate
			onKeyDown={(e) => {
				if (e.key === "Escape") {
					e.preventDefault();
					onCancel();
				}
			}}
			className={cn("flex w-72 shrink-0 flex-col gap-2 rounded-xl border border-primary bg-card p-2", className)}>
			<Input
				placeholder="Column name…"
				aria-label="Column name"
				readOnly={busy}
				aria-invalid={!!errors.name}
				aria-describedby={errors.name ? errorId : undefined}
				className={errors.name ? "border-destructive focus-visible:ring-destructive/40" : ""}
				{...register("name")}
			/>
			{errors.name && (
				<p id={errorId} role="alert" className="px-0.5 text-xs text-destructive">
					{errors.name.message}
				</p>
			)}
			<div className="flex items-center gap-1">
				<Button type="submit" disabled={busy}>
					{busy ? (
						<>
							<Spinner />
							Adding…
						</>
					) : (
						"Add column"
					)}
				</Button>
				<Button type="button" variant="ghost" className="text-muted-foreground" onClick={onCancel}>
					Cancel
				</Button>
			</div>
		</form>
	);
}
