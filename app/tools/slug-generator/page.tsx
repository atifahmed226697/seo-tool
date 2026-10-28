import type { Metadata } from "next";
import { ToolLayout } from "@/components/ToolLayout";
import SlugGeneratorUI from "@/components/tools/SlugGeneratorUI";

export const metadata: Metadata = {
  title: "Slug Generator - Create SEO-Friendly URL Slugs | SEO Toolkit",
  description:
    "Free slug generator. Turn any title into a clean, SEO-friendly URL slug in one click.",
};

export default function SlugGeneratorPage() {
  return (
    <ToolLayout
      slug="slug-generator"
      title="Slug Generator"
      description="Turn any title into a clean, SEO-friendly URL slug you can copy in one click."
    >
      <SlugGeneratorUI />
    </ToolLayout>
  );
}