import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { safeFetchHtml } from "@/lib/ssrf";
import { normalizeHttpUrl } from "@/lib/validators";

export const runtime = "nodejs";

export type AuditStatus = "pass" | "warn" | "fail";

export interface AuditCheck {
  label: string;
  value: string | number;
  status: AuditStatus;
  suggestion: string;
}

export interface MetaAnalysisResult {
  url: string;
  title: string;
  titleLength: number;
  description: string;
  descriptionLength: number;
  canonical: string;
  robots: string;
  viewport: string;
  h1Count: number;
  h1List: string[];
  openGraph: Record<string, string>;
  twitter: Record<string, string>;
  checks: {
    title: AuditCheck;
    description: AuditCheck;
    h1: AuditCheck;
    canonical: AuditCheck;
    ogImage: AuditCheck;
  };
}

export async function POST(request: NextRequest) {
  try {
    // 1. Rate limiting (10 req/min per IP)
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(clientIp, 10, 60 * 1000);
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: "Too many requests. Please wait a minute before analyzing another URL.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": rateLimit.reset.toString(),
          },
        }
      );
    }

    // 2. Validate request body
    const body = await request.json().catch(() => null);
    if (!body || !body.url || typeof body.url !== "string") {
      return NextResponse.json(
        { error: "A valid URL parameter is required." },
        { status: 400 }
      );
    }

    const normalizedUrl = normalizeHttpUrl(body.url);

    // 3. SSRF safe fetch with 5s timeout & 2MB max response
    let html: string;
    try {
      html = await safeFetchHtml(normalizedUrl, 5000, 2 * 1024 * 1024);
    } catch (fetchError: any) {
      return NextResponse.json(
        {
          error:
            fetchError.message ||
            "Unable to analyze the specified webpage. Please ensure it is publicly reachable.",
        },
        { status: 422 }
      );
    }

    // 4. Parse with Cheerio
    const $ = cheerio.load(html);

    const title =
      $("title").first().text().trim() ||
      $('meta[property="og:title"]').attr("content")?.trim() ||
      "";
    const titleLength = title.length;

    const description =
      $('meta[name="description"]').attr("content")?.trim() ||
      $('meta[property="og:description"]').attr("content")?.trim() ||
      "";
    const descriptionLength = description.length;

    const canonical = $('link[rel="canonical"]').attr("href")?.trim() || "";
    const robots = $('meta[name="robots"]').attr("content")?.trim() || "";
    const viewport = $('meta[name="viewport"]').attr("content")?.trim() || "";

    const h1List: string[] = [];
    $("h1").each((_, el) => {
      const text = $(el).text().trim();
      if (text) h1List.push(text);
    });
    const h1Count = h1List.length;

    // Collect Open Graph metadata
    const openGraph: Record<string, string> = {};
    $('meta[property^="og:"]').each((_, el) => {
      const prop = $(el).attr("property");
      const content = $(el).attr("content");
      if (prop && content) {
        openGraph[prop] = content.trim();
      }
    });

    // Collect Twitter metadata
    const twitter: Record<string, string> = {};
    $('meta[name^="twitter:"], meta[property^="twitter:"]').each((_, el) => {
      const name = $(el).attr("name") || $(el).attr("property");
      const content = $(el).attr("content");
      if (name && content) {
        twitter[name] = content.trim();
      }
    });

    // 5. Build Audit Status Checks
    // Check Title (Ideal 30 - 60 chars)
    let titleCheck: AuditCheck;
    if (titleLength === 0) {
      titleCheck = {
        label: "Page Title",
        value: "Missing",
        status: "fail",
        suggestion: "Missing title tag. Search engines require a title to rank and display your webpage.",
      };
    } else if (titleLength >= 30 && titleLength <= 60) {
      titleCheck = {
        label: "Page Title",
        value: `${titleLength} characters`,
        status: "pass",
        suggestion: "Optimal length (30-60 characters). Displays properly in Google SERPs.",
      };
    } else if (titleLength < 30) {
      titleCheck = {
        label: "Page Title",
        value: `${titleLength} characters`,
        status: "warn",
        suggestion: "Title is brief. Expanding to 30-60 characters helps target more relevant keywords.",
      };
    } else if (titleLength <= 70) {
      titleCheck = {
        label: "Page Title",
        value: `${titleLength} characters`,
        status: "warn",
        suggestion: "Title is near Google's pixel limit (60-70 characters) and may truncate on mobile.",
      };
    } else {
      titleCheck = {
        label: "Page Title",
        value: `${titleLength} characters`,
        status: "fail",
        suggestion: "Title exceeds 70 characters and will be cut off by search engines.",
      };
    }

    // Check Description (Ideal 70 - 160 chars)
    let descCheck: AuditCheck;
    if (descriptionLength === 0) {
      descCheck = {
        label: "Meta Description",
        value: "Missing",
        status: "fail",
        suggestion: "Missing meta description. Google will generate automated snippets from page body.",
      };
    } else if (descriptionLength >= 70 && descriptionLength <= 160) {
      descCheck = {
        label: "Meta Description",
        value: `${descriptionLength} characters`,
        status: "pass",
        suggestion: "Optimal length (70-160 characters). Captures user intent without truncation.",
      };
    } else if (descriptionLength < 70) {
      descCheck = {
        label: "Meta Description",
        value: `${descriptionLength} characters`,
        status: "warn",
        suggestion: "Description is under 70 characters. Provide more context to increase search CTR.",
      };
    } else if (descriptionLength <= 180) {
      descCheck = {
        label: "Meta Description",
        value: `${descriptionLength} characters`,
        status: "warn",
        suggestion: "Description is slightly long and may truncate on narrower mobile screens.",
      };
    } else {
      descCheck = {
        label: "Meta Description",
        value: `${descriptionLength} characters`,
        status: "fail",
        suggestion: "Description exceeds 180 characters and will be truncated in search snippets.",
      };
    }

    // Check H1 Count (Exactly 1 H1)
    let h1Check: AuditCheck;
    if (h1Count === 1) {
      h1Check = {
        label: "H1 Heading",
        value: "1 H1 tag found",
        status: "pass",
        suggestion: "Optimal structure. Exactly one primary H1 heading provides clear topical hierarchy.",
      };
    } else if (h1Count > 1) {
      h1Check = {
        label: "H1 Heading",
        value: `${h1Count} H1 tags found`,
        status: "warn",
        suggestion: `Found ${h1Count} H1 headings. Best practice is a single H1 to avoid diluting topical focus.`,
      };
    } else {
      h1Check = {
        label: "H1 Heading",
        value: "0 H1 tags found",
        status: "fail",
        suggestion: "No H1 heading found. Add an H1 tag to establish the main topic of your page.",
      };
    }

    // Check Canonical Tag
    let canonicalCheck: AuditCheck;
    if (canonical) {
      canonicalCheck = {
        label: "Canonical Tag",
        value: "Present",
        status: "pass",
        suggestion: "Canonical link is specified, preventing duplicate content dilution.",
      };
    } else {
      canonicalCheck = {
        label: "Canonical Tag",
        value: "Missing",
        status: "warn",
        suggestion: "No canonical tag found. Add <link rel=\"canonical\"> to designate original source.",
      };
    }

    // Check Open Graph Image
    const ogImage = openGraph["og:image"] || twitter["twitter:image"] || "";
    let ogImageCheck: AuditCheck;
    if (ogImage) {
      ogImageCheck = {
        label: "Social Share Image",
        value: "Present",
        status: "pass",
        suggestion: "Open Graph image specified. Social media posts will feature rich banner previews.",
      };
    } else {
      ogImageCheck = {
        label: "Social Share Image",
        value: "Missing",
        status: "warn",
        suggestion: "No og:image tag found. Social shares will display as plain text without preview image.",
      };
    }

    const result: MetaAnalysisResult = {
      url: normalizedUrl,
      title,
      titleLength,
      description,
      descriptionLength,
      canonical,
      robots,
      viewport,
      h1Count,
      h1List,
      openGraph,
      twitter,
      checks: {
        title: titleCheck,
        description: descCheck,
        h1: h1Check,
        canonical: canonicalCheck,
        ogImage: ogImageCheck,
      },
    };

    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "An unexpected error occurred while analyzing the webpage." },
      { status: 500 }
    );
  }
}
