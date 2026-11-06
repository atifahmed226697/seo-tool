import type { Metadata } from "next";
import { ToolLayout } from "@/components/ToolLayout";
import PdfUtility from "@/components/tools/PdfUtility";
import { getToolMetadata } from "@/lib/tool-metadata";

const slug = "split-pdf";
const title = "Split PDF";
const description = "Extract selected pages or ranges into a new PDF.";

export const metadata: Metadata = getToolMetadata(slug, { title, description });

export default function Page() {
  return (
    <ToolLayout slug={slug} title={title} description={description}>
      <PdfUtility mode="split" />
    </ToolLayout>
  );
}
