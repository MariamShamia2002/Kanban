import { Button } from "@/components/ui/button";
import { CreateBoardPopover } from "@/features/board/components/CreateBoardPopover";
import { Loader2 } from "lucide-react";

interface BoardsEmptyStateProps {
  onCreateStarter: () => void;
  isCreatingStarter?: boolean;
}

export function BoardsEmptyState({
  onCreateStarter,
  isCreatingStarter = false,
}: BoardsEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-16 text-center">
      <div className="mb-4 flex size-11 items-center justify-center rounded-lg bg-primary/10">
        <div className="flex items-end gap-0.5">
          <span className="h-3.5 w-1.5 rounded-sm bg-primary/70" />
          <span className="h-5 w-1.5 rounded-sm bg-primary" />
          <span className="h-2.5 w-1.5 rounded-sm bg-primary/50" />
        </div>
      </div>

      <h2 className="text-base font-semibold text-foreground">No boards yet</h2>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
        A board is one project, one workflow, one list of things to finish. Start
        with a blank board or a three-column starter.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <CreateBoardPopover align="center">
          <Button type="button">+ New board</Button>
        </CreateBoardPopover>
        <Button
          type="button"
          variant="outline"
          onClick={onCreateStarter}
          disabled={isCreatingStarter}
        >
          {isCreatingStarter ? (
            <>
              <Loader2 className="animate-spin" />
              Creating…
            </>
          ) : (
            "Use To do / Doing / Done"
          )}
        </Button>
      </div>
    </div>
  );
}
