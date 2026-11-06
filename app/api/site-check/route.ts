import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { verifyTurnstile } from "@/lib/turnstile";
import { inspectHttpRoute, resolvePublicAddresses, validateUrlForSsrf } from "@/lib/ssrf";
import { lookupIpNetwork } from "@/lib/ip-network";
import { normalizeHttpUrl } from "@/lib/validators";
import { siteCheckModes } from "@/lib/site-checks";
import type { SiteCheckMode, SiteCheckResult } from "@/lib/site-checks";

export const runtime = "nodejs";

interface LighthouseResult {
  finalDisplayedUrl?: string;
  runtimeError?: { code?: string };
  categories?: { performance?: { score?: number | null } };
  audits?: Record<string, { title?: string; displayValue?: string; score?: number | null; details?: { type?: string } }>;
}

async function pageSpeed(url: URL, strategy: "mobile" | "desktop", key: string): Promise<SiteCheckResult> {
  const endpoint = new URL("https://www.googleapis.com/pagespeedonline/v5/runPagespeed");
  endpoint.search = new URLSearchParams({ url: url.href, strategy, key }).toString();
  const response = await fetch(endpoint, { signal: AbortSignal.timeout(20_000), redirect: "error", cache: "no-store" });
  if (response.status === 429) throw new Error("PageSpeed quota was reached. Try again later.");
  if (!response.ok) throw new Error("Google PageSpeed could not complete this test.");
  const { lighthouseResult: result } = await response.json() as { lighthouseResult?: LighthouseResult };
  const score = result?.categories?.performance?.score;
  if (!result || result.runtimeError || typeof score !== "number") throw new Error("Google PageSpeed did not return a performance score.");
  const entries = ["first-contentful-paint", "largest-contentful-paint", "total-blocking-time", "cumulative-layout-shift"]
    .flatMap(id => {
      const audit = result.audits?.[id];
      return audit?.title && audit.displayValue ? [{ label: audit.title, value: audit.displayValue }] : [];
    });
  const opportunities = Object.values(result.audits ?? {})
    .filter(audit => audit.details?.type === "opportunity" && typeof audit.score === "number" && audit.score < 0.9 && audit.title)
    .slice(0, 4)
    .map(audit => ({ label: audit.title!, value: audit.displayValue ?? "Review this Lighthouse suggestion." }));
  return {
    summary: `${strategy === "mobile" ? "Mobile" : "Desktop"} performance: ${Math.round(score * 100)}/100`,
    note: "Lighthouse lab result. Scores can vary between runs.",
    entries: [...(result.finalDisplayedUrl ? [{ label: "Tested URL", value: result.finalDisplayedUrl }] : []), ...entries, ...opportunities],
  };
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const mode = body?.mode as SiteCheckMode;
  if (!siteCheckModes.includes(mode) || typeof body?.url !== "string" || !body.url.trim() || body.url.length > 2048) {
    return NextResponse.json({ error: "Enter a URL up to 2,048 characters." }, { status: 400 });
  }

  let url: URL;
  try {
    const raw = body.url.trim();
    if (/^[a-z][a-z\d+.-]*:\/\//i.test(raw) && !/^https?:\/\//i.test(raw)) throw new Error();
    url = new URL(normalizeHttpUrl(raw));
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || url.port) throw new Error();
    url.hash = "";
  } catch {
    return NextResponse.json({ error: "Enter a valid HTTP or HTTPS URL without credentials or a custom port." }, { status: 400 });
  }

  const key = process.env.PAGESPEED_API_KEY?.trim();
  if (mode === "speed" && !key) {
    return NextResponse.json({ error: "Page Speed Test is temporarily unavailable." }, { status: 503 });
  }

  const limit = checkRateLimit(`site-check:${getClientIp(request)}`, 6, 60_000);
  if (!limit.success) {
    return NextResponse.json({ error: "Too many checks. Try again in a minute." }, {
      status: 429,
      headers: { "Retry-After": String(limit.reset) },
    });
  }
  const verification = await verifyTurnstile(body.turnstileToken, `site-check-${mode}`);
  if (!verification.success) return NextResponse.json({ error: verification.error }, { status: verification.status });

  try {
    if (mode === "speed") {
      await validateUrlForSsrf(url.href);
      return NextResponse.json(await pageSpeed(url, body.strategy === "desktop" ? "desktop" : "mobile", key!));
    }
    if (mode === "hosting") {
      const { hostname, addresses } = await resolvePublicAddresses(url.href);
      const record = await lookupIpNetwork(addresses[0]).catch(() => null);
      const result: SiteCheckResult = {
        summary: hostname,
        note: "These are public DNS and network registration details. A CDN or proxy can hide the origin host.",
        entries: [
          { label: "Public IPs", value: addresses.join(", ") },
          { label: "Network lookup IP", value: addresses[0] },
          { label: "Registered network", value: record?.organization || record?.network || "Unavailable" },
          ...(record?.country ? [{ label: "Registration country", value: record.country }] : []),
        ],
      };
      return NextResponse.json(result);
    }

    const { hops, issue } = await inspectHttpRoute(url.href);
    const last = hops[hops.length - 1];
    const result: SiteCheckResult = {
      summary: mode === "redirect"
        ? `${hops.length} HTTP ${hops.length === 1 ? "response" : "responses"} observed`
        : issue
          ? "The redirect chain did not complete"
          : last.status >= 500
            ? "The server returned an error"
            : last.status >= 400
              ? "The server responded, but this page returned an error"
              : "The page responded from our server",
      note: issue ?? (mode === "availability" ? "This is one check from our server. Results can differ by location." : undefined),
      hops,
    };
    return NextResponse.json(result);
  } catch (failure) {
    const message = failure instanceof Error ? failure.message : "";
    const known = /^(?:PageSpeed quota|Google PageSpeed|Target destination|Only standard)/.test(message);
    return NextResponse.json({
      error: known ? message : "The check could not reach the destination. It may be blocked, unavailable or too slow.",
    }, { status: 422 });
  }
}
