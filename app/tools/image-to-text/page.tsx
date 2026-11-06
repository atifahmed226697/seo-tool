import type { Metadata } from "next";
import { ToolLayout } from "@/components/ToolLayout";
import ImageUtility from "@/components/tools/ImageUtility";
import { getToolMetadata } from "@/lib/tool-metadata";

const slug = "image-to-text";
const title = "Image to Text";
const description = "Extract English text from an image in your browser.";

export const metadata: Metadata = getToolMetadata(slug, { title, description });

export default function Page() {
  return (
    <ToolLayout slug={slug} title={title} description={description}>
      <ImageUtility mode="ocr" />
    </ToolLayout>
  );
}
