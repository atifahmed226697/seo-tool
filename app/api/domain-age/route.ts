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

/**
 * Calculates exact age in years, months, and days between two Date objects.
 */
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
    // Days in previous month
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

export async function POST(request: NextRequest) {
  try {
    // 1. Rate Limiting (10 req/min per IP)
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(clientIp, 10, 60 * 1000);
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: "Too many requests. Please wait a minute before checking another domain.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": rateLimit.reset.toString(),
          },
        }
      );
    }

    // 2. Parse & Validate Domain Input
    const body = await request.json().catch(() => null);
    if (!body || !body.domain || typeof body.domain !== "string") {
      return NextResponse.json(
        { error: "A valid domain name is required." },
        { status: 400 }
      );
    }

    const domain = cleanDomain(body.domain);
    if (!domain || !isValidDomain(domain)) {
      return NextResponse.json(
        {
          error:
            "Please provide a valid domain name (e.g., example.com, my-site.org).",
        },
        { status: 400 }
      );
    }

    // 3. Query Free RDAP Gateway (https://rdap.org/domain/{domain}) with 5s timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    let rdapData: any;
    try {
      const rdapUrl = `https://rdap.org/domain/${encodeURIComponent(domain)}`;
      const response = await fetch(rdapUrl, {
        method: "GET",
        signal: controller.signal,
        headers: {
          Accept: "application/rdap+json, application/json",
          "User-Agent": "SEOToolkit/1.0 (DomainAgeChecker; +https://seotoolkit.local)",
        },
      });

      if (response.status === 404) {
        return NextResponse.json(
          {
            error: `Domain "${domain}" was not found or is currently unregistered in RDAP records.`,
          },
          { status: 404 }
        );
      }

      if (response.status === 400) {
        return NextResponse.json(
          {
            error: `The TLD for "${domain}" is not supported or the RDAP query is invalid.`,
          },
          { status: 400 }
        );
      }

      if (!response.ok) {
        return NextResponse.json(
          {
            error: `RDAP lookup failed with status ${response.status}. The registry may be temporarily unavailable.`,
          },
          { status: 502 }
        );
      }

      rdapData = await response.json();
    } catch (fetchError: any) {
      if (fetchError.name === "AbortError") {
        return NextResponse.json(
          { error: "The RDAP registry took too long to respond (timeout after 5s)." },
          { status: 504 }
        );
      }
      return NextResponse.json(
        { error: "Failed to connect to the RDAP registry. Please check your internet connection." },
        { status: 502 }
      );
    } finally {
      clearTimeout(timeoutId);
    }

    // 4. Extract Events (Registration, Expiry, Last Changed)
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

    // 5. Extract Registrar Name
    let registrarName = "Unknown Registrar";
    if (Array.isArray(rdapData.entities)) {
      for (const entity of rdapData.entities) {
        const roles = Array.isArray(entity.roles)
          ? entity.roles.map((r: string) => r.toLowerCase())
          : [];
        if (roles.includes("registrar")) {
          // Attempt extraction from vcardArray
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
            registrarName = entity.handle;
          }
        }
      }
    }

    // 6. Compute Age
    let ageObj = null;
    if (registrationDateStr) {
      const regDate = new Date(registrationDateStr);
      if (!isNaN(regDate.getTime())) {
        ageObj = calculateDomainAge(regDate);
      }
    }

    const statusList = Array.isArray(rdapData.status) ? rdapData.status : [];

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
  } catch (err: any) {
    return NextResponse.json(
      { error: "An unexpected error occurred while retrieving domain age." },
      { status: 500 }
    );
  }
}
