/**
 * Pure, typed utility functions for generating, validating, and escaping SEO meta tags.
 */

export interface MetaTagFormData {
  title: string;
  description: string;
  keywords: string;
  robots: "index,follow" | "noindex,follow" | "index,nofollow" | "noindex,nofollow" | "";
  canonical: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogUrl: string;
  ogType: string;
  twitterCard: "summary_large_image" | "summary" | "app" | "player" | "";
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  twitterSite: string;
}

export const initialMetaTagData: MetaTagFormData = {
  title: "",
  description: "",
  keywords: "",
  robots: "index,follow",
  canonical: "",
  ogTitle: "",
  ogDescription: "",
  ogImage: "",
  ogUrl: "",
  ogType: "website",
  twitterCard: "summary_large_image",
  twitterTitle: "",
  twitterDescription: "",
  twitterImage: "",
  twitterSite: "",
};

/**
 * Escape quotes and special characters (&, <, >, ", ') to prevent XSS / markup breakage
 */
export function escapeHtml(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Validates whether an optional URL starts with http:// or https://
 */
export function validateHttpUrl(url: string): { isValid: boolean; error?: string } {
  const trimmed = url.trim();
  if (!trimmed) {
    return { isValid: true };
  }

  if (!/^https?:\/\//i.test(trimmed)) {
    return {
      isValid: false,
      error: "URL must start with http:// or https://",
    };
  }

  return { isValid: true };
}

/**
 * Evaluates Title length health:
 * - 0 chars: neutral
 * - 1 - 60: ideal (green)
 * - 61 - 70: warning (yellow)
 * - >70: too long (red)
 */
export function getTitleHealth(length: number): {
  colorClass: string;
  statusText: string;
} {
  if (length === 0) {
    return { colorClass: "text-slate-400", statusText: "Ideal: 50-60 characters" };
  }
  if (length <= 60) {
    return { colorClass: "text-emerald-600 dark:text-emerald-400 font-semibold", statusText: "Optimal length" };
  }
  if (length <= 70) {
    return { colorClass: "text-amber-600 dark:text-amber-400 font-semibold", statusText: "Acceptable, near limit" };
  }
  return { colorClass: "text-rose-600 dark:text-rose-400 font-semibold", statusText: "Too long (Google may truncate)" };
}

/**
 * Evaluates Description length health:
 * - 0 chars: neutral
 * - 1 - 160: ideal (green)
 * - 161 - 180: warning (yellow)
 * - >180: too long (red)
 */
export function getDescriptionHealth(length: number): {
  colorClass: string;
  statusText: string;
} {
  if (length === 0) {
    return { colorClass: "text-slate-400", statusText: "Ideal: 120-160 characters" };
  }
  if (length <= 160) {
    return { colorClass: "text-emerald-600 dark:text-emerald-400 font-semibold", statusText: "Optimal length" };
  }
  if (length <= 180) {
    return { colorClass: "text-amber-600 dark:text-amber-400 font-semibold", statusText: "Acceptable, near limit" };
  }
  return { colorClass: "text-rose-600 dark:text-rose-400 font-semibold", statusText: "Too long (Google may truncate)" };
}

/**
 * Pure generator: constructs HTML <meta> tags skipping empty fields
 */
export function generateMetaTags(data: MetaTagFormData): string {
  const primaryTags: string[] = [];
  const ogTags: string[] = [];
  const twitterTags: string[] = [];

  // 1. Primary SEO Tags
  if (data.title.trim()) {
    const esc = escapeHtml(data.title.trim());
    primaryTags.push(`<title>${esc}</title>`);
    primaryTags.push(`<meta name="title" content="${esc}" />`);
  }

  if (data.description.trim()) {
    primaryTags.push(`<meta name="description" content="${escapeHtml(data.description.trim())}" />`);
  }

  if (data.keywords.trim()) {
    primaryTags.push(`<meta name="keywords" content="${escapeHtml(data.keywords.trim())}" />`);
  }

  if (data.robots.trim()) {
    primaryTags.push(`<meta name="robots" content="${escapeHtml(data.robots.trim())}" />`);
  }

  if (data.canonical.trim()) {
    primaryTags.push(`<link rel="canonical" href="${escapeHtml(data.canonical.trim())}" />`);
  }

  // 2. Open Graph Tags
  const ogTitle = data.ogTitle.trim() || data.title.trim();
  const ogDesc = data.ogDescription.trim() || data.description.trim();
  const ogUrl = data.ogUrl.trim() || data.canonical.trim();

  if (data.ogType.trim() && (ogTitle || ogDesc || ogUrl || data.ogImage.trim())) {
    ogTags.push(`<meta property="og:type" content="${escapeHtml(data.ogType.trim())}" />`);
  }

  if (ogUrl) {
    ogTags.push(`<meta property="og:url" content="${escapeHtml(ogUrl)}" />`);
  }

  if (ogTitle) {
    ogTags.push(`<meta property="og:title" content="${escapeHtml(ogTitle)}" />`);
  }

  if (ogDesc) {
    ogTags.push(`<meta property="og:description" content="${escapeHtml(ogDesc)}" />`);
  }

  if (data.ogImage.trim()) {
    ogTags.push(`<meta property="og:image" content="${escapeHtml(data.ogImage.trim())}" />`);
  }

  // 3. Twitter Card Tags
  const twTitle = data.twitterTitle.trim() || ogTitle;
  const twDesc = data.twitterDescription.trim() || ogDesc;
  const twImage = data.twitterImage.trim() || data.ogImage.trim();

  if (data.twitterCard.trim() && (twTitle || twDesc || twImage || data.twitterSite.trim())) {
    twitterTags.push(`<meta name="twitter:card" content="${escapeHtml(data.twitterCard.trim())}" />`);
  }

  if (ogUrl) {
    twitterTags.push(`<meta name="twitter:url" content="${escapeHtml(ogUrl)}" />`);
  }

  if (twTitle) {
    twitterTags.push(`<meta name="twitter:title" content="${escapeHtml(twTitle)}" />`);
  }

  if (twDesc) {
    twitterTags.push(`<meta name="twitter:description" content="${escapeHtml(twDesc)}" />`);
  }

  if (twImage) {
    twitterTags.push(`<meta name="twitter:image" content="${escapeHtml(twImage)}" />`);
  }

  if (data.twitterSite.trim()) {
    twitterTags.push(`<meta name="twitter:site" content="${escapeHtml(data.twitterSite.trim())}" />`);
  }

  const sections: string[] = [];

  if (primaryTags.length > 0) {
    sections.push(`<!-- Primary Meta Tags -->\n${primaryTags.join("\n")}`);
  }

  if (ogTags.length > 0) {
    sections.push(`<!-- Open Graph / Facebook -->\n${ogTags.join("\n")}`);
  }

  if (twitterTags.length > 0) {
    sections.push(`<!-- Twitter Card -->\n${twitterTags.join("\n")}`);
  }

  if (sections.length === 0) {
    return "<!-- Fill out the form above to generate clean HTML meta tags -->";
  }

  return sections.join("\n\n");
}
