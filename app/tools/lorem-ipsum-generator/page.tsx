import { getToolMetadata } from "@/lib/tool-metadata";
import type { Metadata } from "next";
import { ToolLayout } from "@/components/ToolLayout";
import LoremIpsumGeneratorUI from "@/components/tools/LoremIpsumGeneratorUI";

export const metadata: Metadata = getToolMetadata("lorem-ipsum-generator", {
  title: "Lorem Ipsum Generator - Free Placeholder Text",
  description:
    "Free Lorem Ipsum generator. Create placeholder text by paragraphs, sentences or words and copy it in one click.",
});

export default function LoremIpsumGeneratorPage() {
  return (
    <ToolLayout
      slug="lorem-ipsum-generator"
      title="Lorem Ipsum Generator"
      description="Generate placeholder text by paragraphs, sentences or words for your designs and mockups."
    >
      <LoremIpsumGeneratorUI />
    </ToolLayout>
  );
}