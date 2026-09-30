const DAY_MS = 24 * 60 * 60 * 1000;


// Due dates are calendar days. Only the `YYYY-MM-DD` part is read so an ISO timestamp
// like `2026-09-15T00:00:00.000Z` doesn't shift a day in timezones behind UTC.

export function toDateInputValue(dueDate: string | null): string {
	return dueDate ? dueDate.slice(0, 10) : "";
}

function toLocalDate(dueDate: string): Date {
	const [year, month, day] = toDateInputValue(dueDate).split("-").map(Number);
	return new Date(year, month - 1, day);
}

function startOfToday(): Date {
	const now = new Date();
	return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/** Whole days until the due date: 0 today, negative when overdue. */
export function daysUntilDue(dueDate: string): number {
	return Math.round((toLocalDate(dueDate).getTime() - startOfToday().getTime()) / DAY_MS);
}

export function isOverdue(dueDate: string | null): boolean {
	return dueDate !== null && daysUntilDue(dueDate) < 0;
}

export function daysOverdue(dueDate: string): number {
	return Math.max(0, -daysUntilDue(dueDate));
}

/** e.g. "sep 15" */
export function formatShortDate(dueDate: string): string {
	return toLocalDate(dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }).toLowerCase();
}
