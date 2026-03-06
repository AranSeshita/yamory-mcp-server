export interface AppVuln {
  id: string;
  triageLevel: string;
  status: string;
  vulnTypes: string;
  teamName: string;
  projectGroupKey: string;
  projectName: string;
  packageName: string;
  openSystem: boolean;
  hasPoc: boolean;
  isKev: boolean;
  referenceId: string;
  solution: string;
  scanTimestamp: string;
  openTimestamp: string;
  fixStartTimestamp: string | null;
  closedTimestamp: string | null;
  yamoryVuln: string;
}

export interface ImageVuln {
  id: string;
  triageLevel: string;
  status: string;
  vulnTypes: string;
  teamName: string;
  osFamilyAndVer: string;
  family: string;
  imageTitle: string;
  imageName: string;
  packageNameAndVer: string;
  imageTags: string[];
  openSystem: boolean;
  hasPoc: boolean;
  isKev: boolean;
  solution: string;
  ovalTitle: string;
  advisorySeverity: string | null;
  definitionId: string;
  fixedVersion: string;
  firstScanDateTime: string;
  scanTimestamp: string;
  openTimestamp: string;
  closedTimestamp: string | null;
  yamoryVuln: string;
}

export interface PaginationInfo {
  pageSize: number;
  totalElements: number;
  totalPages: number;
  pageNumber: number;
}

export interface SearchResult<T> {
  items: T[];
  pagination: PaginationInfo;
}

export interface VulnSearchParams {
  keyword?: string;
  triageLevel?: string;
  status?: string;
  vulnType?: string;
  cvssScore?: string;
  includeKev?: boolean;
  includePoc?: boolean;
  openTimestamp?: string;
  page?: number;
  size?: number;
}

export interface ImageVulnSearchParams extends VulnSearchParams {
  yamoryTags?: string;
}

export interface Config {
  apiToken: string;
  teamName: string;
}
