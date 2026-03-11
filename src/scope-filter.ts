import type { SearchResult } from "./types.js";

interface HasTeamName {
  teamName: string;
}

export function filterByScope<T extends HasTeamName>(
  items: T[],
  teamName?: string
): T[] {
  if (!teamName || teamName === "*") return items;
  return items.filter((item) => item.teamName === teamName);
}

export function filterResultByScope<T extends HasTeamName>(
  result: SearchResult<T>,
  teamName?: string
): SearchResult<T> {
  const items = filterByScope(result.items, teamName);
  return {
    items,
    pagination: {
      ...result.pagination,
      totalElements: items.length,
    },
  };
}
