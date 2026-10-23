"use client";

import { useState } from "react";
import {
  Search,
  Globe,
  Loader2,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";

type AuditStatus = "pass" | "warn" | "fail";

interface AuditCheck {
  label: string;
  value: string | number;
  status: AuditStatus;
  suggestion: string;
}

interface MetaAnalysisResult {
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

/** Styling and icon for each audit status. */
const STATUS_STYLES: Record<
  AuditStatus,
  { box: string; badge: string; text: string; Icon: typeof CheckCircle2 }
> = {
  pass: {
    box: "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950",
    badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
    text: "Pass",
    Icon: CheckCircle2,
  },
  warn: {
    box: "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950",
    badge: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
    text: "Warning",
    Icon: AlertTriangle,
  },
  fail: {
    box: "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950",
    badge: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    text: "Fail",
    Icon: XCircle,
  },
};

export default function MetaTagAnalyzerUI() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<MetaAnalysisResult | null>(null);

  async function handleAnalyze(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim() || loading) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/meta-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
      } else {
        setResult(data as MetaAnalysisResult);
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  const checks = result
    ? [
        result.checks.title,
        result.checks.description,
        result.checks.h1,
        result.checks.canonical,
        result.checks.ogImage,
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Input form */}
      <form
        onSubmit={handleAnalyze}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <label
          htmlFor="analyzer-url"
          className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400"
        >
          Enter webpage URL to analyze
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Globe
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              id="analyzer-url"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://yourwebsite.com/blog/my-post"
              className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              autoComplete="off"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Search className="h-4 w-4" aria-hidden="true" />
            )}
            {loading ? "Analyzing..." : "Check Tags"}
          </button>
        </div>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          Enter a public page URL. Private or internal addresses are blocked for security.
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
          <AlertCircle className="mx-auto mb-3 h-8 w-8 text-slate-400" aria-hidden="true" />
          <p className="font-semibold text-slate-900 dark:text-slate-100">
            No analysis performed yet
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Enter a page URL above to audit its title, description, headings and social tags.
          </p>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Google-style snippet preview */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
              Search result preview
            </p>
            <p className="truncate text-sm text-slate-600 dark:text-slate-400">{result.url}</p>
            <p className="mt-1 text-xl text-blue-700 dark:text-blue-400">
              {result.title || "(No title found)"}
            </p>
            <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
              {result.description || "(No meta description found)"}
            </p>
          </div>

          {/* Audit checks */}
          <div className="grid gap-4 sm:grid-cols-2">
            {checks.map((check) => {
              const style = STATUS_STYLES[check.status];
              const Icon = style.Icon;
              return (
                <div key={check.label} className={`rounded-2xl border p-4 ${style.box}`}>
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      {check.label}
                    </p>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${style.badge}`}
                    >
                      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                      {style.text}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    {check.value}
                  </p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    {check.suggestion}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Other details */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
              Other details
            </p>
            <dl className="space-y-2 text-sm">
              <DetailRow label="Canonical" value={result.canonical} />
              <DetailRow label="Robots" value={result.robots} />
              <DetailRow label="Viewport" value={result.viewport} />
              <DetailRow
                label={`H1 headings (${result.h1Count})`}
                value={result.h1List.join(" | ")}
              />
            </dl>
          </div>

          {/* Open Graph and Twitter */}
          <div className="grid gap-4 sm:grid-cols-2">
            <TagList title="Open Graph tags" tags={result.openGraph} />
            <TagList title="Twitter tags" tags={result.twitter} />
          </div>
        </div>
      )}
    </div>
  );
}

/** One label and value row. Shows "Not set" when value is empty. */
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
      <dt className="w-44 shrink-0 font-medium text-slate-700 dark:text-slate-300">{label}</dt>
      <dd className="break-all text-slate-600 dark:text-slate-400">{value || "Not set"}</dd>
    </div>
  );
}

/** A list of meta tag names and their values. */
function TagList({ title, tags }: { title: string; tags: Record<string, string> }) {
  const entries = Object.entries(tags);
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
        {title}
      </p>
      {entries.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">None found.</p>
      ) : (
        <dl className="space-y-2 text-sm">
          {entries.map(([name, content]) => (
            <div key={name}>
              <dt className="font-medium text-slate-700 dark:text-slate-300">{name}</dt>
              <dd className="break-all text-slate-600 dark:text-slate-400">{content}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}