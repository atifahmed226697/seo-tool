import type { Metadata } from "next";
import { ToolLayout } from "@/components/ToolLayout";
import { CaseConverterUI } from "@/components/tools/CaseConverterUI";

export const metadata: Metadata = {
  title: "Case Converter - Free Online Text Case Formatting Tool | SEO Toolkit",
  description:
    "Convert your text and titles to UPPERCASE, lowercase, Title Case, and Sentence case with one click. Fast, private, and client-side formatting.",
};

export default function CaseConverterPage() {
  return (
    <ToolLayout
      slug="case-converter"
      title="Case Converter"
      description="Instantly convert any text, article snippet, or headline into UPPERCASE, lowercase, Title Case, or Sentence case for consistent SEO styling."
    >
      <CaseConverterUI />
    </ToolLayout>
  );
}
