import type { Metadata } from "next";
import { getToolContent } from "@/lib/tool-content";

/** Apply CMS metadata overrides to an existing tool page. */
export function getToolMetadata(
  slug: string,
  fallback: Metadata
): Metadata {
  const content = getToolContent(slug);

  const title =
    content?.seoTitle?.trim() ||
    fallback.title ||
    undefined;

  const description =
    content?.metaDescription?.trim() ||
    fallback.description ||
    undefined;

  return {
    ...fallback,
    title,
    description,
    openGraph: {
      ...fallback.openGraph,
      title,
      description,
    },
    twitter: {
      ...fallback.twitter,
      title,
      description,
    },
  };
}