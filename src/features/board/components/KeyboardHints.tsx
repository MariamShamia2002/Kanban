const HINTS = [
	["Tab", "focus a card"],
	["Space", "pick up"],
	["← ↑ ↓ →", "move"],
	["Enter", "drop"],
	["Esc", "cancel"],
	["Enter on card", "opens detail"],
] as const;

/** Keyboard shortcuts for the board, pinned to the bottom of the viewport. */
export function KeyboardHints() {
	return (
		<footer className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-background/90 px-6 py-2 backdrop-blur-sm">
			<ul aria-label="Keyboard shortcuts" className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] text-muted-foreground">
				{HINTS.map(([keys, action], index) => (
					<li key={keys} className="flex items-center gap-2">
						{index > 0 && <span aria-hidden>·</span>}
						<span>
							<kbd className="font-mono text-foreground/70">{keys}</kbd> {action}
						</span>
					</li>
				))}
			</ul>
		</footer>
	);
}
