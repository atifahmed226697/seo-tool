import type { Metadata } from "next";
import { ToolLayout } from "@/components/ToolLayout";
import TextUtility from "@/components/tools/TextUtility";
import { getToolMetadata } from "@/lib/tool-metadata";

const slug = "xml-sitemap-generator";
const title = "XML Sitemap Generator";
const description = "Turn a list of URLs into an XML sitemap.";

export const metadata: Metadata = getToolMetadata(slug, { title, description });

export default function Page() {
  return (
    <ToolLayout slug={slug} title={title} description={description}>
      <TextUtility mode="sitemap" />
    </ToolLayout>
  );
}
