import type { Metadata } from "next";
import { ToolLayout } from "@/components/ToolLayout";
import SiteCheckUtility from "@/components/tools/SiteCheckUtility";
import { getToolMetadata } from "@/lib/tool-metadata";

const slug = "domain-hosting-checker";
const title = "Domain Hosting Checker";
const description = "Find a domain’s public IP addresses and its registered network.";

export const metadata: Metadata = getToolMetadata(slug, { title, description });

export default function Page() {
  return (
    <ToolLayout slug={slug} title={title} description={description}>
      <SiteCheckUtility mode="hosting" />
    </ToolLayout>
  );
}
