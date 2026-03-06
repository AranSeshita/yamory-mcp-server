import { describe, it, expect } from "vitest";
import { loadConfig } from "../src/config.js";

describe("loadConfig", () => {
  it("returns config with token and team name", () => {
    const config = loadConfig({
      YAMORY_API_TOKEN: "test-token",
      YAMORY_TEAM_NAME: "my-team",
    });
    expect(config).toEqual({
      apiToken: "test-token",
      teamName: "my-team",
    });
  });

  it("returns config with token only (teamName is optional)", () => {
    const config = loadConfig({ YAMORY_API_TOKEN: "token" });
    expect(config).toEqual({
      apiToken: "token",
      teamName: undefined,
    });
  });

  it("throws when YAMORY_API_TOKEN is missing", () => {
    expect(() => loadConfig({})).toThrow("YAMORY_API_TOKEN is required");
  });

  it("accepts '*' as team name for organization-wide access", () => {
    const config = loadConfig({
      YAMORY_API_TOKEN: "token",
      YAMORY_TEAM_NAME: "*",
    });
    expect(config.teamName).toBe("*");
  });

  it("treats empty string YAMORY_TEAM_NAME as undefined", () => {
    const config = loadConfig({
      YAMORY_API_TOKEN: "token",
      YAMORY_TEAM_NAME: "",
    });
    expect(config.teamName).toBeUndefined();
  });
});
