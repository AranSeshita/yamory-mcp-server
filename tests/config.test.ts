import { describe, it, expect } from "vitest";
import { loadConfig } from "../src/config.js";

describe("loadConfig", () => {
  it("returns config when all required variables are set", () => {
    const config = loadConfig({
      YAMORY_API_TOKEN: "test-token",
      YAMORY_TEAM_NAME: "my-team",
    });
    expect(config).toEqual({
      apiToken: "test-token",
      teamName: "my-team",
    });
  });

  it("throws when YAMORY_API_TOKEN is missing", () => {
    expect(() => loadConfig({ YAMORY_TEAM_NAME: "my-team" })).toThrow(
      "YAMORY_API_TOKEN is required"
    );
  });

  it("throws when YAMORY_TEAM_NAME is missing", () => {
    expect(() => loadConfig({ YAMORY_API_TOKEN: "token" })).toThrow(
      "YAMORY_TEAM_NAME is required"
    );
  });

  it("throws when both variables are missing", () => {
    expect(() => loadConfig({})).toThrow("YAMORY_API_TOKEN is required");
  });

  it("accepts '*' as team name for organization-wide access", () => {
    const config = loadConfig({
      YAMORY_API_TOKEN: "token",
      YAMORY_TEAM_NAME: "*",
    });
    expect(config.teamName).toBe("*");
  });
});
