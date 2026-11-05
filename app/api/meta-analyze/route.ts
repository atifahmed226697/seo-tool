import { verifyTurnstile } from "@/lib/turnstile";
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

    const verification = await verifyTurnstile(
      body.turnstileToken,
      "meta-analyze"
    );

    if (!verification.success) {
      return NextResponse.json(
        {
          code: verification.code,
          error: verification.error,
        },
        { status: verification.status }
      );
    }

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

    const title = $("title").first().text().trim();
    const titleLength = title.length;

    const description =
      $('meta[name="description"]').attr("content")?.trim() || "";
    const descriptionLength = description.length;

    const canonical = $('link[rel="canonical"]').attr("href")?.trim() || "";
    const robots = $('meta[name="robots"]').attr("content")?.trim() || "";
    const viewport = $('meta[name="viewport"]').attr("content")?.trim() || "";

    const h1List: string[] = [];
    $("h1").each((_, el) => {
      const text = $(el).text().trim();
      if (text) h1List.push(text);
    });
    const h1Count = $("h1").length;

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

    // Length bands are editorial guidance, not search engine limits.
    const lengthCheck = (
      label: string,
      length: number,
      min: number,
      max: number,
      missing: string
    ): AuditCheck => {
      if (length === 0) {
        return {
          label,
          value: "Missing",
          status: "warn",
          suggestion: missing,
        };
      }

      const withinGuide = length >= min && length <= max;
      return {
        label,
        value: length + " characters",
        status: withinGuide ? "pass" : "warn",
        suggestion: withinGuide
          ? "Within this tool's " + min + "-" + max +
            " character guide. Review relevance and clarity; search appearance can vary."
          : "Outside this tool's " + min + "-" + max +
            " character guide. This is not a search engine limit; review the wording and preview.",
      };
    };

    const titleCheck = lengthCheck(
      "Page Title",
      titleLength,
      30,
      60,
      "No title text found. Add a concise, descriptive title. Search engines may generate a title from other page content."
    );

    const descCheck = lengthCheck(
      "Meta Description",
      descriptionLength,
      70,
      160,
      "No meta description found. Consider a useful page summary. Search engines may use page content for snippets."
    );

    const h1Check: AuditCheck = {
      label: "H1 Heading",
      value: h1Count + " H1 tags found",
      status: h1Count === 1 && h1List.length === 1 ? "pass" : "warn",
      suggestion:
        h1Count === 0
          ? "No H1 found in the fetched HTML. Review whether the page has a clear main heading."
          : h1List.length < h1Count
            ? "At least one H1 has no text. Review the main heading and heading structure."
            : h1Count > 1
              ? "Multiple H1 tags found. Review whether they express a clear page structure; the count alone does not establish an SEO problem."
              : "One non-empty H1 found. Review whether it clearly describes the page topic.",
    };

    const canonicalCheck: AuditCheck = {
      label: "Canonical Tag",
      value: canonical ? "Present" : "Missing",
      status: canonical ? "pass" : "warn",
      suggestion: canonical
        ? "Canonical tag found. Verify its destination. It signals a preferred URL; its presence does not confirm the search engine's selection."
        : "No HTML canonical tag found. Consider specifying a preferred URL where appropriate. HTTP header canonicals are not checked.",
    };

    const ogImage = openGraph["og:image"] || twitter["twitter:image"] || "";
    const ogImageCheck: AuditCheck = {
      label: "Social Share Image",
      value: ogImage ? "Present" : "Missing",
      status: ogImage ? "pass" : "warn",
      suggestion: ogImage
        ? "A social image tag was found. Image access and platform requirements affect whether a preview appears."
        : "No og:image or twitter:image found. Consider adding a suitable image for link previews.",
    };

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
