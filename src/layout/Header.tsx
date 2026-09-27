import { Link } from "react-router";

export function Header() {
  return (
    <header className="mb-15 flex h-13 items-center justify-between bg-white px-6">
      <Link to="/boards" className="flex items-center gap-2">
        <div className="flex size-5.5 shrink-0 items-center justify-center gap-0.5 rounded-sm bg-primary">
          <span className="h-3.5 w-1 bg-white" />
          <span className="h-3.5 w-1 bg-white/50" />
        </div>
        <span className="text-sm font-semibold tracking-tight text-foreground">
          Kanban
        </span>
      </Link>
    </header>
  );
}
