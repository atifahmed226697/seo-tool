import type { Metadata } from "next";
import { ToolLayout } from "@/components/ToolLayout";
import SiteCheckUtility from "@/components/tools/SiteCheckUtility";
import { getToolMetadata } from "@/lib/tool-metadata";

const slug = "is-it-down";
const title = "Is It Down";
const description = "Check whether a public page responds from our server.";

export const metadata: Metadata = getToolMetadata(slug, { title, description });

export default function Page() {
  return (
    <ToolLayout slug={slug} title={title} description={description}>
      <SiteCheckUtility mode="availability" />
    </ToolLayout>
  );
}
