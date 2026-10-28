import type { Metadata } from "next";
import { ToolLayout } from "@/components/ToolLayout";
import BrokenLinkCheckerUI from "@/components/tools/BrokenLinkCheckerUI";

export const metadata: Metadata = {
  title: "Broken Link Checker - Find Dead Links on a Page | SEO Toolkit",
  description:
    "Free broken link checker. Scan a page and find links that return errors or fail to load.",
};

export default function BrokenLinkCheckerPage() {
  return (
    <ToolLayout
      slug="broken-link-checker"
      title="Broken Link Checker"
      description="Scan a page and find links that return errors or do not load."
    >
      <BrokenLinkCheckerUI />
    </ToolLayout>
  );
}