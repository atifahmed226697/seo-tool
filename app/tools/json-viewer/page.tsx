import type { Metadata } from "next";
import { ToolLayout } from "@/components/ToolLayout";
import TextUtility from "@/components/tools/TextUtility";
import { getToolMetadata } from "@/lib/tool-metadata";

const slug = "json-viewer";
const title = "JSON Viewer";
const description = "Validate and format pasted JSON for easier reading.";

export const metadata: Metadata = getToolMetadata(slug, { title, description });

export default function Page() {
  return (
    <ToolLayout slug={slug} title={title} description={description}>
      <TextUtility mode="json" />
    </ToolLayout>
  );
}
