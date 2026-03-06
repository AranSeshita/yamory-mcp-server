import { describe, it, expect, vi } from "vitest";
import { YamoryClient } from "../src/yamory-client.js";

function createMockFetch(body: unknown, headers?: Record<string, string>) {
  const responseHeaders = new Headers({
    pageSize: "100",
    totalElements: "2",
    totalPages: "1",
    pageNumber: "0",
    ...headers,
  });
  return vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: () => Promise.resolve(body),
    headers: responseHeaders,
  } as unknown as Response);
}

function createErrorFetch(status: number, statusText: string) {
  return vi.fn().mockResolvedValue({
    ok: false,
    status,
    statusText,
    text: () => Promise.resolve("error body"),
  } as unknown as Response);
}

describe("YamoryClient", () => {
  describe("searchAppVulns", () => {
    it("sends correct request with no params", async () => {
      const mockFetch = createMockFetch([]);
      const client = new YamoryClient({
        apiToken: "test-token",
        fetchFn: mockFetch,
      });

      await client.searchAppVulns();

      expect(mockFetch).toHaveBeenCalledWith(
        "https://yamoryapi.yamory.io/v1/app-vulns",
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: "token test-token",
          },
        }
      );
    });

    it("builds query params correctly", async () => {
      const mockFetch = createMockFetch([]);
      const client = new YamoryClient({
        apiToken: "tok",
        fetchFn: mockFetch,
      });

      await client.searchAppVulns({
        keyword: "log4j",
        triageLevel: "immediate",
        status: "open,in_progress",
        includeKev: true,
        page: 0,
        size: 50,
      });

      const url = new URL(mockFetch.mock.calls[0][0]);
      expect(url.searchParams.get("keyword")).toBe("log4j");
      expect(url.searchParams.get("triageLevel")).toBe("immediate");
      expect(url.searchParams.get("status")).toBe("open,in_progress");
      expect(url.searchParams.get("includeKev")).toBe("true");
      expect(url.searchParams.get("page")).toBe("0");
      expect(url.searchParams.get("size")).toBe("50");
    });

    it("parses pagination from response headers", async () => {
      const mockFetch = createMockFetch([{ id: "1" }], {
        totalElements: "42",
        totalPages: "5",
        pageNumber: "2",
        pageSize: "10",
      });
      const client = new YamoryClient({
        apiToken: "tok",
        fetchFn: mockFetch,
      });

      const result = await client.searchAppVulns();

      expect(result.pagination).toEqual({
        totalElements: 42,
        totalPages: 5,
        pageNumber: 2,
        pageSize: 10,
      });
      expect(result.items).toEqual([{ id: "1" }]);
    });

    it("throws on API error", async () => {
      const mockFetch = createErrorFetch(401, "Unauthorized");
      const client = new YamoryClient({
        apiToken: "bad",
        fetchFn: mockFetch,
      });

      await expect(client.searchAppVulns()).rejects.toThrow(
        "yamory API error: 401 Unauthorized - error body"
      );
    });
  });

  describe("searchImageVulns", () => {
    it("sends request to image-vulns endpoint", async () => {
      const mockFetch = createMockFetch([]);
      const client = new YamoryClient({
        apiToken: "tok",
        fetchFn: mockFetch,
      });

      await client.searchImageVulns({ keyword: "debian" });

      const url = new URL(mockFetch.mock.calls[0][0]);
      expect(url.pathname).toBe("/v1/image-vulns");
      expect(url.searchParams.get("keyword")).toBe("debian");
    });

    it("includes yamoryTags param", async () => {
      const mockFetch = createMockFetch([]);
      const client = new YamoryClient({
        apiToken: "tok",
        fetchFn: mockFetch,
      });

      await client.searchImageVulns({ yamoryTags: "prod,staging" });

      const url = new URL(mockFetch.mock.calls[0][0]);
      expect(url.searchParams.get("yamoryTags")).toBe("prod,staging");
    });
  });

  describe("searchHostVulns", () => {
    it("sends request to host-vulns endpoint", async () => {
      const mockFetch = createMockFetch([]);
      const client = new YamoryClient({
        apiToken: "tok",
        fetchFn: mockFetch,
      });

      await client.searchHostVulns({ keyword: "openssl" });

      const url = new URL(mockFetch.mock.calls[0][0]);
      expect(url.pathname).toBe("/v1/host-vulns");
      expect(url.searchParams.get("keyword")).toBe("openssl");
    });

    it("includes yamoryTags param", async () => {
      const mockFetch = createMockFetch([]);
      const client = new YamoryClient({
        apiToken: "tok",
        fetchFn: mockFetch,
      });

      await client.searchHostVulns({ yamoryTags: "production" });

      const url = new URL(mockFetch.mock.calls[0][0]);
      expect(url.searchParams.get("yamoryTags")).toBe("production");
    });
  });
});
