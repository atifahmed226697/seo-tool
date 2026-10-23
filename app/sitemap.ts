import { MetadataRoute } from "next";
import { tools } from "@/lib/tools";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://seotoolkit.local";
  const now = new Date();

  // Root homepage entry
  const homeEntry = {
    url: baseUrl,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 1.0,
  };

  // Dynamic tool entries from single source of truth (lib/tools.ts)
  const toolEntries = tools.map((tool) => ({
    url: `${baseUrl}/tools/${tool.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [homeEntry, ...toolEntries];
}
