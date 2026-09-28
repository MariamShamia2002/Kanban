import { ChevronDown } from "lucide-react";
import { useNavigate } from "react-router";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useBoard } from "@/features/board/hooks/useBoard";
import { useBoards } from "@/features/board/hooks/useBoards";
import { colorForBar } from "@/features/board/lib/barColors";
import { cn } from "@/lib/utils";

interface BoardSwitcherProps {
	boardId: string;
}

export function BoardSwitcher({ boardId }: BoardSwitcherProps) {
	const navigate = useNavigate();
	const { data: boards } = useBoards();
	const { data: board } = useBoard(boardId);
	const currentName = board?.name ?? boards?.find((b) => b.id === boardId)?.name ?? "Board";

	return (
		<DropdownMenu>
			<DropdownMenuTrigger className="flex items-center gap-1 rounded-md px-2 py-1 text-sm font-semibold text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring data-popup-open:bg-muted">
				<span className="max-w-60 truncate">{currentName}</span>
				<ChevronDown className="size-3.5 text-muted-foreground" aria-hidden />
			</DropdownMenuTrigger>

			<DropdownMenuContent align="start" sideOffset={6} className="w-64 p-1.5">
				<DropdownMenuGroup>
					<DropdownMenuLabel className="px-2 pt-1.5 pb-1 text-[11px] font-semibold tracking-wider uppercase">Switch board</DropdownMenuLabel>
					{boards?.map((item, index) => {
						const isCurrent = item.id === boardId;
						return (
							<DropdownMenuItem
								key={item.id}
								aria-current={isCurrent ? "page" : undefined}
								onClick={() => {
									if (!isCurrent) navigate(`/boards/${item.id}`);
								}}
								className={cn("gap-2.5 px-2 py-1.5", isCurrent && "bg-muted font-medium")}>
								<span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: colorForBar(index) }} aria-hidden />
								<span className="min-w-0 flex-1 truncate">{item.name}</span>
								<span className="font-mono text-[11px] text-muted-foreground">{item.counts.cards}</span>
							</DropdownMenuItem>
						);
					})}
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={() => navigate("/boards")} className="px-2 py-1.5 font-medium text-primary">
					All boards →
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
