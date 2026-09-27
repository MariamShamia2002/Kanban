/** Fixed mix — pick randomly (stable) per column bar */
export const BAR_COLORS = [
  "#E07A5F", 
  "#81B29A", 
  "#F2CC8F", 
  "#3D405B", 
  "#9B8AA6", 
  "#7EB8DA", 
  "#D4A373",
  "#6A994E",
] as const;

/** Stable color for a bar so it doesn't flicker on re-render. */
export function colorForBar(index: number): string {
  const colorIndex = index % BAR_COLORS.length;
  return BAR_COLORS[colorIndex];
}
