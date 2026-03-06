import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { YamoryClient } from "./yamory-client.js";
import type { Config, SearchResult } from "./types.js";
import { filterByScope } from "./scope-filter.js";

const VULN_TYPES = [
  "XSS",
  "RCE",
  "SQLI",
  "SSRF",
  "TRAVERSAL",
  "DOS",
  "CSRF",
  "LFI",
  "RFI",
  "LEAK",
  "CE",
  "BYPASS",
  "AUTHBYPASS",
  "EXPOSURE",
  "PRIVILEGE",
  "XXE",
  "SYMLINK",
  "MITM",
  "MALICIOUS",
] as const;

const vulnSearchSchema = {
  keyword: z
    .string()
    .optional()
    .describe(
      "Search keyword — matches against project name, package name, CVE-ID, etc."
    ),
  triageLevel: z
    .string()
    .optional()
    .describe(
      "Comma-separated triage levels: immediate, delayed, minor, none"
    ),
  status: z
    .string()
    .optional()
    .describe(
      "Comma-separated statuses: open, in_progress, wont_fix_closed, not_vuln_closed, closed"
    ),
  vulnType: z
    .enum(VULN_TYPES)
    .optional()
    .describe("Vulnerability type filter"),
  cvssScore: z
    .string()
    .optional()
    .describe("Minimum CVSS score (0-10.0)"),
  includeKev: z
    .boolean()
    .optional()
    .describe("If true, only CISA KEV vulnerabilities"),
  includePoc: z
    .boolean()
    .optional()
    .describe("If true, only vulnerabilities with PoC"),
  openTimestamp: z
    .string()
    .optional()
    .describe(
      "Detected after this date. Format: YYYY-MM-DD or YYYY-MM-DDThh:mm:ssZ (UTC)"
    ),
  page: z.number().int().min(0).optional().describe("Page number (0-indexed)"),
  size: z
    .number()
    .int()
    .min(1)
    .max(10000)
    .optional()
    .describe("Results per page (default: 100, max: 10000)"),
};

function formatSearchResult<T>(result: SearchResult<T>): string {
  const { items, pagination } = result;
  const summary = `Found ${pagination.totalElements} result(s) (page ${pagination.pageNumber + 1}/${pagination.totalPages || 1}, showing ${items.length})`;
  return JSON.stringify({ summary, items, pagination }, null, 2);
}

export function createServer(deps: {
  yamoryClient: YamoryClient;
  config: Config;
}): McpServer {
  const { yamoryClient, config } = deps;

  const server = new McpServer(
    { name: "yamory-mcp-server", version: "1.0.0" },
    {
     instructions: [
        "You are connected to yamory, a vulnerability management platform.",
        "Default behavior when the user asks about vulnerabilities without specific filters:",
        "- Use triageLevel=immediate,delayed and status=open to focus on actionable vulnerabilities.",
        "- Use search_vulns (unified search) to query app library and container image vulnerabilities in a single call.",
        "- Use search_host_vulns only when the user asks about host or OS-level vulnerabilities.",
        "- Use search_asset_vulns only when the user asks about IT assets (e.g., network devices, appliances).",
        "- Use individual tools (search_app_vulns, search_container_vulns) when the user asks about a specific vulnerability type.",
        "- If the user explicitly specifies filters, respect their request and override the defaults.",
      ].join("\n"),
    }
  );

  server.registerTool(
    "search_vulns",
    {
      description: "Search vulnerabilities across app libraries and container images in a single call. This is the recommended default tool for general vulnerability queries. Returns results grouped by source type. Results are scoped to the configured team.",
      inputSchema: vulnSearchSchema,
    },
    async (params) => {
      const [appResult, imageResult] = await Promise.all([
        yamoryClient.searchAppVulns(params),
        yamoryClient.searchImageVulns(params),
      ]);
      appResult.items = filterByScope(appResult.items, config.teamName);
      imageResult.items = filterByScope(imageResult.items, config.teamName);
      const response = {
        app: {
          summary: `Found ${appResult.pagination.totalElements} app library vulnerability(s)`,
          items: appResult.items,
          pagination: appResult.pagination,
        },
        container: {
          summary: `Found ${imageResult.pagination.totalElements} container image vulnerability(s)`,
          items: imageResult.items,
          pagination: imageResult.pagination,
        },
      };
      return {
        content: [{ type: "text", text: JSON.stringify(response, null, 2) }],
      };
    }
  );

  server.registerTool(
    "search_app_vulns",
    {
      description: "Search app library vulnerabilities detected by yamory. Returns triage level, status, affected package, solution, and CVE information. Results are scoped to the configured team.",
      inputSchema: vulnSearchSchema,
    },
    async (params) => {
      const result = await yamoryClient.searchAppVulns(params);
      result.items = filterByScope(result.items, config.teamName);
      return {
        content: [{ type: "text", text: formatSearchResult(result) }],
      };
    }
  );

  server.registerTool(
    "search_container_vulns",
    {
      description: "Search container image vulnerabilities detected by yamory. Returns triage level, status, affected image/package, solution, and advisory information. Results are scoped to the configured team.",
      inputSchema: {
        ...vulnSearchSchema,
        yamoryTags: z
          .string()
          .optional()
          .describe("Comma-separated management tags"),
      },
    },
    async (params) => {
      const result = await yamoryClient.searchImageVulns(params);
      result.items = filterByScope(result.items, config.teamName);
      return {
        content: [{ type: "text", text: formatSearchResult(result) }],
      };
    }
  );

  server.registerTool(
    "search_asset_vulns",
    {
      description: "Search IT asset vulnerabilities detected by yamory. Returns triage level, status, affected asset/version, CVE-ID, and detail URL. Note: solution/fixedVersion are not available — refer to the yamoryVuln URL for remediation details. Results are scoped to the configured team.",
      inputSchema: vulnSearchSchema,
    },
    async (params) => {
      const result = await yamoryClient.searchAssetVulns(params);
      result.items = filterByScope(result.items, config.teamName);
      return {
        content: [{ type: "text", text: formatSearchResult(result) }],
      };
    }
  );

  server.registerTool(
    "search_host_vulns",
    {
      description: "Search host vulnerabilities detected by yamory. Returns triage level, status, affected host/package, solution, and advisory information. Results are scoped to the configured team.",
      inputSchema: {
        ...vulnSearchSchema,
        yamoryTags: z
          .string()
          .optional()
          .describe("Comma-separated management tags"),
      },
    },
    async (params) => {
      const result = await yamoryClient.searchHostVulns(params);
      result.items = filterByScope(result.items, config.teamName);
      return {
        content: [{ type: "text", text: formatSearchResult(result) }],
      };
    }
  );

  return server;
}
