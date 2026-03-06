import type { Config } from "./types.js";

export function loadConfig(
  env: Record<string, string | undefined> = process.env
): Config {
  const apiToken = env.YAMORY_API_TOKEN;
  if (!apiToken) {
    throw new Error(
      "YAMORY_API_TOKEN is required. Generate one from yamory team settings with 'API サーバー' scope."
    );
  }

  const teamName = env.YAMORY_TEAM_NAME;
  if (!teamName) {
    throw new Error(
      "YAMORY_TEAM_NAME is required. Set the target team name or '*' for organization-wide access."
    );
  }

  return { apiToken, teamName };
}
