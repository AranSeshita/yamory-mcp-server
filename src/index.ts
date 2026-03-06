#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadConfig } from "./config.js";
import { YamoryClient } from "./yamory-client.js";
import { createServer } from "./server.js";

const config = loadConfig();
const yamoryClient = new YamoryClient({ apiToken: config.apiToken });
const server = createServer({ yamoryClient, config });

const transport = new StdioServerTransport();
await server.connect(transport);
