import type { Metadata } from "next";
import { ToolLayout } from "@/components/ToolLayout";
import PdfUtility from "@/components/tools/PdfUtility";
import { getToolMetadata } from "@/lib/tool-metadata";

const slug = "pdf-to-jpg";
const title = "PDF to JPG";
const description = "Render selected PDF pages as JPG images.";

export const metadata: Metadata = getToolMetadata(slug, { title, description });

export default function Page() {
  return (
    <ToolLayout slug={slug} title={title} description={description}>
      <PdfUtility mode="jpg" />
    </ToolLayout>
  );
}
