import type { Metadata } from "next";
import { ToolLayout } from "@/components/ToolLayout";
import SiteCheckUtility from "@/components/tools/SiteCheckUtility";
import { getToolMetadata } from "@/lib/tool-metadata";

const slug = "page-speed-test";
const title = "Page Speed Test";
const description = "Measure mobile or desktop lab performance with Google Lighthouse.";

export const metadata: Metadata = getToolMetadata(slug, { title, description });

export default function Page() {
  return (
    <ToolLayout slug={slug} title={title} description={description}>
      <SiteCheckUtility mode="speed" />
    </ToolLayout>
  );
}
