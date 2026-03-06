import { describe, it, expect, vi } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createServer } from "../src/server.js";
import type { YamoryClient } from "../src/yamory-client.js";
import type { AppVuln, ImageVuln } from "../src/types.js";

function createMockClient(overrides?: Partial<YamoryClient>): YamoryClient {
  return {
    searchAppVulns: vi.fn().mockResolvedValue({
      items: [],
      pagination: {
        pageSize: 100,
        totalElements: 0,
        totalPages: 0,
        pageNumber: 0,
      },
    }),
    searchImageVulns: vi.fn().mockResolvedValue({
      items: [],
      pagination: {
        pageSize: 100,
        totalElements: 0,
        totalPages: 0,
        pageNumber: 0,
      },
    }),
    searchAssetVulns: vi.fn().mockResolvedValue({
      items: [],
      pagination: {
        pageSize: 100,
        totalElements: 0,
        totalPages: 0,
        pageNumber: 0,
      },
    }),
    searchHostVulns: vi.fn().mockResolvedValue({
      items: [],
      pagination: {
        pageSize: 100,
        totalElements: 0,
        totalPages: 0,
        pageNumber: 0,
      },
    }),
    ...overrides,
  } as YamoryClient;
}

async function setupTestServer(
  yamoryClient: YamoryClient,
  teamName = "TestTeam"
) {
  const server = createServer({
    yamoryClient,
    config: { apiToken: "test", teamName },
  });

  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: "test-client", version: "1.0.0" });

  await server.connect(serverTransport);
  await client.connect(clientTransport);

  return { client, server };
}

