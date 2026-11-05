import { getToolMetadata } from "@/lib/tool-metadata";
import type { Metadata } from "next";
import { ToolLayout } from "@/components/ToolLayout";
import { MetaTagGeneratorUI } from "@/components/tools/MetaTagGeneratorUI";

export const metadata: Metadata = getToolMetadata("meta-tag-generator", {
  title: "Meta Tag Generator - Create Search & Social HTML Tags",
  description:
    "Generate comprehensive HTML meta tags, Open Graph properties, Twitter cards, and robots directives for optimized search engine indexing and social sharing.",
});

export default function MetaTagGeneratorPage() {
  return (
    <ToolLayout
      slug="meta-tag-generator"
      title="Meta Tag Generator"
      description="Create search-engine friendly title tags, meta descriptions, robots indexing tags, Open Graph (Facebook/LinkedIn), and Twitter Card markup."
    >
      <MetaTagGeneratorUI />
    </ToolLayout>
  );
}
