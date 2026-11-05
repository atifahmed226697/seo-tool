import { getToolMetadata } from "@/lib/tool-metadata";
import type { Metadata } from "next";
import { ToolLayout } from "@/components/ToolLayout";
import AltTagCheckerUI from "@/components/tools/AltTagCheckerUI";

export const metadata: Metadata = getToolMetadata("alt-tag-checker", {
  title: "Alt Tag Checker - Find Images With Missing Alt Text",
  description:
    "Free alt tag checker. Scan any page and find images with missing or empty alt text to improve SEO and accessibility.",
});

export default function AltTagCheckerPage() {
  return (
    <ToolLayout
      slug="alt-tag-checker"
      title="Alt Tag Checker"
      description="Find images on a page that have missing or empty alt text."
    >
      <AltTagCheckerUI />
    </ToolLayout>
  );
}