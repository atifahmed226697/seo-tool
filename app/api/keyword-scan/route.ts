import { verifyTurnstile } from "@/lib/turnstile";
import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { safeFetchHtml } from "@/lib/ssrf";
import { isValidHttpUrl, normalizeHttpUrl } from "@/lib/validators";

export const runtime = "nodejs";

// Keep the response small: very long pages are cut at this many characters.
const MAX_BODY_CHARS = 150_000;

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const limit = checkRateLimit(`keyword-scan:${ip}`, 10, 60 * 1000);
    if (!limit.success) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a minute and try again." },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body.url !== "string" || !body.url.trim()) {
      return NextResponse.json({ error: "A valid URL is required." }, { status: 400 });
    }

    const pageUrl = normalizeHttpUrl(body.url);
    if (!isValidHttpUrl(pageUrl)) {
      return NextResponse.json({ error: "Please enter a valid URL." }, { status: 400 });
    }

    // Fetch the page (SSRF checks, timeout and size limit live in safeFetchHtml)
    const verification = await verifyTurnstile(
      body.turnstileToken,
      "keyword-scan"
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

    const started = Date.now();
    let html: string;
    try {
      html = await safeFetchHtml(pageUrl, 5000, 2 * 1024 * 1024);
    } catch (e: any) {
      return NextResponse.json(
        { error: e?.message || "Unable to load that page. Make sure it is public." },
        { status: 422 }
      );
    }
    const loadSeconds = Number(((Date.now() - started) / 1000).toFixed(2));

    const $ = cheerio.load(html);

    const title = $("title").first().text().trim().replace(/\s+/g, " ");
    const description = ($('meta[name="description"]').attr("content") || "")
      .trim()
      .replace(/\s+/g, " ");

    const headings: string[] = [];
    $("h1, h2, h3, h4, h5, h6").each((_, el) => {
      const text = $(el).text().trim().replace(/\s+/g, " ");
      if (text) headings.push(text);
    });

    const altTexts: string[] = [];
    $("img[alt]").each((_, el) => {
      const alt = ($(el).attr("alt") || "").trim().replace(/\s+/g, " ");
      if (alt) altTexts.push(alt);
    });

    // Remove things that are not readable text, then keep words apart
    $("script, style, noscript, template, svg, iframe").remove();
    $("br").replaceWith(" ");
    $(
      "p, div, li, h1, h2, h3, h4, h5, h6, td, th, tr, section, article, header, footer, aside, blockquote, pre, dt, dd, figcaption, label, button, option"
    ).append(" ");

    let bodyText = $("body").text().replace(/\s+/g, " ").trim();
    if (bodyText.length > MAX_BODY_CHARS) {
      bodyText = bodyText.slice(0, MAX_BODY_CHARS);
    }

    return NextResponse.json({
      url: pageUrl,
      loadSeconds,
      title,
      description,
      headings: headings.slice(0, 200),
      altTexts: altTexts.slice(0, 300),
      bodyText,
    });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong while scanning the page." },
      { status: 500 }
    );
  }
}