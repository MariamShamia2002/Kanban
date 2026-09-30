export interface Positioned {
  id: string;
  position: number;
}

/** `meta` returned by column/card PATCH. When `normalized`, every cached position in that container is stale. */
export interface PositionsMeta {
  normalized: boolean;
  positions?: Positioned[];
}

export function sortByPosition<T extends Positioned>(items: readonly T[]): T[] {
  return [...items].sort((a, b) => a.position - b.position);
}

/**
 * Position for an item dropped between two neighbours.
 * Returns `undefined` for "drop at the end" — omit `position` and the server appends.
 */
export function positionBetween(before?: Positioned, after?: Positioned): number | undefined {
  if (!after) return undefined;
  if (!before) return after.position / 2;
  return (before.position + after.position) / 2;
}

/** Applies server-normalized positions to a container's items; returns them unchanged otherwise. */
export function applyPositions<T extends Positioned>(items: readonly T[], meta?: PositionsMeta): T[] {
  if (!meta?.normalized || !meta.positions) return [...items];

  const next = new Map(meta.positions.map((p) => [p.id, p.position]));
  return sortByPosition(items.map((item) => (next.has(item.id) ? { ...item, position: next.get(item.id)! } : item)));
}
