interface HasTeamName {
  teamName: string;
}

export function filterByScope<T extends HasTeamName>(
  items: T[],
  teamName: string
): T[] {
  if (teamName === "*") return items;
  return items.filter((item) => item.teamName === teamName);
}
