import type { Metadata } from "next";
import { ToolLayout } from "@/components/ToolLayout";
import { GoogleIndexCheckerUI } from "@/components/tools/GoogleIndexCheckerUI";

export const metadata: Metadata = {
  title: "Google Index Checker - Verify Webpage Indexation & Cache Status | SEO Toolkit",
  description:
    "Check if single or bulk URLs are indexed in Google search results. View cache dates and direct site search query commands instantly.",
};

export default function GoogleIndexCheckerPage() {
  return (
    <ToolLayout
      slug="google-index-checker"
      title="Google Index Checker"
      description="Verify whether your pages and posts are crawled, indexed, and appearing in Google search results in single or bulk mode."
    >
      <GoogleIndexCheckerUI />
    </ToolLayout>
  );
}
