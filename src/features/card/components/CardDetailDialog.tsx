import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { getErrorMessage, getFieldErrors } from "@/api/errors";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label as FieldLabel } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { DeleteCardDialog } from "@/features/card/components/DeleteCardDialog";
import { useUpdateCard } from "@/features/card/hooks/useUpdateCard";
import { daysOverdue, isOverdue, toDateInputValue } from "@/features/card/lib/dueDate";
import { cardTitleSchema } from "@/features/card/schemas/cardTitleSchema";
import type { Card, UpdateCardBody } from "@/features/card/types/card.types";
import { LabelPicker } from "@/features/label/components/LabelPicker";
import type { Label } from "@/features/label/types/label.types";
import { cn } from "@/lib/utils";

const cardDetailSchema = z.object({
	title: cardTitleSchema.shape.title,
	description: z.string(),
	/** `YYYY-MM-DD`, or "" for no due date. */
	dueDate: z.string(),
	labelIds: z.array(z.string()),
});

type CardDetailValues = z.infer<typeof cardDetailSchema>;

/** Shared by the title text and its input so switching between them doesn't shift the layout. */
const titleClassName = "-mx-1.5 mt-1.5 block w-[calc(100%+0.75rem)] rounded-md bg-transparent px-1.5 py-0.5 text-xl text-foreground";

const fieldLabelClassName = "text-[11px] font-semibold tracking-wider text-muted-foreground uppercase";

interface CardDetailDialogProps {
	boardId: string;
	boardName: string;
	columnName: string;
	card: Card;
	/** The board's labels — the only ones a card may use. */
	labels: Label[];
	onClose: () => void;
}

