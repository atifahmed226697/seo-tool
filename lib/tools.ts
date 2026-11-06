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

  // ---------- Additional utilities ----------
  {
    slug: "robots-txt-generator",
    name: "Robots.txt Generator",
    shortDescription: "Build and download robots.txt crawler rules for your website.",
    category: "On-Page SEO",
    status: "ready",
    icon: "FileCode2",
    estimatedStep: "Runs in your browser",
  },
  {
    slug: "xml-sitemap-generator",
    name: "XML Sitemap Generator",
    shortDescription: "Turn a list of URLs into an XML sitemap.",
    category: "On-Page SEO",
    status: "ready",
    icon: "FileCode2",
    estimatedStep: "Runs in your browser",
  },
  {
    slug: "json-viewer",
    name: "JSON Viewer",
    shortDescription: "Validate and format pasted JSON for easier reading.",
    category: "Developer Tools",
    status: "ready",
    icon: "FileCode2",
    estimatedStep: "Runs in your browser",
  },
  {
    slug: "favicon-generator",
    name: "Favicon Generator",
    shortDescription: "Create a multi-size favicon.ico from a JPG, PNG or WebP image.",
    category: "Image Tools",
    status: "ready",
    icon: "FileCode2",
    estimatedStep: "Runs in your browser",
  },
  {
    slug: "image-compressor",
    name: "Image Compressor",
    shortDescription: "Compress images to a target size in your browser.",
    category: "Image Tools",
    status: "ready",
    icon: "FileCode2",
    estimatedStep: "Runs in your browser",
  },
  {
    slug: "redirect-checker",
    name: "Redirect Checker",
    shortDescription: "Trace HTTP redirects and see the status at each hop.",
    category: "Page Analysis",
    status: "ready",
    icon: "SearchCode",
    estimatedStep: "Live URL check",
  },
  {
    slug: "is-it-down",
    name: "Is It Down",
    shortDescription: "Check whether a public page responds from our server.",
    category: "Page Analysis",
    status: "ready",
    icon: "Globe",
    estimatedStep: "Live URL check",
  },
  {
    slug: "domain-hosting-checker",
    name: "Domain Hosting Checker",
    shortDescription: "Find a domain’s public IP addresses and its registered network.",
    category: "Domain Research",
    status: "ready",
    icon: "Globe",
    estimatedStep: "Live URL check",
  },
  {
    slug: "image-converter",
    name: "Image Converter",
    shortDescription: "Convert JPG, PNG and WebP files in your browser.",
    category: "Image Tools",
    status: "ready",
    icon: "FileCode2",
    estimatedStep: "Runs in your browser",
  },
  {
    slug: "html-viewer",
    name: "HTML Viewer",
    shortDescription: "Preview pasted HTML in a sandboxed browser frame.",
    category: "Developer Tools",
    status: "ready",
    icon: "FileCode2",
    estimatedStep: "Runs in your browser",
  },
  {
    slug: "merge-pdf",
    name: "Merge PDF",
    shortDescription: "Combine PDFs into one downloadable document.",
    category: "PDF Tools",
    status: "ready",
    icon: "FileCode2",
    estimatedStep: "Runs in your browser",
  },
  {
    slug: "split-pdf",
    name: "Split PDF",
    shortDescription: "Extract selected pages or ranges into a new PDF.",
    category: "PDF Tools",
    status: "ready",
    icon: "FileCode2",
    estimatedStep: "Runs in your browser",
  },
  {
    slug: "rotate-pdf",
    name: "Rotate PDF",
    shortDescription: "Rotate selected pages and download the updated PDF.",
    category: "PDF Tools",
    status: "ready",
    icon: "FileCode2",
    estimatedStep: "Runs in your browser",
  },
  {
    slug: "pdf-to-jpg",
    name: "PDF to JPG",
    shortDescription: "Render selected PDF pages as JPG images.",
    category: "PDF Tools",
    status: "ready",
    icon: "FileCode2",
    estimatedStep: "Runs in your browser",
  },
  {
    slug: "image-to-text",
    name: "Image to Text",
    shortDescription: "Extract English text from an image in your browser.",
    category: "Image Tools",
    status: "ready",
    icon: "Type",
    estimatedStep: "Runs in your browser",
  },
  {
    slug: "page-speed-test",
    name: "Page Speed Test",
    shortDescription: "Measure mobile or desktop lab performance with Google Lighthouse.",
    category: "Page Analysis",
    status: "ready",
    icon: "BarChart3",
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
export function getRelatedTools(
  currentSlug: string,
  count: number = 3
): Tool[] {
  const current = getToolBySlug(currentSlug);
  const available = tools.filter(
    (tool) => tool.status === "ready" && tool.slug !== currentSlug
  );

  if (!current) {
    return available.slice(0, count);
  }

  const sameCategory = available.filter(
    (tool) => tool.category === current.category
  );
  const otherCategory = available.filter(
    (tool) => tool.category !== current.category
  );

  return [...sameCategory, ...otherCategory].slice(0, count);
}

/** Get distinct list of tool categories. */
export function getCategories(): string[] {
  return Array.from(new Set(tools.map((tool) => tool.category)));
}
