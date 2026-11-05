import { getToolMetadata } from "@/lib/tool-metadata";
import type { Metadata } from "next";
import { ToolLayout } from "@/components/ToolLayout";
import WordCounterUI from "@/components/tools/WordCounterUI";

export const metadata: Metadata = getToolMetadata("word-counter", {
  title: "Word Counter - Count Words, Characters and Reading Time",
  description:
    "Free word counter. Count words, characters, sentences and paragraphs, and see the reading time of your text instantly.",
});

export default function WordCounterPage() {
  return (
    <ToolLayout
      slug="word-counter"
      title="Word Counter"
      description="Count words, characters, sentences and paragraphs, and see how long your text takes to read."
    >
      <WordCounterUI />
    </ToolLayout>
  );
}