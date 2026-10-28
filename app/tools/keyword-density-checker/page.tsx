import type { Metadata } from "next";
import { ToolLayout } from "@/components/ToolLayout";
import KeywordDensityCheckerUI from "@/components/tools/KeywordDensityCheckerUI";

export const metadata: Metadata = {
  title: "Keyword Density Checker - Find Your Most Used Keywords | SEO Toolkit",
  description:
    "Free keyword density checker. Paste your text to see the most used words and phrases and their density percentage.",
};

export default function KeywordDensityCheckerPage() {
  return (
    <ToolLayout
      slug="keyword-density-checker"
      title="Keyword Density Checker"
      description="Find the most used words and phrases in your text and see how often each one appears."
    >
      <KeywordDensityCheckerUI />
    </ToolLayout>
  );
}