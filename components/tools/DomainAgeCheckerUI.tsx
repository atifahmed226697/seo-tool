"use client";

import { useState } from "react";
import { Search, Loader2, AlertCircle, CalendarDays, Clock, Building2 } from "lucide-react";

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

/** Format an ISO date string into a readable date. */
function formatDate(value: string | null): string {
  if (!value) return "Not available";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "Not available";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function DomainAgeCheckerUI() {
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<DomainAgeResult | null>(null);

  async function handleCheck(e: React.FormEvent) {
    e.preventDefault();
    if (!domain.trim() || loading) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/domain-age", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
      } else {
        setResult(data as DomainAgeResult);
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Input form */}
      <form
        onSubmit={handleCheck}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <label
          htmlFor="domain-input"
          className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400"
        >
          Domain name or URL
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="domain-input"
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="example.com or https://example.com"
            className="w-full flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={loading || !domain.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
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
          Accepts any TLD (.com, .org, .io, .net). Subdomains resolve to the root domain.
        </p>
      </form>

      {/* Error state */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Empty state */}
      {!result && !error && !loading && (
        <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center dark:border-slate-700">
          <Clock className="mx-auto mb-3 h-8 w-8 text-slate-400" aria-hidden="true" />
          <p className="font-semibold text-slate-900 dark:text-slate-100">
            No domain checked yet
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Enter a domain above to see its registration date, expiry and age.
          </p>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center dark:border-emerald-900 dark:bg-emerald-950">
            <p className="text-sm text-emerald-700 dark:text-emerald-300">
              Age of <span className="font-semibold">{result.domain}</span>
            </p>
            <p className="mt-1 text-3xl font-bold text-emerald-900 dark:text-emerald-100">
              {result.age ? result.age.formatted : "Unknown"}
            </p>
            {result.age && (
              <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-300">
                {result.age.totalDays.toLocaleString()} days in total
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <InfoCard
              icon={<CalendarDays className="h-4 w-4" aria-hidden="true" />}
              label="Registration date"
              value={formatDate(result.registrationDate)}
            />
            <InfoCard
              icon={<CalendarDays className="h-4 w-4" aria-hidden="true" />}
              label="Expiry date"
              value={formatDate(result.expiryDate)}
            />
            <InfoCard
              icon={<Clock className="h-4 w-4" aria-hidden="true" />}
              label="Last updated"
              value={formatDate(result.lastUpdated)}
            />
            <InfoCard
              icon={<Building2 className="h-4 w-4" aria-hidden="true" />}
              label="Registrar"
              value={result.registrar}
            />
          </div>

          {result.statusList.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                Domain status
              </p>
              <div className="flex flex-wrap gap-2">
                {result.statusList.map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** Small reusable card for one piece of domain info. */
function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
        {icon}
        {label}
      </div>
      <p className="text-base font-medium text-slate-900 dark:text-slate-100">{value}</p>
    </div>
  );
}