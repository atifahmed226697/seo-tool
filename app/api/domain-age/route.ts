import { verifyTurnstile } from "@/lib/turnstile";
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { cleanDomain, isValidDomain } from "@/lib/validators";

export const runtime = "nodejs";

export interface DomainAgeResult {
  domain: string;
  registrationDate: string | null;
  expiryDate: string | null;
  lastUpdated: string | null;
  registrar: string;
  age: {
    years: number;
    months: number;
    days: number;
    totalDays: number;
    formatted: string;
  } | null;
  statusList: string[];
}

const NOT_PUBLISHED = "Not published by the registry";
const BOOTSTRAP_URL = "https://data.iana.org/rdap/dns.json";
const BOOTSTRAP_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/* ------------------------------------------------------------------ */
/* IANA RDAP bootstrap (cached in memory)                              */
/* ------------------------------------------------------------------ */

let bootstrapCache: { map: Map<string, string[]>; fetchedAt: number } | null =
  null;

async function getBootstrapMap(): Promise<Map<string, string[]> | null> {
  const now = Date.now();
  if (bootstrapCache && now - bootstrapCache.fetchedAt < BOOTSTRAP_TTL_MS) {
    return bootstrapCache.map;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(BOOTSTRAP_URL, {
      method: "GET",
      signal: controller.signal,
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error("bootstrap status " + res.status);

    const json: any = await res.json();
    const map = new Map<string, string[]>();

    if (Array.isArray(json.services)) {
      for (const service of json.services) {
        if (!Array.isArray(service) || service.length < 2) continue;
        const tlds: unknown = service[0];
        const urls: unknown = service[1];
        if (!Array.isArray(tlds) || !Array.isArray(urls)) continue;
        const cleanUrls = urls.filter((u): u is string => typeof u === "string");
        for (const tld of tlds) {
          if (typeof tld === "string") {
            map.set(tld.toLowerCase(), cleanUrls);
          }
        }
      }
    }

    bootstrapCache = { map, fetchedAt: now };
    return map;
  } catch {
    // If the fresh download fails, reuse the old list if we have one.
    if (bootstrapCache) return bootstrapCache.map;
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

/** Basic SSRF safety: only public https hostnames, never IPs or localhost. */
function isSafeRdapBase(rawUrl: string): boolean {
  try {
    const u = new URL(rawUrl);
    if (u.protocol !== "https:") return false;
    const host = u.hostname.toLowerCase();
    if (host === "localhost" || host.endsWith(".local")) return false;
    if (host.includes(":")) return false; // IPv6 literal
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return false; // IPv4 literal
    if (!host.includes(".")) return false;
    return true;
  } catch {
    return false;
  }
}

function pickRdapBase(urls: string[]): string | null {
  const safe = urls.filter(isSafeRdapBase);
  if (safe.length === 0) return null;
  const base = safe[0];
  return base.endsWith("/") ? base : base + "/";
}

/* ------------------------------------------------------------------ */
/* Age calculation                                                     */
/* ------------------------------------------------------------------ */

function calculateDomainAge(fromDate: Date, toDate: Date = new Date()): {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  formatted: string;
} {
  let years = toDate.getFullYear() - fromDate.getFullYear();
  let months = toDate.getMonth() - fromDate.getMonth();
  let days = toDate.getDate() - fromDate.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonthLastDay = new Date(
      toDate.getFullYear(),
      toDate.getMonth(),
      0
    ).getDate();
    days += prevMonthLastDay;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const diffTime = Math.max(0, toDate.getTime() - fromDate.getTime());
  const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  const parts: string[] = [];
  if (years > 0) parts.push(`${years} ${years === 1 ? "year" : "years"}`);
  if (months > 0) parts.push(`${months} ${months === 1 ? "month" : "months"}`);
  if (days > 0 || parts.length === 0)
    parts.push(`${days} ${days === 1 ? "day" : "days"}`);

  return {
    years: Math.max(0, years),
    months: Math.max(0, months),
    days: Math.max(0, days),
    totalDays,
    formatted: parts.join(", "),
  };
}

/* ------------------------------------------------------------------ */
/* Error helpers                                                       */
/* ------------------------------------------------------------------ */

function unavailableResponse(domain: string, tld: string) {
  return NextResponse.json(
    {
      code: "unavailable",
      error: `We couldn't retrieve public registration details for "${domain}". Some country extensions (like .${tld}) don't publish their records openly, so this domain's age can't be shown here.`,
    },
    { status: 422 }
  );
}

function temporaryResponse(status: number = 503) {
  return NextResponse.json(
    { code: "temporary", error: "Please try again in a minute." },
    { status }
  );
}

/* ------------------------------------------------------------------ */
/* Route                                                               */
/* ------------------------------------------------------------------ */

export async function POST(request: NextRequest) {
  try {
    // 1. Rate limiting (10 req/min per IP)
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(clientIp, 10, 60 * 1000);
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          code: "rate_limited",
          error:
            "Too many requests. Please wait a minute before checking another domain.",
        },
        {
          status: 429,
          headers: { "Retry-After": rateLimit.reset.toString() },
        }
      );
    }

    // 2. Parse and validate input
    const body = await request.json().catch(() => null);
    if (!body || !body.domain || typeof body.domain !== "string") {
      return NextResponse.json(
        { code: "invalid", error: "A valid domain name is required." },
        { status: 400 }
      );
    }

    const domain = cleanDomain(body.domain);
    if (!domain || !isValidDomain(domain)) {
      return NextResponse.json(
        {
          code: "invalid",
          error:
            "Please provide a valid domain name (e.g., example.com, my-site.org).",
        },
        { status: 400 }
      );
    }

    const verification = await verifyTurnstile(
      body.turnstileToken,
      "domain-age"
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

    const labels = domain.toLowerCase().split(".");
    const tld = labels[labels.length - 1];

    // 3. Does this extension have a public RDAP server?
    const bootstrap = await getBootstrapMap();
    if (!bootstrap) {
      return temporaryResponse(503);
    }

    const serverUrls = bootstrap.get(tld);
    if (!serverUrls || serverUrls.length === 0) {
      return unavailableResponse(domain, tld);
    }

    const baseUrl = pickRdapBase(serverUrls);
    if (!baseUrl) {
      return unavailableResponse(domain, tld);
    }

    // 4. Ask the registry directly (8s timeout)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    let rdapData: any;
    try {
      const rdapUrl = `${baseUrl}domain/${encodeURIComponent(domain)}`;
      const response = await fetch(rdapUrl, {
        method: "GET",
        signal: controller.signal,
        cache: "no-store",
        headers: {
          Accept: "application/rdap+json, application/json",
          "User-Agent":
            "SEOToolkit/1.0 (DomainAgeChecker; +https://seotoolkit.local)",
        },
      });

      if (response.status === 404) {
        // The registry itself says this domain does not exist.
        return NextResponse.json(
          {
            code: "not_registered",
            error: `"${domain}" is not registered. The registry confirms this domain name does not exist.`,
          },
          { status: 404 }
        );
      }

      if (response.status === 429 || response.status >= 500) {
        return temporaryResponse(503);
      }

      if (!response.ok) {
        // 400, 401, 403 and similar: registry will not give us this data.
        return unavailableResponse(domain, tld);
      }

      rdapData = await response.json().catch(() => null);
      if (!rdapData || typeof rdapData !== "object") {
        return unavailableResponse(domain, tld);
      }
    } catch (fetchError: any) {
      if (fetchError?.name === "AbortError") {
        return temporaryResponse(504);
      }
      return temporaryResponse(502);
    } finally {
      clearTimeout(timeoutId);
    }

    // 5. Extract events (registration, expiry, last changed)
    let registrationDateStr: string | null = null;
    let expiryDateStr: string | null = null;
    let lastUpdatedStr: string | null = null;

    if (Array.isArray(rdapData.events)) {
      for (const event of rdapData.events) {
        const action = (event.eventAction || "").toLowerCase();
        const date = event.eventDate || null;
        if (!date) continue;

        if (
          action === "registration" ||
          action === "created" ||
          action === "transfer"
        ) {
          if (!registrationDateStr) registrationDateStr = date;
        } else if (
          action === "expiration" ||
          action === "expiration date" ||
          action === "renew"
        ) {
          if (!expiryDateStr) expiryDateStr = date;
        } else if (
          action === "last changed" ||
          action === "last update" ||
          action === "last updated"
        ) {
          if (!lastUpdatedStr) lastUpdatedStr = date;
        }
      }
    }

    // 6. Extract registrar name
    let registrarName = NOT_PUBLISHED;
    if (Array.isArray(rdapData.entities)) {
      for (const entity of rdapData.entities) {
        const roles = Array.isArray(entity.roles)
          ? entity.roles.map((r: string) => r.toLowerCase())
          : [];
        if (roles.includes("registrar")) {
          if (
            Array.isArray(entity.vcardArray) &&
            Array.isArray(entity.vcardArray[1])
          ) {
            const fnItem = entity.vcardArray[1].find(
              (prop: any) => Array.isArray(prop) && prop[0] === "fn"
            );
            if (fnItem && typeof fnItem[3] === "string" && fnItem[3].trim()) {
              registrarName = fnItem[3].trim();
              break;
            }
          }
          if (entity.handle) {
            registrarName = String(entity.handle);
          }
        }
      }
    }

    // 7. Compute age (only if a real registration date exists)
    let ageObj = null;
    if (registrationDateStr) {
      const regDate = new Date(registrationDateStr);
      if (!isNaN(regDate.getTime())) {
        ageObj = calculateDomainAge(regDate);
      }
    }

    const statusList: string[] = Array.isArray(rdapData.status)
      ? rdapData.status.filter((s: unknown) => typeof s === "string")
      : [];

    const result: DomainAgeResult = {
      domain,
      registrationDate: registrationDateStr,
      expiryDate: expiryDateStr,
      lastUpdated: lastUpdatedStr,
      registrar: registrarName,
      age: ageObj,
      statusList,
    };

    return NextResponse.json(result, { status: 200 });
  } catch {
    return NextResponse.json(
      {
        code: "server_error",
        error: "An unexpected error occurred while retrieving domain age.",
      },
      { status: 500 }
    );
  }
}