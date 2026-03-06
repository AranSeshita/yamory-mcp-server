import { describe, it, expect } from "vitest";
import { filterByScope } from "../src/scope-filter.js";

const items = [
  { teamName: "Team A", id: "1" },
  { teamName: "Team B", id: "2" },
  { teamName: "Team A", id: "3" },
  { teamName: "Team C", id: "4" },
];

describe("filterByScope", () => {
  it("returns all items when teamName is '*'", () => {
    expect(filterByScope(items, "*")).toEqual(items);
  });

  it("filters items by exact teamName match", () => {
    const result = filterByScope(items, "Team A");
    expect(result).toEqual([
      { teamName: "Team A", id: "1" },
      { teamName: "Team A", id: "3" },
    ]);
  });

  it("returns empty array when no items match", () => {
    expect(filterByScope(items, "Unknown Team")).toEqual([]);
  });

  it("handles empty items array", () => {
    expect(filterByScope([], "Team A")).toEqual([]);
  });
});
