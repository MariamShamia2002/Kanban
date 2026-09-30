import { positionBetween, type Positioned } from "@/lib/position";

/** Gap used past the last item and for the first item of an empty container. */
export const POSITION_STEP = 1000;

/**
 * Position for `activeId` placed at `targetIndex` among `items` (a container's items in order).
 * The active item is ignored when finding neighbours, so it works for reorders and cross-container moves.
 * Always returns a number: a PATCH without `position` would not move within the same container.
 */
export function dropPosition(items: readonly Positioned[], activeId: string, targetIndex: number): number {
  const others = items.filter((item) => item.id !== activeId);
  const before = others[targetIndex - 1];
  const after = others[targetIndex];

  if (!before && !after) return POSITION_STEP;
  return positionBetween(before, after) ?? before.position + POSITION_STEP;
}
