import type { Metadata } from "next";
import { ToolLayout } from "@/components/ToolLayout";
import PdfUtility from "@/components/tools/PdfUtility";
import { getToolMetadata } from "@/lib/tool-metadata";

const slug = "merge-pdf";
const title = "Merge PDF";
const description = "Combine PDFs into one downloadable document.";

export const metadata: Metadata = getToolMetadata(slug, { title, description });

export default function Page() {
  return (
    <ToolLayout slug={slug} title={title} description={description}>
      <PdfUtility mode="merge" />
    </ToolLayout>
  );
}
