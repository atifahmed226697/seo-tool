import type { Metadata } from "next";
import { ToolLayout } from "@/components/ToolLayout";
import ImageUtility from "@/components/tools/ImageUtility";
import { getToolMetadata } from "@/lib/tool-metadata";

const slug = "image-converter";
const title = "Image Converter";
const description = "Convert JPG, PNG and WebP files in your browser.";

export const metadata: Metadata = getToolMetadata(slug, { title, description });

export default function Page() {
  return (
    <ToolLayout slug={slug} title={title} description={description}>
      <ImageUtility mode="convert" />
    </ToolLayout>
  );
}
