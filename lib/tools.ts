/**
 * Single source of truth for all SEO tools across the website.
 * Navbar, Homepage grid, Related Tools, Footer and Sitemap all consume this list.
 */

export type ToolStatus = "ready" | "ready-next" | "needs-api";

export interface Tool {
  slug: string;
  name: string;
  shortDescription: string;
  category: string;
  status: ToolStatus;
  icon: "Type" | "FileCode2" | "SearchCode" | "CalendarClock" | "BarChart3" | "ShieldAlert" | "Globe";
  estimatedStep?: string;
}

export const tools: Tool[] = [
  // ---------- Live tools ----------
  {
    slug: "case-converter",
    name: "Case Converter",
    shortDescription: "Convert strings and titles into UPPERCASE, lowercase, Title Case, and Sentence case instantly.",
    category: "Content & Copy",
    status: "ready",
    icon: "Type",
    estimatedStep: "Runs in your browser",
  },
  {
    slug: "meta-tag-generator",
    name: "Meta Tag Generator",
    shortDescription: "Generate comprehensive HTML meta tags, Open Graph, and Twitter Cards for search & social optimization.",
    category: "On-Page SEO",
    status: "ready",
    icon: "FileCode2",
    estimatedStep: "Runs in your browser",
  },
  {
    slug: "meta-tag-analyzer",
    name: "Meta Tag Analyzer",
    shortDescription: "Inspect and analyze live website metadata, viewport, character limits, and social sharing tags.",
    category: "On-Page SEO",
    status: "ready",
    icon: "SearchCode",
    estimatedStep: "Live URL check",
  },
  {
    slug: "domain-age-checker",
    name: "Domain Age Checker",
    shortDescription: "Check WHOIS registration dates, domain creation age, registrar details, and expiration timeline.",
    category: "Domain Research",
    status: "ready",
    icon: "CalendarClock",
    estimatedStep: "Live domain lookup",
  },

  // ---------- Batch 1: text tools (browser) ----------
  {
    slug: "word-counter",
    name: "Word Counter",
    shortDescription: "Count words, characters, sentences and paragraphs, and see the reading time of your text.",
    category: "Content & Copy",
    status: "ready",
    icon: "Type",
    estimatedStep: "Runs in your browser",
  },
  {
    slug: "slug-generator",
    name: "Slug Generator",
    shortDescription: "Turn any title into a clean, SEO-friendly URL slug.",
    category: "On-Page SEO",
    status: "ready",
    icon: "FileCode2",
    estimatedStep: "Runs in your browser",
  },
  {
    slug: "keyword-density-checker",
    name: "Keyword Density Checker",
    shortDescription: "Find the most used words and phrases in your text and see their density.",
    category: "Content & Copy",
    status: "ready",
    icon: "BarChart3",
    estimatedStep: "Runs in your browser",
  },
  {
    slug: "lorem-ipsum-generator",
    name: "Lorem Ipsum Generator",
    shortDescription: "Generate placeholder text by paragraphs, sentences or words for your designs.",
    category: "Content & Copy",
    status: "ready",
    icon: "Type",
    estimatedStep: "Runs in your browser",
  },

  // ---------- Batch 2: generators (browser) ----------
  {
    slug: "utm-link-builder",
    name: "UTM Link Builder",
    shortDescription: "Add UTM campaign parameters to any URL to track traffic in analytics.",
    category: "Marketing",
    status: "ready",
    icon: "Globe",
    estimatedStep: "Runs in your browser",
  },
  {
    slug: "hreflang-tag-generator",
    name: "Hreflang Tag Generator",
    shortDescription: "Create hreflang tags for multi-language and multi-region versions of a page.",
    category: "On-Page SEO",
    status: "ready",
    icon: "Globe",
    estimatedStep: "Runs in your browser",
  },

  // ---------- Batch 3: live page checks (server, free) ----------
  {
    slug: "broken-link-checker",
    name: "Broken Link Checker",
    shortDescription: "Scan a page and find links that return errors or do not load.",
    category: "Page Analysis",
    status: "ready",
    icon: "SearchCode",
    estimatedStep: "Live URL check",
  },
  {
    slug: "alt-tag-checker",
    name: "Alt Tag Checker",
    shortDescription: "Find images on a page that have missing or empty alt text.",
    category: "Page Analysis",
    status: "ready",
    icon: "SearchCode",
    estimatedStep: "Live URL check",
  },
  {
    slug: "links-counter",
    name: "Links Counter",
    shortDescription: "Count internal and external links on any page, with nofollow detection.",
    category: "Page Analysis",
    status: "ready",
    icon: "SearchCode",
    estimatedStep: "Live URL check",
  },
  {
    slug: "heading-structure-checker",
    name: "Heading Structure Checker",
    shortDescription: "View the H1 to H6 heading outline of any page and spot structure problems.",
    category: "Page Analysis",
    status: "ready",
    icon: "SearchCode",
    estimatedStep: "Live URL check",
  },

  // ---------- Waiting for paid APIs ----------
  {
    slug: "da-pa-checker",
    name: "DA / PA Checker",
    shortDescription: "Bulk evaluate Domain Authority and Page Authority metrics to measure search ranking strength.",
    category: "Authority & Backlinks",
    status: "needs-api",
    icon: "BarChart3",
    estimatedStep: "ready",
  },
  {
    slug: "spam-score-checker",
    name: "Spam Score Checker",
    shortDescription: "Assess domain toxicity and penalized link flags to protect your backlink profile health.",
    category: "Authority & Backlinks",
    status: "needs-api",
    icon: "ShieldAlert",
    estimatedStep: "ready",
  },
  {
    slug: "google-index-checker",
    name: "Google Index Checker",
    shortDescription: "Check whether individual or bulk URLs are indexed in Google search results and cache status.",
    category: "Indexing & SERP",
    status: "needs-api",
    icon: "Globe",
    estimatedStep: "ready",
  },
];

/** Retrieve a tool configuration by slug. */
export function getToolBySlug(slug: string): Tool | undefined {
  return tools.find((tool) => tool.slug === slug);
}

/** Retrieve related tools excluding the current tool slug. */
export function getRelatedTools(currentSlug: string, count: number = 3): Tool[] {
  const current = getToolBySlug(currentSlug);
  if (!current) {
    return tools.slice(0, count);
  }

  // Same category first, then the rest.
  const sameCategory = tools.filter(
    (tool) => tool.category === current.category && tool.slug !== currentSlug
  );
  const otherCategory = tools.filter(
    (tool) => tool.category !== current.category && tool.slug !== currentSlug
  );

  return [...sameCategory, ...otherCategory].slice(0, count);
}

/** Get distinct list of tool categories. */
export function getCategories(): string[] {
  return Array.from(new Set(tools.map((tool) => tool.category)));
}
