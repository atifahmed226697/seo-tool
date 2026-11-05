import { getToolMetadata } from "@/lib/tool-metadata";
import type { Metadata } from "next";
import { ToolLayout } from "@/components/ToolLayout";
import MetaTagAnalyzerUI from "@/components/tools/MetaTagAnalyzerUI";

export const metadata: Metadata = getToolMetadata("meta-tag-analyzer", {
  title: "Meta Tag Analyzer - Inspect On-Page SEO & Social Tags",
  description:
    "Audit any live webpage for title tags, meta descriptions, Open Graph protocol, canonical tags, and robots directives. Fast and in-depth metadata analyzer.",
});

export default function MetaTagAnalyzerPage() {
  return (
    <ToolLayout
      slug="meta-tag-analyzer"
      title="Meta Tag Analyzer"
      description="Inspect and validate live on-page metadata, detect missing meta tags, character length warnings, and preview Google search snippets."
    >
      <MetaTagAnalyzerUI />
    </ToolLayout>
  );
} 