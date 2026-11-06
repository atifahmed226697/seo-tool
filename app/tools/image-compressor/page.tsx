import type { Metadata } from "next";
import { ToolLayout } from "@/components/ToolLayout";
import ImageUtility from "@/components/tools/ImageUtility";
import { getToolMetadata } from "@/lib/tool-metadata";

const slug = "image-compressor";
const title = "Image Compressor";
const description = "Compress images to a target size in your browser.";

export const metadata: Metadata = getToolMetadata(slug, { title, description });

export default function Page() {
  return (
    <ToolLayout slug={slug} title={title} description={description}>
      <ImageUtility mode="compress" />
    </ToolLayout>
  );
}
