import type { Config } from "./types.js";

export function loadConfig(
  env: Record<string, string | undefined> = process.env
): Config {
  const apiToken = env.YAMORY_API_TOKEN?.trim();
  if (!apiToken) {
    throw new Error(
      "YAMORY_API_TOKEN is required. Generate one from yamory team settings with 'API サーバー' scope."
    );
  }
  if (apiToken.includes(" ")) {
    throw new Error(
      "YAMORY_API_TOKEN contains spaces. Check that the token was copied correctly."
    );
  }

  const teamName = env.YAMORY_TEAM_NAME || undefined;

  return { apiToken, teamName };
}
