import type { Metadata } from "next";
import { ToolLayout } from "@/components/ToolLayout";
import SiteCheckUtility from "@/components/tools/SiteCheckUtility";
import { getToolMetadata } from "@/lib/tool-metadata";

const slug = "redirect-checker";
const title = "Redirect Checker";
const description = "Trace HTTP redirects and see the status at each hop.";

export const metadata: Metadata = getToolMetadata(slug, { title, description });

export default function Page() {
  return (
    <ToolLayout slug={slug} title={title} description={description}>
      <SiteCheckUtility mode="redirect" />
    </ToolLayout>
  );
}
