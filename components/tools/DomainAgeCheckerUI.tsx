"use client";

import { useState } from "react";
import { TurnstileWidget } from "@/components/TurnstileWidget";
import {
  Search,
  Loader2,
  AlertCircle,
  Info,
  Clock,
  Copy,
  Check,
} from "lucide-react";

interface DomainAgeResult {
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

type ErrorKind = "unavailable" | "not_registered" | "temporary" | "other";

interface ErrorState {
  kind: ErrorKind;
  message: string;
}

const NOT_PUBLISHED = "Not published by the registry";

const labelClass =
  "text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300";
const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 placeholder-slate-400 outline-none transition-colors focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100";

/** Format an ISO date string into a readable date. */
function formatDate(value: string | null): string {
  if (!value) return NOT_PUBLISHED;
  const d = new Date(value);
  if (isNaN(d.getTime())) return NOT_PUBLISHED;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

/** Short note about how far away the expiry date is. */

function expiryNote(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return null;

  const now = new Date();
  const expiryDay = Date.UTC(
    date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()
  );
  const today = Date.UTC(
    now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()
  );
  const days = Math.round((expiryDay - today) / 86400000);

  if (days < 0) {
    return "Reported expiry date passed " +
      Math.abs(days).toLocaleString() + " days ago";
  }
  if (days === 0) return "Reported expiry date is today";
  return days.toLocaleString() + " days until reported expiry";
}

type Tone = "good" | "warn" | "neutral";

interface StatusInfo {
  label: string;
  explain: string;
  tone: Tone;
}

/** Turn a raw registry status code into a plain-English explanation. */
function describeStatus(raw: string): StatusInfo {
  const key = raw.toLowerCase().replace(/[\s_-]/g, "");

  const known: Record<string, StatusInfo> = {
    active: {
      label: "Active",
      explain: "The registry reports this registration status. Website and email availability are not checked.",
      tone: "good",
    },
    ok: {
      label: "OK",
      explain: "The registry reports this registration status. Website and email availability are not checked.",
      tone: "good",
    },
    clienttransferprohibited: {
      label: "Transfer locked",
      explain:
        "The registrar has locked this domain so it cannot be moved to another registrar by mistake.",
      tone: "good",
    },
    clientdeleteprohibited: {
      label: "Delete locked",
      explain: "The registrar has locked this domain against accidental deletion.",
      tone: "good",
    },
    clientupdateprohibited: {
      label: "Update locked",
      explain: "The registrar has locked this domain against unwanted changes.",
      tone: "good",
    },
    clientrenewprohibited: {
      label: "Renewal locked",
      explain: "The registrar does not currently allow this domain to be renewed.",
      tone: "warn",
    },
    servertransferprohibited: {
      label: "Transfer locked by registry",
      explain: "The registry has locked this domain so it cannot be transferred.",
      tone: "good",
    },
    serverdeleteprohibited: {
      label: "Delete locked by registry",
      explain: "The registry has locked this domain against deletion.",
      tone: "good",
    },
    serverupdateprohibited: {
      label: "Update locked by registry",
      explain: "The registry has locked this domain against changes.",
      tone: "good",
    },
    serverrenewprohibited: {
      label: "Renewal locked by registry",
      explain: "The registry does not currently allow this domain to be renewed.",
      tone: "warn",
    },
    clienthold: {
      label: "On hold (registrar)",
      explain:
        "The registrar has paused this domain, so the website and email may not work.",
      tone: "warn",
    },
    serverhold: {
      label: "On hold (registry)",
      explain:
        "The registry has paused this domain, so the website and email may not work.",
      tone: "warn",
    },
    inactive: {
      label: "Inactive",
      explain: "The domain is registered but has no name servers, so it is not in use.",
      tone: "warn",
    },
    redemptionperiod: {
      label: "Redemption period",
      explain:
        "The domain has expired and is in a grace window. The owner can still recover it, usually for an extra fee.",
      tone: "warn",
    },
    pendingdelete: {
      label: "Pending delete",
      explain: "The domain is about to be deleted and may become available again soon.",
      tone: "warn",
    },
    pendingtransfer: {
      label: "Transfer in progress",
      explain: "The domain is currently being moved to another registrar.",
      tone: "neutral",
    },
    pendingcreate: {
      label: "Registration pending",
      explain: "The registration is still being processed.",
      tone: "neutral",
    },
    pendingrenew: {
      label: "Renewal pending",
      explain: "A renewal is being processed.",
      tone: "neutral",
    },
    pendingrestore: {
      label: "Restore pending",
      explain: "A request to restore this domain is being processed.",
      tone: "neutral",
    },
    pendingupdate: {
      label: "Update pending",
      explain: "A change to this domain is being processed.",
      tone: "neutral",
    },
    addperiod: {
      label: "New registration period",
      explain: "The domain was registered very recently.",
      tone: "neutral",
    },
    renewperiod: {
      label: "Renewal period",
      explain: "The domain was renewed very recently.",
      tone: "neutral",
    },
    autorenewperiod: {
      label: "Auto-renewal period",
      explain: "The domain was renewed automatically very recently.",
      tone: "neutral",
    },
    transferperiod: {
      label: "Transfer period",
      explain: "The domain was transferred to a new registrar very recently.",
      tone: "neutral",
    },
  };

  if (known[key]) return known[key];

  return {
    label: raw,
    explain: "Status code reported by the registry.",
    tone: "neutral",
  };
}

const chipTone: Record<Tone, string> = {
  good: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  warn: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200",
  neutral:
    "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200",
};

/** Build a plain-text summary for the copy button. */
function buildSummary(r: DomainAgeResult): string {
  const lines = [
    `Domain: ${r.domain}`,
    `Age: ${r.age ? r.age.formatted : NOT_PUBLISHED}`,
    `Registered on: ${formatDate(r.registrationDate)}`,
    `Registry expiry: ${formatDate(r.expiryDate)}`,
    `Last updated: ${formatDate(r.lastUpdated)}`,
    `Registrar: ${r.registrar}`,
  ];
  if (r.statusList.length > 0) {
    lines.push(`Status: ${r.statusList.join(", ")}`);
  }
  return lines.join("\n");
}

export default function DomainAgeCheckerUI() {
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorState | null>(null);
  const [result, setResult] = useState<DomainAgeResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);

  async function handleCheck(e: React.FormEvent) {
    e.preventDefault();
    if (!domain.trim() || loading || !turnstileToken) return;

    const verificationToken = turnstileToken;
    setTurnstileToken("");

    setLoading(true);
    setError(null);
    setResult(null);
    setCopied(false);

    try {
      const res = await fetch("/api/domain-age", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain,
          turnstileToken: verificationToken,
        }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok || !data) {
        const code = data?.code as string | undefined;
        let kind: ErrorKind = "other";
        if (code === "unavailable") kind = "unavailable";
        else if (code === "not_registered") kind = "not_registered";
        else if (code === "temporary") kind = "temporary";
        setError({
          kind,
          message:
            data?.error || "Something went wrong. Please try again in a minute.",
        });
      } else {
        setResult(data as DomainAgeResult);
      }
    } catch {
      setError({
        kind: "temporary",
        message: "Please try again in a minute.",
      });
    } finally {
      setLoading(false);
      setTurnstileToken("");
      setTurnstileResetKey((value) => value + 1);
    }
  }

