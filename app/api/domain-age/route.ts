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


function calculateDomainAge(
  fromDate: Date,
  toDate: Date = new Date()
): DomainAgeResult["age"] {
  if (
    !Number.isFinite(fromDate.getTime()) ||
    !Number.isFinite(toDate.getTime()) ||
    fromDate.getTime() > toDate.getTime()
  ) {
    return null;
  }

  // Use UTC calendar dates consistently with the displayed dates.
  const start = Date.UTC(
    fromDate.getUTCFullYear(),
    fromDate.getUTCMonth(),
    fromDate.getUTCDate()
  );
  const end = Date.UTC(
    toDate.getUTCFullYear(),
    toDate.getUTCMonth(),
    toDate.getUTCDate()
  );

  // Clamp anniversaries to the last valid day of the target month.
  const anniversary = (offset: number): number => {
    const first = new Date(Date.UTC(
      fromDate.getUTCFullYear(),
      fromDate.getUTCMonth() + offset,
      1
    ));
    const lastDay = new Date(Date.UTC(
      first.getUTCFullYear(),
      first.getUTCMonth() + 1,
      0
    )).getUTCDate();

    return Date.UTC(
      first.getUTCFullYear(),
      first.getUTCMonth(),
      Math.min(fromDate.getUTCDate(), lastDay)
    );
  };

  let wholeMonths =
    (toDate.getUTCFullYear() - fromDate.getUTCFullYear()) * 12 +
    toDate.getUTCMonth() - fromDate.getUTCMonth();

  if (anniversary(wholeMonths) > end) wholeMonths -= 1;

  const years = Math.floor(wholeMonths / 12);
  const months = wholeMonths % 12;
  const days = Math.round((end - anniversary(wholeMonths)) / 86400000);
  const totalDays = Math.round((end - start) / 86400000);

  const parts: string[] = [];
  if (years) parts.push(years + (years === 1 ? " year" : " years"));
  if (months) parts.push(months + (months === 1 ? " month" : " months"));
  if (days || !parts.length) {
    parts.push(days + (days === 1 ? " day" : " days"));
  }

  return { years, months, days, totalDays, formatted: parts.join(", ") };
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
            error: `No registration record was returned for "${domain}". This does not confirm that the name is available to register.`,
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


    // Use only matching RDAP events; transfers and renewals are distinct.
    const events = Array.isArray(rdapData.events) ? rdapData.events : [];

    const pickEventDate = (
      action: string,
      newest: boolean,
      allowFuture: boolean
    ): string | null => {
      const dates: number[] = [];
      for (const event of events) {
        if (
          !event ||
          typeof event.eventAction !== "string" ||
          event.eventAction.trim().toLowerCase() !== action ||
          typeof event.eventDate !== "string"
        ) continue;

        const time = Date.parse(event.eventDate);
        if (!Number.isFinite(time)) continue;
        if (!allowFuture && time > Date.now()) continue;
        dates.push(time);
      }

      if (!dates.length) return null;
      dates.sort((a, b) => a - b);
      return new Date(newest ? dates[dates.length - 1] : dates[0]).toISOString();
    };

    const registrationDateStr = pickEventDate("registration", false, false);
    const expiryDateStr = pickEventDate("expiration", true, true);
    const lastUpdatedStr = pickEventDate("last changed", true, false);

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