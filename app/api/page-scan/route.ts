import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { safeFetchHtml, validateUrlForSsrf } from "@/lib/ssrf";
import { normalizeHttpUrl } from "@/lib/validators";

export const runtime = "nodejs";

type Mode = "headings" | "links" | "images" | "broken";

interface LinkItem {
  href: string;
  text: string;
  type: "internal" | "external";
  nofollow: boolean;
}

/** Checks one link and returns its HTTP status (0 = failed to load). */
async function checkLink(url: string): Promise<number> {
  try {
    await validateUrlForSsrf(url);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    let res = await fetch(url, { method: "HEAD", redirect: "follow", signal: controller.signal });
    if (res.status === 405 || res.status === 403) {
      res = await fetch(url, { method: "GET", redirect: "follow", signal: controller.signal });
    }
    clearTimeout(timer);
    return res.status;
  } catch {
    return 0;
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const limit = checkRateLimit(ip, 10, 60 * 1000);
    if (!limit.success) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a minute and try again." },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body.url !== "string" || typeof body.mode !== "string") {
      return NextResponse.json({ error: "A valid URL is required." }, { status: 400 });
    }

    const mode = body.mode as Mode;
    if (!["headings", "links", "images", "broken"].includes(mode)) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const pageUrl = normalizeHttpUrl(body.url);

    let html: string;
    try {
      html = await safeFetchHtml(pageUrl, 5000, 2 * 1024 * 1024);
    } catch (e: any) {
      return NextResponse.json(
        { error: e?.message || "Unable to load that page. Make sure it is public." },
        { status: 422 }
      );
    }

    const $ = cheerio.load(html);
    const base = new URL(pageUrl);

    // ---------- Headings ----------
    if (mode === "headings") {
      const headings: { level: number; text: string }[] = [];
      $("h1, h2, h3, h4, h5, h6").each((_, el) => {
        const tag = (el as any).tagName || (el as any).name || "h1";
        headings.push({ level: Number(tag.replace("h", "")), text: $(el).text().trim().replace(/\s+/g, " ") });
      });
      return NextResponse.json({ url: pageUrl, headings });
    }

    // ---------- Images (alt tags) ----------
    if (mode === "images") {
      const images: { src: string; alt: string | null }[] = [];
      $("img").each((_, el) => {
        const src = $(el).attr("src") || $(el).attr("data-src") || "";
        if (!src) return;
        let abs = src;
        try {
          abs = new URL(src, base).toString();
        } catch {
          /* keep as is */
        }
        const alt = $(el).attr("alt");
        images.push({ src: abs, alt: alt === undefined ? null : alt });
      });
      return NextResponse.json({ url: pageUrl, images: images.slice(0, 300) });
    }

    // ---------- Links (used by links + broken) ----------
    const links: LinkItem[] = [];
    $("a[href]").each((_, el) => {
      const href = ($(el).attr("href") || "").trim();
      if (!href || href.startsWith("#") || /^(mailto:|tel:|javascript:)/i.test(href)) return;
      let abs: URL;
      try {
        abs = new URL(href, base);
      } catch {
        return;
      }
      if (abs.protocol !== "http:" && abs.protocol !== "https:") return;
      const rel = ($(el).attr("rel") || "").toLowerCase();
      links.push({
        href: abs.toString(),
        text: $(el).text().trim().replace(/\s+/g, " ").slice(0, 80),
        type: abs.hostname === base.hostname ? "internal" : "external",
        nofollow: rel.includes("nofollow"),
      });
    });

    if (mode === "links") {
      return NextResponse.json({ url: pageUrl, links: links.slice(0, 500) });
    }

    // ---------- Broken link check (max 25 unique links) ----------
    const unique = Array.from(new Set(links.map((l) => l.href))).slice(0, 25);
    const results = await Promise.all(
      unique.map(async (href) => ({ href, status: await checkLink(href) }))
    );
    return NextResponse.json({
      url: pageUrl,
      checked: results.length,
      totalFound: new Set(links.map((l) => l.href)).size,
      results,
    });
  } catch {
    return NextResponse.json({ error: "Something went wrong while scanning the page." }, { status: 500 });
  }
}