describe("MCP Server", () => {
  describe("tool listing", () => {
    it("exposes all five vulnerability search tools", async () => {
      const { client } = await setupTestServer(createMockClient());
      const { tools } = await client.listTools();
      const names = tools.map((t) => t.name);
      expect(names).toContain("search_vulns");
      expect(names).toContain("search_app_vulns");
      expect(names).toContain("search_container_vulns");
      expect(names).toContain("search_asset_vulns");
      expect(names).toContain("search_host_vulns");
    });
  });

  describe("search_vulns", () => {
    it("calls both searchAppVulns and searchImageVulns", async () => {
      const searchAppVulns = vi.fn().mockResolvedValue({
        items: [{ id: "app-1", teamName: "TestTeam" }],
        pagination: { pageSize: 100, totalElements: 1, totalPages: 1, pageNumber: 0 },
      });
      const searchImageVulns = vi.fn().mockResolvedValue({
        items: [{ id: "img-1", teamName: "TestTeam" }],
        pagination: { pageSize: 100, totalElements: 1, totalPages: 1, pageNumber: 0 },
      });
      const mockYamory = createMockClient({ searchAppVulns, searchImageVulns });

      const { client } = await setupTestServer(mockYamory);
      const result = await client.callTool({
        name: "search_vulns",
        arguments: { keyword: "log4j", status: "open" },
      });

      expect(searchAppVulns).toHaveBeenCalledWith(
        expect.objectContaining({ keyword: "log4j", status: "open" })
      );
      expect(searchImageVulns).toHaveBeenCalledWith(
        expect.objectContaining({ keyword: "log4j", status: "open" })
      );

      const content = result.content as Array<{ type: string; text: string }>;
      const parsed = JSON.parse(content[0].text);
      expect(parsed.app.items).toHaveLength(1);
      expect(parsed.container.items).toHaveLength(1);
    });

    it("filters both result sets by team scope", async () => {
      const searchAppVulns = vi.fn().mockResolvedValue({
        items: [
          { id: "1", teamName: "TestTeam" },
          { id: "2", teamName: "OtherTeam" },
        ],
        pagination: { pageSize: 100, totalElements: 2, totalPages: 1, pageNumber: 0 },
      });
      const searchImageVulns = vi.fn().mockResolvedValue({
        items: [
          { id: "3", teamName: "OtherTeam" },
        ],
        pagination: { pageSize: 100, totalElements: 1, totalPages: 1, pageNumber: 0 },
      });
      const mockYamory = createMockClient({ searchAppVulns, searchImageVulns });

      const { client } = await setupTestServer(mockYamory, "TestTeam");
      const result = await client.callTool({
        name: "search_vulns",
        arguments: {},
      });

      const content = result.content as Array<{ type: string; text: string }>;
      const parsed = JSON.parse(content[0].text);
      expect(parsed.app.items).toHaveLength(1);
      expect(parsed.container.items).toHaveLength(0);
    });
  });

  describe("search_app_vulns", () => {
    it("returns filtered results scoped to team", async () => {
      const appVulns: AppVuln[] = [
        {
          id: "1",
          triageLevel: "IMMEDIATE",
          status: "OPEN",
          vulnTypes: "RCE",
          teamName: "TestTeam",
          projectGroupKey: "proj1",
          projectName: "app",
          packageName: "log4j-core-2.14.0",
          openSystem: true,
          hasPoc: true,
          isKev: true,
          referenceId: "CVE-2021-44228",
          solution: "Upgrade to 2.15.0",
          scanTimestamp: "2023-01-01T00:00:00Z",
          openTimestamp: "2023-01-01T00:00:00Z",
          fixStartTimestamp: null,
          closedTimestamp: null,
          yamoryVuln: "https://yamoryapi.yamory.io/v1/app-yamoryVulns/123",
        },
        {
          id: "2",
          triageLevel: "MINOR",
          status: "OPEN",
          vulnTypes: "",
          teamName: "OtherTeam",
          projectGroupKey: "proj2",
          projectName: "app2",
          packageName: "some-pkg-1.0.0",
          openSystem: false,
          hasPoc: false,
          isKev: false,
          referenceId: "CVE-2023-99999",
          solution: "Upgrade",
          scanTimestamp: "2023-01-01T00:00:00Z",
          openTimestamp: "2023-01-01T00:00:00Z",
          fixStartTimestamp: null,
          closedTimestamp: null,
          yamoryVuln: "https://yamoryapi.yamory.io/v1/app-yamoryVulns/456",
        },
      ];

      const mockYamory = createMockClient({
        searchAppVulns: vi.fn().mockResolvedValue({
          items: appVulns,
          pagination: {
            pageSize: 100,
            totalElements: 2,
            totalPages: 1,
            pageNumber: 0,
          },
        }),
      });

      const { client } = await setupTestServer(mockYamory, "TestTeam");
      const result = await client.callTool({
        name: "search_app_vulns",
        arguments: { keyword: "log4j" },
      });

      const content = result.content as Array<{ type: string; text: string }>;
      const parsed = JSON.parse(content[0].text);

      // OtherTeam's vuln should be filtered out
      expect(parsed.items).toHaveLength(1);
      expect(parsed.items[0].referenceId).toBe("CVE-2021-44228");
    });

    it("returns all results when team is '*'", async () => {
      const mockYamory = createMockClient({
        searchAppVulns: vi.fn().mockResolvedValue({
          items: [
            { teamName: "A", id: "1" },
            { teamName: "B", id: "2" },
          ],
          pagination: {
            pageSize: 100,
            totalElements: 2,
            totalPages: 1,
            pageNumber: 0,
          },
        }),
      });

      const { client } = await setupTestServer(mockYamory, "*");
      const result = await client.callTool({
        name: "search_app_vulns",
        arguments: {},
      });

      const content = result.content as Array<{ type: string; text: string }>;
      const parsed = JSON.parse(content[0].text);
      expect(parsed.items).toHaveLength(2);
    });
  });

  describe("search_container_vulns", () => {
    it("calls searchImageVulns with params", async () => {
      const searchImageVulns = vi.fn().mockResolvedValue({
        items: [] as ImageVuln[],
        pagination: {
          pageSize: 100,
          totalElements: 0,
          totalPages: 0,
          pageNumber: 0,
        },
      });
      const mockYamory = createMockClient({ searchImageVulns });

      const { client } = await setupTestServer(mockYamory);
      await client.callTool({
        name: "search_container_vulns",
        arguments: { keyword: "debian", yamoryTags: "prod" },
      });

      expect(searchImageVulns).toHaveBeenCalledWith(
        expect.objectContaining({
          keyword: "debian",
          yamoryTags: "prod",
        })
      );
    });
  });

  describe("search_asset_vulns", () => {
    it("calls searchAssetVulns with params", async () => {
      const searchAssetVulns = vi.fn().mockResolvedValue({
        items: [],
        pagination: {
          pageSize: 100,
          totalElements: 0,
          totalPages: 0,
          pageNumber: 0,
        },
      });
      const mockYamory = createMockClient({ searchAssetVulns });

      const { client } = await setupTestServer(mockYamory);
      await client.callTool({
        name: "search_asset_vulns",
        arguments: { keyword: "FortiGate" },
      });

      expect(searchAssetVulns).toHaveBeenCalledWith(
        expect.objectContaining({ keyword: "FortiGate" })
      );
    });

    it("filters results by team scope", async () => {
      const searchAssetVulns = vi.fn().mockResolvedValue({
        items: [
          { id: "1", teamName: "TestTeam", assetName: "FortiGate 300E" },
          { id: "2", teamName: "OtherTeam", assetName: "Cisco ASA" },
        ],
        pagination: {
          pageSize: 100,
          totalElements: 2,
          totalPages: 1,
          pageNumber: 0,
        },
      });
      const mockYamory = createMockClient({ searchAssetVulns });

      const { client } = await setupTestServer(mockYamory, "TestTeam");
      const result = await client.callTool({
        name: "search_asset_vulns",
        arguments: {},
      });

      const content = result.content as Array<{ type: string; text: string }>;
      const parsed = JSON.parse(content[0].text);
      expect(parsed.items).toHaveLength(1);
      expect(parsed.items[0].assetName).toBe("FortiGate 300E");
    });
  });

  describe("search_host_vulns", () => {
    it("calls searchHostVulns with params", async () => {
      const searchHostVulns = vi.fn().mockResolvedValue({
        items: [],
        pagination: {
          pageSize: 100,
          totalElements: 0,
          totalPages: 0,
          pageNumber: 0,
        },
      });
      const mockYamory = createMockClient({ searchHostVulns });

      const { client } = await setupTestServer(mockYamory);
      await client.callTool({
        name: "search_host_vulns",
        arguments: { keyword: "openssl", yamoryTags: "production" },
      });

      expect(searchHostVulns).toHaveBeenCalledWith(
        expect.objectContaining({
          keyword: "openssl",
          yamoryTags: "production",
        })
      );
    });

    it("filters results by team scope", async () => {
      const searchHostVulns = vi.fn().mockResolvedValue({
        items: [
          { id: "1", teamName: "TestTeam", hostName: "host-a" },
          { id: "2", teamName: "OtherTeam", hostName: "host-b" },
        ],
        pagination: {
          pageSize: 100,
          totalElements: 2,
          totalPages: 1,
          pageNumber: 0,
        },
      });
      const mockYamory = createMockClient({ searchHostVulns });

      const { client } = await setupTestServer(mockYamory, "TestTeam");
      const result = await client.callTool({
        name: "search_host_vulns",
        arguments: {},
      });

      const content = result.content as Array<{ type: string; text: string }>;
      const parsed = JSON.parse(content[0].text);
      expect(parsed.items).toHaveLength(1);
      expect(parsed.items[0].hostName).toBe("host-a");
    });
  });
});
