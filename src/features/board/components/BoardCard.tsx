import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { MoreHorizontal } from "lucide-react";
import { getFieldErrors, getErrorMessage, isApiError } from "@/api/errors";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { DeleteBoardDialog } from "@/features/board/components/DeleteBoardDialog";
import { useDuplicateBoard } from "@/features/board/hooks/useDuplicateBoard";
import { useUpdateBoard } from "@/features/board/hooks/useUpdateBoard";
import { columnBarSegments } from "@/features/board/lib/columnBarSegments";
import { formatRelativeTime } from "@/features/board/lib/formatRelativeTime";
import type { BoardSummary } from "@/features/board/types/board.types";

interface BoardCardProps {
  board: BoardSummary;
}

export function BoardCard({ board }: BoardCardProps) {
  const navigate = useNavigate();
  const duplicateBoard = useDuplicateBoard();
  const updateBoard = useUpdateBoard();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [draftName, setDraftName] = useState(board.name);
  const [renameError, setRenameError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const segments = columnBarSegments(board);

  useEffect(() => {
    if (!isRenaming) return;
    requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
  }, [isRenaming]);

  function openBoard() {
    if (isRenaming) return;
    navigate(`/boards/${board.id}`);
  }

  function startRename() {
    setDraftName(board.name);
    setRenameError(null);
    setIsRenaming(true);
  }

  function cancelRename() {
    setIsRenaming(false);
    setDraftName(board.name);
    setRenameError(null);
  }

  async function commitRename() {
    const name = draftName.trim();
    if (!name) {
      setRenameError("Board name is required");
      return;
    }
    if (name === board.name) {
      cancelRename();
      return;
    }

    try {
      await updateBoard.mutateAsync({ boardId: board.id, name });
      setIsRenaming(false);
      setRenameError(null);
    } catch (err) {
      const fields = getFieldErrors(err);
      if (fields.name) {
        setRenameError(fields.name);
        return;
      }
      setRenameError(
        isApiError(err)
          ? getErrorMessage(err)
          : "Something went wrong. Please try again.",
      );
    }
  }

  return (
    <>
      <article
        role="button"
        tabIndex={isRenaming ? -1 : 0}
        onClick={openBoard}
        onKeyDown={(e) => {
          if (isRenaming) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openBoard();
          }
        }}
        className="group flex cursor-pointer flex-col gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:border-foreground/25 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="flex items-start justify-between gap-2">
          {isRenaming ? (
            <div
              className="min-w-0 flex-1"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              <Input
                ref={inputRef}
                value={draftName}
                disabled={updateBoard.isPending}
                aria-invalid={!!renameError}
                aria-describedby={
                  renameError ? `rename-error-${board.id}` : undefined
                }
                className={
                  renameError
                    ? "h-8 border-destructive focus-visible:ring-destructive/40"
                    : "h-8"
                }
                onChange={(e) => {
                  setDraftName(e.target.value);
                  if (renameError) setRenameError(null);
                }}
                onBlur={() => {
                  void commitRename();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void commitRename();
                  }
                  if (e.key === "Escape") {
                    e.preventDefault();
                    cancelRename();
                  }
                }}
              />
              {renameError && (
                <p
                  id={`rename-error-${board.id}`}
                  role="alert"
                  className="mt-1 text-xs text-destructive"
                >
                  {renameError}
                </p>
              )}
            </div>
          ) : (
            <h2 className="text-sm font-semibold text-foreground leading-snug">
              {board.name}
            </h2>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="shrink-0 text-muted-foreground"
                  aria-label={`Actions for ${board.name}`}
                  onClick={(e) => e.stopPropagation()}
                />
              }
            >
              <MoreHorizontal />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="min-w-40"
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownMenuItem onClick={openBoard}>Open board</DropdownMenuItem>
              <DropdownMenuItem onClick={startRename}>
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={duplicateBoard.isPending}
                onClick={() => {
                  void duplicateBoard.mutateAsync(board.id);
                }}
              >
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setDeleteOpen(true)}
              >
                Delete board
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {segments.length > 0 && (
          <div
            className="flex h-1.5 w-full items-center gap-1.5"
            aria-hidden
          >
            {segments.map((segment) => (
              <span
                key={segment.index}
                className="h-full min-w-1 rounded-full"
                style={{
                  width: `${segment.percent}%`,
                  backgroundColor: segment.color,
                }}
              />
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>
            {board.counts.columns}{" "}
            {board.counts.columns === 1 ? "column" : "columns"} ·{" "}
            {board.counts.cards} {board.counts.cards === 1 ? "card" : "cards"}
          </span>
          <time
            dateTime={board.updatedAt}
            className="font-mono text-[11px] text-muted-foreground/80"
          >
            {formatRelativeTime(board.updatedAt)}
          </time>
        </div>
      </article>

      <DeleteBoardDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        boardId={board.id}
        boardName={board.name}
      />
    </>
  );
}
