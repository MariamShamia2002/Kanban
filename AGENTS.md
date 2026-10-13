# Kanban – Project Rules

## Stack
- React 19 + TypeScript, built with Vite
- Tailwind CSS v4, shadcn/ui components (Base UI + Radix primitives), `lucide-react` icons
- TanStack React Query for server state
- React Router v7 (import from `react-router`, not `react-router-dom`)
- Zustand for global client state (e.g. auth)
- react-hook-form + Zod for forms and validation
- @dnd-kit (`core` + `sortable`) for drag and drop — pointer and keyboard sensors, so every drag also works from the keyboard

## Folder Structure
- `src/api/` – shared HTTP client (`client.ts`), error helpers (`errors.ts`), API types
- `src/components/ui/` – shadcn UI primitives
- `src/components/shared/` – app-wide components (e.g. `ProtectedRoute`)
- `src/layout/` – app shell (`AppLayout`, `Header`)
- `src/lib/utils.ts` – `cn()` helper for class names
- `src/router.tsx` – route definitions (`createBrowserRouter`)
- `src/features/<feature>/` – feature code, using only the subfolders it needs:
  - `api/` – API functions (e.g. `boardsApi.ts`)
  - `components/`, `pages/`, `hooks/`
  - `schemas/` – Zod schemas
  - `store/` – Zustand stores
  - `types/` – `*.types.ts` files
  - `lib/` – feature-specific helpers

## TypeScript
- All new files in TypeScript with strict typing
- Prefer `interface` for object shapes; put shared types in the feature's `types/` folder
- Name component props `<ComponentName>Props`

## Components
- Functional components with hooks
- Pages, layouts, and route components use `export default`; everything else uses named exports
- Order inside a component: hooks, derived values, handlers, early returns, JSX
- Move reusable logic into custom hooks

## Styling
- Tailwind classes only; use `cn()` for conditional classes
- Prefer theme tokens (`bg-primary`, `text-muted-foreground`, `border-border`) over arbitrary values
- Build on existing `src/components/ui/` components before creating new ones

## Data Fetching
- All HTTP requests go through `apiClient` in `src/api/client.ts`
- Wrap API functions in React Query hooks in the feature's `hooks/` folder
- Handle loading, error, and empty states
- Use helpers from `src/api/errors.ts` (`isApiError`, `isUnauthorized`, `getFieldErrors`) to map errors to user-friendly messages or form field errors

## Forms
- Use react-hook-form with `zodResolver` and a schema from `schemas/`
- Show field errors with `aria-invalid`, `aria-describedby`, and `role="alert"`

## Imports
Order imports as follows:
1. External libraries
2. Internal absolute imports using `@/`
3. Relative imports

## Naming
- Components: PascalCase (`BoardCard.tsx`)
- Hooks: camelCase with `use` prefix (`useBoards.ts`)
- Utilities / API files: camelCase (`boardsApi.ts`)
- Types files: `<name>.types.ts`
- Constants: UPPER_SNAKE_CASE

## Accessibility
- Semantic HTML, proper labels and ARIA attributes
- Keyboard navigation must work for interactive elements (including drag and drop)

## Quality
- Code must pass `npm run lint` and `npm run build` (type check) with no errors
- Keep functions small and avoid deep JSX nesting
- Never commit secrets; configuration comes from `VITE_*` env variables (e.g. `VITE_API_URL`)

## Commits
- Conventional commits: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
