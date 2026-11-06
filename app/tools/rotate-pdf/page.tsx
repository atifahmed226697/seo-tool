import type { Metadata } from "next";
import { ToolLayout } from "@/components/ToolLayout";
import PdfUtility from "@/components/tools/PdfUtility";
import { getToolMetadata } from "@/lib/tool-metadata";

const slug = "rotate-pdf";
const title = "Rotate PDF";
const description = "Rotate selected pages and download the updated PDF.";

export const metadata: Metadata = getToolMetadata(slug, { title, description });

export default function Page() {
  return (
    <ToolLayout slug={slug} title={title} description={description}>
      <PdfUtility mode="rotate" />
    </ToolLayout>
  );
}
