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
    shortDescription: "Change text to uppercase, lowercase, title case or sentence case in your browser.",
    category: "Content & Copy",
    status: "ready",
    icon: "Type",
    estimatedStep: "Runs in your browser",
  },
  {
    slug: "meta-tag-generator",
    name: "Meta Tag Generator",
    shortDescription: "Generate HTML metadata, canonical tags, Open Graph tags and X card markup.",
    category: "On-Page SEO",
    status: "ready",
    icon: "FileCode2",
    estimatedStep: "Runs in your browser",
  },
  {
    slug: "meta-tag-analyzer",
    name: "Meta Tag Analyzer",
    shortDescription: "Inspect the title, description, canonical, robots directives and social metadata in a public page’s HTML.",
    category: "On-Page SEO",
    status: "ready",
    icon: "SearchCode",
    estimatedStep: "Live URL check",
  },
  {
    slug: "domain-age-checker",
    name: "Domain Age Checker",
    shortDescription: "Look up a domain’s registration date and the registrar or expiry details available in public records.",
    category: "Domain Research",
    status: "ready",
    icon: "CalendarClock",
    estimatedStep: "Live domain lookup",
  },

  // ---------- Batch 1: text tools (browser) ----------
  {
    slug: "word-counter",
    name: "Word Counter",
    shortDescription: "Count words, characters, sentences and paragraphs as you edit your text in the browser.",
    category: "Content & Copy",
    status: "ready",
    icon: "Type",
    estimatedStep: "Runs in your browser",
  },
  {
    slug: "slug-generator",
    name: "Slug Generator",
    shortDescription: "Turn a title into a lowercase URL slug with hyphens or underscores.",
    category: "On-Page SEO",
    status: "ready",
    icon: "FileCode2",
    estimatedStep: "Runs in your browser",
  },
  {
    slug: "keyword-density-checker",
    name: "Keyword Density Checker",
    shortDescription: "Find recurring words and short phrases in pasted text or a public page.",
    category: "Content & Copy",
    status: "ready",
    icon: "BarChart3",
    estimatedStep: "Runs in your browser",
  },
  {
    slug: "lorem-ipsum-generator",
    name: "Lorem Ipsum Generator",
    shortDescription: "Generate placeholder text by words, sentences or paragraphs for a draft layout.",
    category: "Content & Copy",
    status: "ready",
    icon: "Type",
    estimatedStep: "Runs in your browser",
  },

  // ---------- Batch 2: generators (browser) ----------
  {
    slug: "utm-link-builder",
    name: "UTM Link Builder",
    shortDescription: "Add source, medium and campaign parameters to a website or Google Play link.",
    category: "Marketing",
    status: "ready",
    icon: "Globe",
    estimatedStep: "Runs in your browser",
  },
  {
    slug: "hreflang-tag-generator",
    name: "Hreflang Tag Generator",
    shortDescription: "Generate HTML or XML hreflang annotations for language and regional versions of a page.",
    category: "On-Page SEO",
    status: "ready",
    icon: "Globe",
    estimatedStep: "Runs in your browser",
  },

  // ---------- Batch 3: live page checks (server, free) ----------
  {
    slug: "broken-link-checker",
    name: "Broken Link Checker",
    shortDescription: "Test up to 25 unique HTTP links on a public page and review failed responses.",
    category: "Page Analysis",
    status: "ready",
    icon: "SearchCode",
    estimatedStep: "Live URL check",
  },
  {
    slug: "alt-tag-checker",
    name: "Alt Tag Checker",
    shortDescription: "Find missing, empty and populated alt attributes on images in a public page’s HTML.",
    category: "Page Analysis",
    status: "ready",
    icon: "SearchCode",
    estimatedStep: "Live URL check",
  },
  {
    slug: "links-counter",
    name: "Links Counter",
    shortDescription: "Count and filter HTTP links by hostname and nofollow status on a public page.",
    category: "Page Analysis",
    status: "ready",
    icon: "SearchCode",
    estimatedStep: "Live URL check",
  },
  {
    slug: "heading-structure-checker",
    name: "Heading Structure Checker",
    shortDescription: "Inspect the order and text of H1 through H6 elements in a public page’s HTML.",
    category: "Page Analysis",
    status: "ready",
    icon: "SearchCode",
    estimatedStep: "Live URL check",
  },

  // ---------- Additional utilities ----------
  {
    slug: "robots-txt-generator",
    name: "Robots.txt Generator",
    shortDescription: "Create a robots.txt file with crawler groups, allow and disallow rules, and an optional sitemap URL.",
    category: "On-Page SEO",
    status: "ready",
    icon: "FileCode2",
    estimatedStep: "Runs in your browser",
  },
  {
    slug: "xml-sitemap-generator",
    name: "XML Sitemap Generator",
    shortDescription: "Turn up to 5,000 same-origin URLs into a downloadable XML sitemap.",
    category: "On-Page SEO",
    status: "ready",
    icon: "FileCode2",
    estimatedStep: "Runs in your browser",
  },
  {
    slug: "json-viewer",
    name: "JSON Viewer",
    shortDescription: "Validate pasted JSON, format it for reading and inspect small results in an expandable tree.",
    category: "Developer Tools",
    status: "ready",
    icon: "FileCode2",
    estimatedStep: "Runs in your browser",
  },
  {
    slug: "favicon-generator",
    name: "Favicon Generator",
    shortDescription: "Make a favicon.ico with 16, 32 and 48 pixel icons from a JPG, PNG or WebP logo.",
    category: "Image Tools",
    status: "ready",
    icon: "FileCode2",
    estimatedStep: "Runs in your browser",
  },
  {
    slug: "image-compressor",
    name: "Image Compressor",
    shortDescription: "Compress JPG, PNG or WebP input into JPG or WebP with a size target as low as 50 KB.",
    category: "Image Tools",
    status: "ready",
    icon: "FileCode2",
    estimatedStep: "Runs in your browser",
  },
  {
    slug: "redirect-checker",
    name: "Redirect Checker",
    shortDescription: "Follow a public URL and inspect the HTTP response code at each redirect step.",
    category: "Page Analysis",
    status: "ready",
    icon: "SearchCode",
    estimatedStep: "Live URL check",
  },
  {
    slug: "is-it-down",
    name: "Is It Down",
    shortDescription: "Check whether a public URL responds from our server and see its HTTP status or connection error.",
    category: "Page Analysis",
    status: "ready",
    icon: "Globe",
    estimatedStep: "Live URL check",
  },
  {
    slug: "domain-hosting-checker",
    name: "Domain Hosting Checker",
    shortDescription: "Look up public IP addresses for a domain and inspect the registered network when available.",
    category: "Domain Research",
    status: "ready",
    icon: "Globe",
    estimatedStep: "Live URL check",
  },
  {
    slug: "image-converter",
    name: "Image Converter",
    shortDescription: "Convert JPG, PNG and WebP images directly in your browser.",
    category: "Image Tools",
    status: "ready",
    icon: "FileCode2",
    estimatedStep: "Runs in your browser",
  },
  {
    slug: "html-viewer",
    name: "HTML Viewer",
    shortDescription: "Preview pasted HTML in a browser sandbox with scripts and external resources disabled.",
    category: "Developer Tools",
    status: "ready",
    icon: "FileCode2",
    estimatedStep: "Runs in your browser",
  },
  {
    slug: "merge-pdf",
    name: "Merge PDF",
    shortDescription: "Combine two to ten PDF files in the order you choose, up to 50 MB total.",
    category: "PDF Tools",
    status: "ready",
    icon: "FileCode2",
    estimatedStep: "Runs in your browser",
  },
  {
    slug: "split-pdf",
    name: "Split PDF",
    shortDescription: "Extract pages or ranges from a PDF into a new downloadable document.",
    category: "PDF Tools",
    status: "ready",
    icon: "FileCode2",
    estimatedStep: "Runs in your browser",
  },
  {
    slug: "rotate-pdf",
    name: "Rotate PDF",
    shortDescription: "Turn selected PDF pages 90, 180 or 270 degrees clockwise and download the full document.",
    category: "PDF Tools",
    status: "ready",
    icon: "FileCode2",
    estimatedStep: "Runs in your browser",
  },
  {
    slug: "pdf-to-jpg",
    name: "PDF to JPG",
    shortDescription: "Convert up to ten selected pages of a PDF to downloadable JPG images in your browser.",
    category: "PDF Tools",
    status: "ready",
    icon: "FileCode2",
    estimatedStep: "Runs in your browser",
  },
  {
    slug: "image-to-text",
    name: "Image to Text",
    shortDescription: "Extract editable English text from a JPG, PNG or WebP image in your browser.",
    category: "Image Tools",
    status: "ready",
    icon: "Type",
    estimatedStep: "Runs in your browser",
  },
  {
    slug: "page-speed-test",
    name: "Page Speed Test",
    shortDescription: "Run a Google Lighthouse lab test for a public URL and review performance metrics and suggestions.",
    category: "Page Analysis",
    status: "ready",
    icon: "BarChart3",
    estimatedStep: "Live URL check",
  },

  // ---------- Waiting for paid APIs ----------
  {
    slug: "da-pa-checker",
    name: "DA / PA Checker",
    shortDescription: "Explore the single and bulk input modes for a planned authority checker. Live scores are unavailable.",
    category: "Authority & Backlinks",
    status: "needs-api",
    icon: "BarChart3",
    estimatedStep: "ready",
  },
  {
    slug: "spam-score-checker",
    name: "Spam Score Checker",
    shortDescription: "Explore the planned single and bulk domain inputs. Live spam scores are unavailable.",
    category: "Authority & Backlinks",
    status: "needs-api",
    icon: "ShieldAlert",
    estimatedStep: "ready",
  },
  {
    slug: "google-index-checker",
    name: "Google Index Checker",
    shortDescription: "Explore the planned single and bulk URL workflow. Live Google indexing checks are unavailable.",
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

const workflowLinks: Partial<Record<string, string[]>> = {
  "meta-tag-generator": ["meta-tag-analyzer", "slug-generator"],
  "meta-tag-analyzer": ["meta-tag-generator", "heading-structure-checker", "alt-tag-checker"],
  "robots-txt-generator": ["xml-sitemap-generator", "meta-tag-analyzer"],
  "xml-sitemap-generator": ["robots-txt-generator", "hreflang-tag-generator"],
  "broken-link-checker": ["links-counter", "redirect-checker"],
  "redirect-checker": ["broken-link-checker", "is-it-down", "domain-hosting-checker"],
  "domain-hosting-checker": ["domain-age-checker", "is-it-down"],
  "page-speed-test": ["image-compressor", "image-converter"],
  "image-compressor": ["image-converter", "page-speed-test"],
  "image-to-text": ["word-counter", "case-converter"],
};

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

  const preferred = (workflowLinks[currentSlug] ?? []).flatMap(slug => {
    const tool = available.find(item => item.slug === slug);
    return tool ? [tool] : [];
  });

  return Array.from(new Set([...preferred, ...sameCategory, ...otherCategory])).slice(0, count);
}

/** Get distinct list of tool categories. */
export function getCategories(): string[] {
  return Array.from(new Set(tools.map((tool) => tool.category)));
}
