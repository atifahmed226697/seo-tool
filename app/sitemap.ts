import type { MetadataRoute } from "next";
import { tools } from "@/lib/tools";
import { getAllPosts } from "@/lib/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://seotoolkit.local").replace(/\/+$/, "");
  const pages = ["/", "/about", "/contact", "/blog", "/privacy-policy", "/terms"];
  const toolPages = tools.filter(tool => tool.status === "ready").map(tool => `/tools/${tool.slug}`);
  const posts = getAllPosts().map(post => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.updated || post.date,
  }));

  return [
    ...[...pages, ...toolPages].map(path => ({ url: `${baseUrl}${path}` })),
    ...posts,
  ];
}
