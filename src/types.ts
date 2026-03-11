import { z } from "zod";

export const appVulnSchema = z.object({
  id: z.string(),
  triageLevel: z.string(),
  status: z.string(),
  vulnTypes: z.string(),
  teamName: z.string(),
  projectGroupKey: z.string(),
  projectName: z.string(),
  packageName: z.string(),
  openSystem: z.boolean(),
  hasPoc: z.boolean(),
  isKev: z.boolean(),
  referenceId: z.string(),
  solution: z.string(),
  scanTimestamp: z.string(),
  openTimestamp: z.string(),
  fixStartTimestamp: z.string().nullable(),
  closedTimestamp: z.string().nullable(),
  yamoryVuln: z.string(),
});
export type AppVuln = z.infer<typeof appVulnSchema>;

export const imageVulnSchema = z.object({
  id: z.string(),
  triageLevel: z.string(),
  status: z.string(),
  vulnTypes: z.string(),
  teamName: z.string(),
  osFamilyAndVer: z.string(),
  family: z.string(),
  imageTitle: z.string(),
  imageName: z.string(),
  packageNameAndVer: z.string(),
  imageTags: z.array(z.string()),
  openSystem: z.boolean(),
  hasPoc: z.boolean(),
  isKev: z.boolean(),
  solution: z.string(),
  ovalTitle: z.string(),
  advisorySeverity: z.string().nullable(),
  definitionId: z.string(),
  fixedVersion: z.string(),
  firstScanDateTime: z.string(),
  scanTimestamp: z.string(),
  openTimestamp: z.string(),
  closedTimestamp: z.string().nullable(),
  yamoryVuln: z.string(),
});
export type ImageVuln = z.infer<typeof imageVulnSchema>;

export const hostVulnSchema = z.object({
  id: z.string(),
  triageLevel: z.string(),
  status: z.string(),
  vulnTypes: z.string(),
  teamName: z.string(),
  hostTitle: z.string(),
  hostName: z.string(),
  hostIps: z.array(z.string()),
  hostTags: z.array(z.string()),
  family: z.string(),
  osFamilyAndVer: z.string(),
  packageNameAndVer: z.string(),
  openSystem: z.boolean(),
  hasPoc: z.boolean(),
  isKev: z.boolean(),
  solution: z.string(),
  fixedVersion: z.string(),
  ovalTitle: z.string(),
  advisorySeverity: z.string().nullable(),
  definitionId: z.string(),
  scanTimestamp: z.string(),
  openTimestamp: z.string(),
  closedTimestamp: z.string().nullable(),
  yamoryVuln: z.string(),
});
export type HostVuln = z.infer<typeof hostVulnSchema>;

export const assetVulnSchema = z.object({
  id: z.string(),
  triageLevel: z.string(),
  status: z.string(),
  vulnTypes: z.string(),
  teamName: z.string(),
  projectName: z.string(),
  assetName: z.string(),
  version: z.string(),
  referenceId: z.string(),
  assetIdentifier: z.string(),
  openSystem: z.boolean(),
  hasPoc: z.boolean(),
  isKev: z.boolean(),
  openTimestamp: z.string(),
  closedTimestamp: z.string().nullable(),
  scanTimestamp: z.string(),
  yamoryVuln: z.string(),
});
export type AssetVuln = z.infer<typeof assetVulnSchema>;

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

export interface HostVulnSearchParams extends VulnSearchParams {
  yamoryTags?: string;
}

export interface Config {
  apiToken: string;
  teamName?: string;
}
