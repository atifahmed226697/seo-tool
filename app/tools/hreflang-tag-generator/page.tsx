import type { Metadata } from "next";
import { ToolLayout } from "@/components/ToolLayout";
import HreflangTagGeneratorUI from "@/components/tools/HreflangTagGeneratorUI";

export const metadata: Metadata = {
  title: "Hreflang Tag Generator - Multi-Language SEO Tags | SEO Toolkit",
  description:
    "Free hreflang tag generator. Create alternate language link tags for multi-language and multi-region versions of your pages.",
};

export default function HreflangTagGeneratorPage() {
  return (
    <ToolLayout
      slug="hreflang-tag-generator"
      title="Hreflang Tag Generator"
      description="Create hreflang tags so search engines show the right language or regional version of your page."
    >
      <HreflangTagGeneratorUI />
    </ToolLayout>
  );
}