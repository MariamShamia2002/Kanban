import { Link, useMatch } from "react-router";
import { BoardSwitcher } from "@/features/board/components/BoardSwitcher";

export function Header() {
  const boardMatch = useMatch("/boards/:boardId");
  const boardId = boardMatch?.params.boardId;

  return (
    <header className="mb-15 flex h-13 items-center justify-between bg-white px-6">
      <div className="flex min-w-0 items-center gap-2">
        <Link to="/boards" className="flex items-center gap-2">
          <div className="flex size-5.5 shrink-0 items-center justify-center gap-0.5 rounded-sm bg-primary">
            <span className="h-3.5 w-1 bg-white" />
            <span className="h-3.5 w-1 bg-white/50" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-foreground">
            Kanban
          </span>
        </Link>

        {boardId && (
          <>
            <span className="text-muted-foreground/50" aria-hidden>
              /
            </span>
            <BoardSwitcher boardId={boardId} />
          </>
        )}
      </div>
    </header>
  );
}
