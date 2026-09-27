import { Button } from "@/components/ui/button";
import { BoardCard } from "@/features/board/components/BoardCard";
import { BoardsEmptyState } from "@/features/board/components/BoardsEmptyState";
import { BoardsListSkeleton } from "@/features/board/components/BoardsListSkeleton";
import { CreateBoardPopover } from "@/features/board/components/CreateBoardPopover";
import { useBoards } from "@/features/board/hooks/useBoards";
import { useCreateStarterBoard } from "@/features/board/hooks/useCreateStarterBoard";
import { getErrorMessage } from "@/api/errors";

export default function BoardsListPage() {
  const { data: boards, isPending, isError, error, refetch, isFetching } =
    useBoards();
  const createStarter = useCreateStarterBoard();

  const boardCount = boards?.length ?? 0;
  const cardTotal =
    boards?.reduce((sum, board) => sum + board.counts.cards, 0) ?? 0;

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Boards
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isPending
              ? "Loading…"
              : boardCount === 0
                ? "Nothing here yet."
                : `${boardCount} ${boardCount === 1 ? "board" : "boards"} · ${cardTotal} cards total`}
          </p>
        </div>

        <CreateBoardPopover>
          <Button type="button">+ New board</Button>
        </CreateBoardPopover>
      </div>

      {isPending && <BoardsListSkeleton />}

      {isError && (
        <div className="rounded-xl border border-border bg-card px-6 py-10 text-center">
          <p className="text-sm font-medium text-foreground">
            Couldn&apos;t load boards
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {getErrorMessage(error, "Something went wrong. Please try again.")}
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-4"
            onClick={() => void refetch()}
            disabled={isFetching}
          >
            Try again
          </Button>
        </div>
      )}

      {!isPending && !isError && boardCount === 0 && (
        <BoardsEmptyState
          onCreateStarter={() => {
            void createStarter.mutateAsync("Untitled board");
          }}
          isCreatingStarter={createStarter.isPending}
        />
      )}

      {!isPending && !isError && boardCount > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {boards!.map((board) => (
            <BoardCard key={board.id} board={board} />
          ))}

          <CreateBoardPopover align="center">
            <button
              type="button"
              className="flex min-h-[120px] w-full items-center justify-center rounded-xl border border-dashed border-border bg-transparent text-sm font-medium text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
            >
              + New board
            </button>
          </CreateBoardPopover>
        </div>
      )}
    </div>
  );
}
