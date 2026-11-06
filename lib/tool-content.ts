import caseConverterContent from "@/content/tools/case-converter.json";
import metaTagGeneratorContent from "@/content/tools/meta-tag-generator.json";
import metaTagAnalyzerContent from "@/content/tools/meta-tag-analyzer.json";
import domainAgeCheckerContent from "@/content/tools/domain-age-checker.json";
import wordCounterContent from "@/content/tools/word-counter.json";
import slugGeneratorContent from "@/content/tools/slug-generator.json";
import keywordDensityCheckerContent from "@/content/tools/keyword-density-checker.json";
import loremIpsumGeneratorContent from "@/content/tools/lorem-ipsum-generator.json";
import utmLinkBuilderContent from "@/content/tools/utm-link-builder.json";
import hreflangTagGeneratorContent from "@/content/tools/hreflang-tag-generator.json";
import brokenLinkCheckerContent from "@/content/tools/broken-link-checker.json";
import altTagCheckerContent from "@/content/tools/alt-tag-checker.json";
import linksCounterContent from "@/content/tools/links-counter.json";
import headingStructureCheckerContent from "@/content/tools/heading-structure-checker.json";
import robotsTxtGeneratorContent from "@/content/tools/robots-txt-generator.json";
import xmlSitemapGeneratorContent from "@/content/tools/xml-sitemap-generator.json";
import jsonViewerContent from "@/content/tools/json-viewer.json";
import faviconGeneratorContent from "@/content/tools/favicon-generator.json";
import imageCompressorContent from "@/content/tools/image-compressor.json";
import redirectCheckerContent from "@/content/tools/redirect-checker.json";
import isItDownContent from "@/content/tools/is-it-down.json";
import domainHostingCheckerContent from "@/content/tools/domain-hosting-checker.json";
import imageConverterContent from "@/content/tools/image-converter.json";
import htmlViewerContent from "@/content/tools/html-viewer.json";
import mergePdfContent from "@/content/tools/merge-pdf.json";
import splitPdfContent from "@/content/tools/split-pdf.json";
import rotatePdfContent from "@/content/tools/rotate-pdf.json";
import pdfToJpgContent from "@/content/tools/pdf-to-jpg.json";
import imageToTextContent from "@/content/tools/image-to-text.json";
import pageSpeedTestContent from "@/content/tools/page-speed-test.json";
import daPaCheckerContent from "@/content/tools/da-pa-checker.json";
import spamScoreCheckerContent from "@/content/tools/spam-score-checker.json";
import googleIndexCheckerContent from "@/content/tools/google-index-checker.json";

export interface ToolContent {
  seoTitle?: string;
  metaDescription?: string;
  intro?: string;
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
  "case-converter": caseConverterContent,
  "meta-tag-generator": metaTagGeneratorContent,
  "meta-tag-analyzer": metaTagAnalyzerContent,
  "domain-age-checker": domainAgeCheckerContent,
  "word-counter": wordCounterContent,
  "slug-generator": slugGeneratorContent,
  "keyword-density-checker": keywordDensityCheckerContent,
  "lorem-ipsum-generator": loremIpsumGeneratorContent,
  "utm-link-builder": utmLinkBuilderContent,
  "hreflang-tag-generator": hreflangTagGeneratorContent,
  "broken-link-checker": brokenLinkCheckerContent,
  "alt-tag-checker": altTagCheckerContent,
  "links-counter": linksCounterContent,
  "heading-structure-checker": headingStructureCheckerContent,
  "robots-txt-generator": robotsTxtGeneratorContent,
  "xml-sitemap-generator": xmlSitemapGeneratorContent,
  "json-viewer": jsonViewerContent,
  "favicon-generator": faviconGeneratorContent,
  "image-compressor": imageCompressorContent,
  "redirect-checker": redirectCheckerContent,
  "is-it-down": isItDownContent,
  "domain-hosting-checker": domainHostingCheckerContent,
  "image-converter": imageConverterContent,
  "html-viewer": htmlViewerContent,
  "merge-pdf": mergePdfContent,
  "split-pdf": splitPdfContent,
  "rotate-pdf": rotatePdfContent,
  "pdf-to-jpg": pdfToJpgContent,
  "image-to-text": imageToTextContent,
  "page-speed-test": pageSpeedTestContent,
  "da-pa-checker": daPaCheckerContent,
  "spam-score-checker": spamScoreCheckerContent,
  "google-index-checker": googleIndexCheckerContent,
};

export function getToolContent(slug: string): ToolContent | undefined {
  return toolContent[slug];
}
