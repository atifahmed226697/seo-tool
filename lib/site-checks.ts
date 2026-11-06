export const siteCheckModes = ["redirect", "availability", "hosting", "speed"] as const;
export type SiteCheckMode = typeof siteCheckModes[number];

export interface SiteCheckResult {
  summary: string;
  note?: string;
  entries?: { label: string; value: string }[];
  hops?: { url: string; status: number }[];
}
