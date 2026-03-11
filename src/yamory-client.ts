import type { z } from "zod";
import {
  appVulnSchema,
  assetVulnSchema,
  hostVulnSchema,
  imageVulnSchema,
} from "./types.js";
import { logWarn } from "./logger.js";
import type {
  AppVuln,
  AssetVuln,
  HostVuln,
  HostVulnSearchParams,
  ImageVuln,
  ImageVulnSearchParams,
  PaginationInfo,
  SearchResult,
  VulnSearchParams,
} from "./types.js";

const BASE_URL = "https://yamoryapi.yamory.io";
const MAX_ERROR_BODY_LENGTH = 256;
const REQUEST_TIMEOUT_MS = 30_000;
const MAX_RETRIES = 2;
const RETRY_BASE_DELAY_MS = 1_000;

type FetchFn = typeof globalThis.fetch;

export class YamoryClient {
  private readonly apiToken: string;
  private readonly fetchFn: FetchFn;

  constructor(options: { apiToken: string; fetchFn?: FetchFn }) {
    this.apiToken = options.apiToken;
    this.fetchFn = options.fetchFn ?? globalThis.fetch;
  }

  async searchAppVulns(
    params: VulnSearchParams = {}
  ): Promise<SearchResult<AppVuln>> {
    return this.search("/v1/app-vulns", params, appVulnSchema);
  }

  async searchImageVulns(
    params: ImageVulnSearchParams = {}
  ): Promise<SearchResult<ImageVuln>> {
    return this.searchWithTags("/v1/image-vulns", params, imageVulnSchema);
  }

  async searchHostVulns(
    params: HostVulnSearchParams = {}
  ): Promise<SearchResult<HostVuln>> {
    return this.searchWithTags("/v1/host-vulns", params, hostVulnSchema);
  }

  async searchAssetVulns(
    params: VulnSearchParams = {}
  ): Promise<SearchResult<AssetVuln>> {
    return this.search("/v1/asset-vulns", params, assetVulnSchema);
  }

  private async searchWithTags<T>(
    path: string,
    params: ImageVulnSearchParams | HostVulnSearchParams,
    schema: z.ZodType<T>
  ): Promise<SearchResult<T>> {
    const { yamoryTags, ...rest } = params;
    const queryParams: Record<string, string> = this.buildQueryParams(rest);
    if (yamoryTags) queryParams.yamoryTags = yamoryTags;
    return this.fetchWithPagination(this.buildUrl(path, queryParams), schema);
  }

  private async search<T>(
    path: string,
    params: VulnSearchParams,
    schema: z.ZodType<T>
  ): Promise<SearchResult<T>> {
    const queryParams = this.buildQueryParams(params);
    return this.fetchWithPagination(this.buildUrl(path, queryParams), schema);
  }

  private buildQueryParams(params: VulnSearchParams): Record<string, string> {
    const query: Record<string, string> = {};
    if (params.keyword) query.keyword = params.keyword;
    if (params.triageLevel) query.triageLevel = params.triageLevel;
    if (params.status) query.status = params.status;
    if (params.vulnType) query.vulnType = params.vulnType;
    if (params.cvssScore) query.cvssScore = params.cvssScore;
    if (params.includeKev) query.includeKev = "true";
    if (params.includePoc) query.includePoc = "true";
    if (params.openTimestamp) query.openTimestamp = params.openTimestamp;
    if (params.page !== undefined) query.page = String(params.page);
    if (params.size !== undefined) query.size = String(params.size);
    return query;
  }

  private buildUrl(path: string, params: Record<string, string>): string {
    const url = new URL(path, BASE_URL);
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
    return url.toString();
  }

  private async fetchWithRetry(url: string): Promise<Response> {
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      const response = await this.fetchFn(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `token ${this.apiToken}`,
        },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });

      if (response.status !== 429 || attempt === MAX_RETRIES) {
        return response;
      }

      const retryAfter = Number(response.headers.get("retry-after"));
      const delayMs = Number.isFinite(retryAfter) && retryAfter > 0
        ? retryAfter * 1_000
        : RETRY_BASE_DELAY_MS * 2 ** attempt;
      logWarn("rate_limit_retry", { attempt: attempt + 1, delayMs, url });
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    throw new Error("yamory API error: rate limit exceeded after retries");
  }

  private async fetchWithPagination<T>(
    url: string,
    schema: z.ZodType<T>
  ): Promise<SearchResult<T>> {
    const response = await this.fetchWithRetry(url);

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      const sanitizedBody = body.slice(0, MAX_ERROR_BODY_LENGTH);
      const detail = sanitizedBody ? ` - ${sanitizedBody}` : "";
      throw new Error(`yamory API error: ${response.status}${detail}`);
    }

    const json: unknown = await response.json();
    if (!Array.isArray(json)) {
      throw new TypeError("yamory API error: expected array response");
    }
    const items = json.map((item: unknown) => schema.parse(item));

    const pagination: PaginationInfo = {
      pageSize: this.parsePaginationHeader(response, "pageSize"),
      totalElements: this.parsePaginationHeader(response, "totalElements"),
      totalPages: this.parsePaginationHeader(response, "totalPages"),
      pageNumber: this.parsePaginationHeader(response, "pageNumber"),
    };

    return { items, pagination };
  }

  private parsePaginationHeader(response: Response, name: string): number {
    const value = Number(response.headers.get(name) ?? 0);
    return Number.isFinite(value) ? value : 0;
  }
}
