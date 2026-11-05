import { getToolMetadata } from "@/lib/tool-metadata";
import type { Metadata } from "next";
import { ToolLayout } from "@/components/ToolLayout";
import HeadingStructureCheckerUI from "@/components/tools/HeadingStructureCheckerUI";

export const metadata: Metadata = getToolMetadata("heading-structure-checker", {
  title: "Heading Structure Checker - View H1 to H6 Outline",
  description:
    "Free heading structure checker. See the H1 to H6 outline of any page and spot missing or skipped heading levels.",
});

export default function HeadingStructureCheckerPage() {
  return (
    <ToolLayout
      slug="heading-structure-checker"
      title="Heading Structure Checker"
      description="View the H1 to H6 heading outline of any page and spot structure problems."
    >
      <HeadingStructureCheckerUI />
    </ToolLayout>
  );
}