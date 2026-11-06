import type { Metadata } from "next";
import { ToolLayout } from "@/components/ToolLayout";
import ImageUtility from "@/components/tools/ImageUtility";
import { getToolMetadata } from "@/lib/tool-metadata";

const slug = "favicon-generator";
const title = "Favicon Generator";
const description = "Create a multi-size favicon.ico from a JPG, PNG or WebP image.";

export const metadata: Metadata = getToolMetadata(slug, { title, description });

export default function Page() {
  return (
    <ToolLayout slug={slug} title={title} description={description}>
      <ImageUtility mode="favicon" />
    </ToolLayout>
  );
}
