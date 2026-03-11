#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadConfig } from "./config.js";
import { YamoryClient } from "./yamory-client.js";
import { createServer } from "./server.js";
import { logInfo } from "./logger.js";

const config = loadConfig();
const yamoryClient = new YamoryClient({ apiToken: config.apiToken });
const server = createServer({ yamoryClient, config });

logInfo("server_start", {
  teamName: config.teamName ?? "(not set)",
});

const transport = new StdioServerTransport();
await server.connect(transport);
