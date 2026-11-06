import type { Metadata } from "next";

export function sitePageMetadata(path: string, title: string, description: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", siteName: "SEO Toolkit", url: path, title, description },
    twitter: { card: "summary", title, description },
  };
}