/** Edits a draft of the card; Done sends one PATCH with only the changed fields. */
export function CardDetailDialog({ boardId, boardName, columnName, card, labels, onClose }: CardDetailDialogProps) {
	const updateCard = useUpdateCard(boardId);
	const [confirmDiscard, setConfirmDiscard] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);

	const {
		register,
		handleSubmit,
		setValue,
		setError,
		control,
		formState: { errors, dirtyFields, isDirty, isSubmitting },
	} = useForm<CardDetailValues>({
		resolver: zodResolver(cardDetailSchema),
		defaultValues: {
			title: card.title,
			description: card.description ?? "",
			dueDate: toDateInputValue(card.dueDate),
			labelIds: labels.filter((label) => card.labels.some((l) => l.id === label.id)).map((label) => label.id),
		},
	});

	const [isEditingTitle, setIsEditingTitle] = useState(false);
	const titleField = register("title");
	const title = useWatch({ control, name: "title" });
	const dueDate = useWatch({ control, name: "dueDate" });
	const selectedLabelIds = useWatch({ control, name: "labelIds" });

	function requestClose() {
		if (isDirty) setConfirmDiscard(true);
		else onClose();
	}

	/** Keeps board order so toggling back to the original set isn't "dirty". */
	function setSelectedLabels(selected: Set<string>, boardLabels: Label[] = labels) {
		setValue(
			"labelIds",
			boardLabels.filter((label) => selected.has(label.id)).map((label) => label.id),
			{ shouldDirty: true },
		);
	}

	function toggleLabel(labelId: string) {
		const selected = new Set(selectedLabelIds);
		if (selected.has(labelId)) selected.delete(labelId);
		else selected.add(labelId);
		setSelectedLabels(selected);
	}

	function selectCreatedLabel(label: Label) {
		// `labels` may not include the new label until the next render.
		setSelectedLabels(new Set([...selectedLabelIds, label.id]), [...labels.filter((l) => l.id !== label.id), label]);
	}

	async function onSubmit(values: CardDetailValues) {
		if (!isDirty) return onClose();

		const body: UpdateCardBody = {
			...(dirtyFields.title && { title: values.title }),
			...(dirtyFields.description && { description: values.description.trim() || null }),
			...(dirtyFields.dueDate && { dueDate: values.dueDate || null }),
			...(dirtyFields.labelIds && { labelIds: values.labelIds }),
		};

		try {
			await updateCard.mutateAsync({ cardId: card.id, body });
			onClose();
		} catch (err) {
			const fields = getFieldErrors(err);
			const known = Object.entries(fields).filter(([field]) => field in cardDetailSchema.shape);
			for (const [field, message] of known) {
				setError(field as keyof CardDetailValues, { message });
			}
			if (known.length === 0) {
				setError("root", { message: getErrorMessage(err, "Couldn't save changes. Please try again.") });
			}
		}
	}

	return (
		<>
			<Dialog
				open
				onOpenChange={(open) => {
					if (!open) requestClose();
				}}>
				<DialogContent className="gap-0 p-0 sm:max-w-xl">
					<form onSubmit={handleSubmit(onSubmit)} noValidate>
						<header className="border-b border-border px-6 pt-5 pb-4 pr-12">
							<p className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase">
								{boardName} / {columnName}
							</p>
							{isEditingTitle || errors.title ? (
								<>
									<DialogTitle className="sr-only">{title}</DialogTitle>
									<input
										autoFocus
										aria-label="Card title"
										aria-invalid={!!errors.title}
										className={cn(titleClassName, "ring-2 ring-ring/50 outline-none aria-invalid:ring-destructive/40")}
										{...titleField}
										onBlur={(e) => {
											void titleField.onBlur(e);
											setIsEditingTitle(false);
										}}
										onKeyDown={(e) => {
											if (e.key === "Enter" || e.key === "Escape") {
												// Escape leaves title editing instead of closing the dialog.
												e.preventDefault();
												e.stopPropagation();
												setIsEditingTitle(false);
											}
										}}
									/>
								</>
							) : (
								<DialogTitle className="text-xl leading-normal font-normal">
									<button type="button" onClick={() => setIsEditingTitle(true)} className={cn(titleClassName, "cursor-text text-left transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none")}>
										{title}
									</button>
								</DialogTitle>
							)}
							{errors.title && (
								<p role="alert" className="mt-1 text-xs text-destructive">
									{errors.title.message}
								</p>
							)}
						</header>

						<div className="flex flex-col gap-5 px-6 py-5">
							{errors.root && (
								<p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
									{errors.root.message}
								</p>
							)}

							<div className="flex flex-col gap-2">
								<FieldLabel htmlFor="card-description" className={fieldLabelClassName}>
									Description
								</FieldLabel>
								<textarea
									id="card-description"
									rows={4}
									placeholder="Add more detail…"
									className="w-full resize-y rounded-lg border border-input bg-muted/40 px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
									{...register("description")}
								/>
							</div>

							<div className="grid gap-5 sm:grid-cols-[auto_1fr]">
								<div className="flex flex-col gap-2">
									<FieldLabel htmlFor="card-due-date" className={fieldLabelClassName}>
										Due date
									</FieldLabel>
									<div className="flex items-center gap-3">
										<Input id="card-due-date" type="date" className="w-40" aria-invalid={!!errors.dueDate} {...register("dueDate")} />
										{dueDate && (
											<button type="button" onClick={() => setValue("dueDate", "", { shouldDirty: true })} className="text-sm text-muted-foreground underline underline-offset-3 hover:text-foreground">
												Clear
											</button>
										)}
									</div>
									{dueDate && isOverdue(dueDate) && (
										<p className="text-xs text-destructive">
											⚑ {daysOverdue(dueDate)} {daysOverdue(dueDate) === 1 ? "day" : "days"} overdue
										</p>
									)}
									{errors.dueDate && (
										<p role="alert" className="text-xs text-destructive">
											{errors.dueDate.message}
										</p>
									)}
								</div>

								<fieldset className="flex flex-col gap-2">
									<legend className={cn(fieldLabelClassName, "mb-2")}>Labels</legend>
									<LabelPicker boardId={boardId} labels={labels} selectedIds={selectedLabelIds} onToggle={toggleLabel} onLabelCreated={selectCreatedLabel} />
									{errors.labelIds && (
										<p role="alert" className="text-xs text-destructive">
											{errors.labelIds.message}
										</p>
									)}
								</fieldset>
							</div>
						</div>

						<footer className="flex items-center justify-between border-t border-border px-6 py-4">
							<Button type="button" variant="outline" className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => setDeleteOpen(true)}>
								Delete card
							</Button>
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? (
									<>
										<Spinner />
										Saving…
									</>
								) : (
									"Done"
								)}
							</Button>
						</footer>
					</form>
				</DialogContent>
			</Dialog>

			<AlertDialog open={confirmDiscard} onOpenChange={setConfirmDiscard}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Discard changes?</AlertDialogTitle>
						<AlertDialogDescription>Your edits to this card haven&apos;t been saved.</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Keep editing</AlertDialogCancel>
						<AlertDialogAction variant="destructive" onClick={onClose}>
							Discard
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<DeleteCardDialog open={deleteOpen} onOpenChange={setDeleteOpen} boardId={boardId} cardId={card.id} cardTitle={card.title} onDeleted={onClose} />
		</>
	);
}
