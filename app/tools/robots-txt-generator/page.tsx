import type { Metadata } from "next";
import { ToolLayout } from "@/components/ToolLayout";
import TextUtility from "@/components/tools/TextUtility";
import { getToolMetadata } from "@/lib/tool-metadata";

const slug = "robots-txt-generator";
const title = "Robots.txt Generator";
const description = "Build and download robots.txt crawler rules for your website.";

export const metadata: Metadata = getToolMetadata(slug, { title, description });

export default function Page() {
  return (
    <ToolLayout slug={slug} title={title} description={description}>
      <TextUtility mode="robots" />
    </ToolLayout>
  );
}
