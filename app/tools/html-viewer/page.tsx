import type { Metadata } from "next";
import { ToolLayout } from "@/components/ToolLayout";
import TextUtility from "@/components/tools/TextUtility";
import { getToolMetadata } from "@/lib/tool-metadata";

const slug = "html-viewer";
const title = "HTML Viewer";
const description = "Preview pasted HTML in a sandboxed browser frame.";

export const metadata: Metadata = getToolMetadata(slug, { title, description });

export default function Page() {
  return (
    <ToolLayout slug={slug} title={title} description={description}>
      <TextUtility mode="html" />
    </ToolLayout>
  );
}
