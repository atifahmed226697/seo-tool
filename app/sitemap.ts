import type { MetadataRoute } from "next";
import { tools } from "@/lib/tools";
import { getAllPosts } from "@/lib/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = (
    process.env.NEXT_PUBLIC_SITE_URL || "https://seotoolkit.local"
  ).replace(/\/+$/, "");

  const now = new Date();

  const homeEntry: MetadataRoute.Sitemap[number] = {
    url: baseUrl,
    lastModified: now,
    changeFrequency: "daily",
    priority: 1,
  };

  const blogEntry: MetadataRoute.Sitemap[number] = {
    url: `${baseUrl}/blog`,
    changeFrequency: "weekly",
    priority: 0.7,
  };

  const toolEntries: MetadataRoute.Sitemap = tools
    .filter((tool) => tool.status === "ready")
    .map((tool) => ({
    url: `${baseUrl}/tools/${tool.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // getAllPosts excludes draft articles.
  const postEntries: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.updated || post.date,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [homeEntry, blogEntry, ...toolEntries, ...postEntries];
}