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
    return this.search<AppVuln>("/v1/app-vulns", params);
  }

  async searchImageVulns(
    params: ImageVulnSearchParams = {}
  ): Promise<SearchResult<ImageVuln>> {
    return this.searchWithTags<ImageVuln>("/v1/image-vulns", params);
  }

  async searchHostVulns(
    params: HostVulnSearchParams = {}
  ): Promise<SearchResult<HostVuln>> {
    return this.searchWithTags<HostVuln>("/v1/host-vulns", params);
  }

  async searchAssetVulns(
    params: VulnSearchParams = {}
  ): Promise<SearchResult<AssetVuln>> {
    return this.search<AssetVuln>("/v1/asset-vulns", params);
  }

  private async searchWithTags<T>(
    path: string,
    params: ImageVulnSearchParams | HostVulnSearchParams
  ): Promise<SearchResult<T>> {
    const { yamoryTags, ...rest } = params;
    const queryParams: Record<string, string> = this.buildQueryParams(rest);
    if (yamoryTags) queryParams.yamoryTags = yamoryTags;
    return this.fetchWithPagination<T>(this.buildUrl(path, queryParams));
  }

  private async search<T>(
    path: string,
    params: VulnSearchParams
  ): Promise<SearchResult<T>> {
    const queryParams = this.buildQueryParams(params);
    return this.fetchWithPagination<T>(this.buildUrl(path, queryParams));
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

  private async fetchWithPagination<T>(url: string): Promise<SearchResult<T>> {
    const response = await this.fetchFn(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `token ${this.apiToken}`,
      },
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(
        `yamory API error: ${response.status} ${response.statusText}${body ? ` - ${body}` : ""}`
      );
    }

    const items: T[] = await response.json();
    const pagination: PaginationInfo = {
      pageSize: Number(response.headers.get("pageSize") ?? 0),
      totalElements: Number(response.headers.get("totalElements") ?? 0),
      totalPages: Number(response.headers.get("totalPages") ?? 0),
      pageNumber: Number(response.headers.get("pageNumber") ?? 0),
    };

    return { items, pagination };
  }
}
