import content0 from "@/content/tools/case-converter.json";
import content1 from "@/content/tools/meta-tag-generator.json";
import content2 from "@/content/tools/meta-tag-analyzer.json";
import content3 from "@/content/tools/domain-age-checker.json";
import content4 from "@/content/tools/word-counter.json";
import content5 from "@/content/tools/slug-generator.json";
import content6 from "@/content/tools/keyword-density-checker.json";
import content7 from "@/content/tools/lorem-ipsum-generator.json";
import content8 from "@/content/tools/utm-link-builder.json";
import content9 from "@/content/tools/hreflang-tag-generator.json";
import content10 from "@/content/tools/broken-link-checker.json";
import content11 from "@/content/tools/alt-tag-checker.json";
import content12 from "@/content/tools/links-counter.json";
import content13 from "@/content/tools/heading-structure-checker.json";

export interface ToolContent {
  seoTitle?: string;
  metaDescription?: string;
  aboutTitle: string;
  about: string;
  exampleTitle: string;
  example: string;
  faqs: {
    question: string;
    answer: string;
  }[];
}

const toolContent: Partial<Record<string, ToolContent>> = {
  "case-converter": content0,
  "meta-tag-generator": content1,
  "meta-tag-analyzer": content2,
  "domain-age-checker": content3,
  "word-counter": content4,
  "slug-generator": content5,
  "keyword-density-checker": content6,
  "lorem-ipsum-generator": content7,
  "utm-link-builder": content8,
  "hreflang-tag-generator": content9,
  "broken-link-checker": content10,
  "alt-tag-checker": content11,
  "links-counter": content12,
  "heading-structure-checker": content13,
};

export function getToolContent(slug: string): ToolContent | undefined {
  return toolContent[slug];
}