  async function handleCopy() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(buildSummary(result));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore clipboard errors */
    }
  }

  const note = result ? expiryNote(result.expiryDate) : null;

  const details: { label: string; value: string; extra?: string | null }[] =
    result
      ? [
          { label: "Registered on", value: formatDate(result.registrationDate) },
          {
            label: "Registry expiry",
            value: formatDate(result.expiryDate),
            extra: note,
          },
          { label: "Last updated", value: formatDate(result.lastUpdated) },
          { label: "Registrar", value: result.registrar },
        ]
      : [];

  return (
    <div className="space-y-6">
      {/* Input */}
      <form onSubmit={handleCheck}>
        <label htmlFor="domain-input" className={`mb-2 block ${labelClass}`}>
          Domain name or URL
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="domain-input"
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="example.com or https://example.com"
            className={`${inputClass} flex-1`}
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={loading || !domain.trim() || !turnstileToken}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-accent-500 px-6 py-3 font-bold text-white transition-colors hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Search className="h-4 w-4" aria-hidden="true" />
            )}
            {loading ? "Checking..." : "Check Domain Age"}
          </button>
        </div>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          Enter the registered domain, such as example.com. Availability and published details depend on the registry.
        </p>
        <TurnstileWidget
          action="domain-age"
          onToken={setTurnstileToken}
          resetKey={turnstileResetKey}
        />
      </form>

      {/* Messages */}
      {error && error.kind === "other" && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-md border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <p className="text-sm">{error.message}</p>
        </div>
      )}

      {error && error.kind === "temporary" && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-md border border-amber-200 bg-amber-50 p-4 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200"
        >
          <Clock className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <p className="text-sm">{error.message}</p>
        </div>
      )}

      {error &&
        (error.kind === "unavailable" || error.kind === "not_registered") && (
          <div
            role="status"
            className="flex items-start gap-3 rounded-md border border-slate-200 bg-slate-50 p-4 text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <Info
              className="mt-0.5 h-5 w-5 shrink-0 text-indigo-700 dark:text-accent-500"
              aria-hidden="true"
            />
            <p className="text-sm leading-relaxed">{error.message}</p>
          </div>
        )}

      {/* Result */}
      {result && (
        <div className="rounded-md border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          {/* Headline */}
          <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-start sm:justify-between dark:border-slate-800">
            <div className="min-w-0">
              <p className={labelClass}>Domain age</p>
              <p className="mt-1 break-words font-serif text-3xl font-bold text-indigo-700 dark:text-slate-100">
                {result.age ? result.age.formatted : NOT_PUBLISHED}
              </p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {result.domain}
                </span>
                {result.age && (
                  <> &middot; {result.age.totalDays.toLocaleString()} days since registration</>
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-bold transition-colors ${
                copied
                  ? "border-emerald-600 bg-emerald-600 text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:border-accent-500 hover:text-accent-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              }`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
          </div>

          {/* Details list */}
          <dl className="divide-y divide-slate-200 dark:divide-slate-800">
            {details.map((row) => {
              const missing = row.value === NOT_PUBLISHED;
              return (
                <div
                  key={row.label}
                  className="grid gap-1 px-5 py-3 sm:grid-cols-3 sm:gap-4"
                >
                  <dt className={`${labelClass} sm:pt-0.5`}>{row.label}</dt>
                  <dd
                    className={`text-base sm:col-span-2 ${
                      missing
                        ? "text-slate-500 dark:text-slate-400"
                        : "font-medium text-slate-900 dark:text-slate-100"
                    }`}
                  >
                    {row.value}
                    {row.extra && (
                      <span className="ml-2 text-sm font-normal text-slate-500 dark:text-slate-400">
                        ({row.extra})
                      </span>
                    )}
                  </dd>
                </div>
              );
            })}
          </dl>

          {/* Status */}
          <div className="border-t border-slate-200 p-5 dark:border-slate-800">
            <p className={`mb-3 ${labelClass}`}>Domain status</p>
            {result.statusList.length > 0 ? (
              <ul className="space-y-3">
                {result.statusList.map((s) => {
                  const info = describeStatus(s);
                  return (
                    <li
                      key={s}
                      className="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-3"
                    >
                      <span
                        className={`inline-flex w-fit shrink-0 items-center rounded-md border px-2.5 py-1 text-xs font-bold ${chipTone[info.tone]}`}
                      >
                        {info.label}
                      </span>
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {info.explain}
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {NOT_PUBLISHED}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}