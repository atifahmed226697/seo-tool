"use client";

import { useState } from "react";
import { TurnstileWidget } from "@/components/TurnstileWidget";
import { Search, Loader2, AlertCircle, Copy, Check } from "lucide-react";

interface LinkItem {
  href: string;
  text: string;
  type: "internal" | "external";
  nofollow: boolean;
}

interface Result {
  url: string;
  links: LinkItem[];
}

type Filter = "all" | "internal" | "external" | "nofollow";

const PAGE_SIZE = 50;

const labelClass =
  "text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300";
const inputClass =
  "w-full rounded-md border-2 border-slate-300 bg-white px-4 py-3.5 text-base text-slate-900 placeholder-slate-500 outline-none transition-colors hover:border-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-400";
const toggleBase =
  "rounded-md border px-4 py-2 text-sm font-bold transition-colors";
const toggleActive =
  "border-indigo-700 bg-indigo-700 text-white dark:border-accent-500 dark:bg-accent-500";
const toggleIdle =
  "border-slate-300 bg-white text-slate-700 hover:border-accent-500 hover:text-accent-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200";

const EXAMPLES = ["https://example.com", "https://www.wikipedia.org"];

export default function LinksCounterUI() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [copied, setCopied] = useState(false);

  async function handleCheck(e: React.FormEvent) {
    e.preventDefault();
    if (loading || !turnstileToken) return;

    if (!url.trim()) {
      setResult(null);
      setError("Please enter a page URL first.");
      return;
    }

    const verificationToken = turnstileToken;
    setTurnstileToken("");
    setLoading(true);
    setError("");
    setResult(null);
    setFilter("all");
    setLimit(PAGE_SIZE);
    setCopied(false);
    try {
      const res = await fetch("/api/page-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          mode: "links",
          turnstileToken: verificationToken,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data) {
        setError(
          (data && data.error) || "Something went wrong. Please try again."
        );
      } else {
        setResult(data as Result);
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
      setTurnstileToken("");
      setTurnstileResetKey((value) => value + 1);
    }
  }

  const links = result?.links ?? [];
  const counts = {
    all: links.length,
    internal: links.filter((l) => l.type === "internal").length,
    external: links.filter((l) => l.type === "external").length,
    nofollow: links.filter((l) => l.nofollow).length,
  };

  const filtered = links.filter((l) => {
    if (filter === "internal") return l.type === "internal";
    if (filter === "external") return l.type === "external";
    if (filter === "nofollow") return l.nofollow;
    return true;
  });
  const visible = filtered.slice(0, limit);

  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "internal", label: "Internal" },
    { key: "external", label: "External" },
    { key: "nofollow", label: "Nofollow" },
  ];

  function pickFilter(key: Filter) {
    setFilter(key);
    setLimit(PAGE_SIZE);
  }

  async function handleCopy() {
    if (filtered.length === 0) return;
    try {
      await navigator.clipboard.writeText(filtered.map((l) => l.href).join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard not available */
    }
  }

  return (
    <div className="space-y-6">
      {/* Input (no extra card, the page already has one) */}
      <form onSubmit={handleCheck} noValidate>
        <label htmlFor="lc-url" className={`mb-2 block ${labelClass}`}>
          Page URL
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="lc-url"
            type="text"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (error) setError("");
            }}
            placeholder="https://example.com/blog/my-post"
            className={`${inputClass} flex-1`}
            autoComplete="off"
            aria-invalid={error ? true : undefined}
          />
          <button
            type="submit"
            disabled={loading || !turnstileToken}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-accent-500 px-7 py-3.5 text-base font-bold text-white transition-colors hover:bg-accent-600 disabled:cursor-wait disabled:opacity-90"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            ) : (
              <Search className="h-5 w-5" aria-hidden="true" />
            )}
            {loading ? "Counting..." : "Count Links"}
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Try an example:
          </span>
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => {
                setUrl(ex);
                setError("");
              }}
              className="rounded-md border border-slate-300 bg-white px-2.5 py-1 font-mono text-xs text-slate-800 transition-colors hover:border-accent-500 hover:text-accent-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
            >
              {ex}
            </button>
          ))}
        </div>
        <TurnstileWidget
          action="page-scan-links"
          onToken={setTurnstileToken}
          resetKey={turnstileResetKey}
        />
      </form>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-md border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="rounded-md border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          {/* Headline */}
          <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-start sm:justify-between dark:border-slate-800">
            <div className="min-w-0">
              <p className={labelClass}>Result</p>
              <p className="mt-1 font-serif text-3xl font-bold text-indigo-700 dark:text-slate-100">
                {counts.all === 0
                  ? "No links found"
                  : `${counts.all} ${counts.all === 1 ? "link" : "links"} found`}
              </p>
              {counts.all > 0 && (
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {counts.internal}
                  </span>{" "}
                  internal,{" "}
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {counts.external}
                  </span>{" "}
                  external,{" "}
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {counts.nofollow}
                  </span>{" "}
                  nofollow
                </p>
              )}
              <p className="mt-1 break-words text-sm text-slate-500 dark:text-slate-400">
                on {result.url}
              </p>
            </div>
            {filtered.length > 0 && (
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
                {copied ? "Copied!" : "Copy links"}
              </button>
            )}
          </div>

          {counts.all === 0 ? (
            <p className="p-5 text-sm text-slate-500 dark:text-slate-400">
              We could not find any links on this page.
            </p>
          ) : (
            <>
              {/* Filters */}
              <div className="flex flex-wrap gap-2 border-b border-slate-200 p-5 dark:border-slate-800">
                {filters.map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => pickFilter(f.key)}
                    aria-pressed={filter === f.key}
                    className={`${toggleBase} ${
                      filter === f.key ? toggleActive : toggleIdle
                    }`}
                  >
                    {f.label} ({counts[f.key]})
                  </button>
                ))}
              </div>

              {/* List */}
              {filtered.length === 0 ? (
                <p className="p-5 text-sm text-slate-500 dark:text-slate-400">
                  No links in this group.
                </p>
              ) : (
                <>
                  <ul className="divide-y divide-slate-200 dark:divide-slate-800">
                    {visible.map((l, i) => (
                      <li
                        key={`${l.href}-${i}`}
                        className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6"
                      >
                        <div className="min-w-0">
                          <p
                            className={`break-words text-sm font-bold ${
                              l.text
                                ? "text-slate-900 dark:text-slate-100"
                                : "italic font-normal text-slate-500 dark:text-slate-400"
                            }`}
                          >
                            {l.text || "(no anchor text)"}
                          </p>
                          <a
                            href={l.href}
                            target="_blank"
                            rel="noopener noreferrer nofollow"
                            className="break-all text-sm text-slate-600 underline-offset-2 hover:text-accent-600 hover:underline dark:text-slate-400"
                          >
                            {l.href}
                          </a>
                        </div>

                        <div className="flex shrink-0 flex-row gap-4 text-sm font-bold sm:w-40 sm:flex-col sm:gap-1">
                          <span className="inline-flex items-center gap-2 text-slate-700 dark:text-slate-300">
                            <span
                              className={`h-2 w-2 rounded-full ${
                                l.type === "internal"
                                  ? "bg-indigo-700 dark:bg-slate-300"
                                  : "bg-accent-500"
                              }`}
                              aria-hidden="true"
                            />
                            {l.type === "internal" ? "Internal" : "External"}
                          </span>
                          <span
                            className={`inline-flex items-center gap-2 ${
                              l.nofollow
                                ? "text-amber-700 dark:text-amber-400"
                                : "text-emerald-700 dark:text-emerald-400"
                            }`}
                          >
                            <span
                              className={`h-2 w-2 rounded-full ${
                                l.nofollow ? "bg-amber-500" : "bg-emerald-600"
                              }`}
                              aria-hidden="true"
                            />
                            {l.nofollow ? "Nofollow" : "Follow"}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>

                  {filtered.length > visible.length && (
                    <div className="flex flex-col items-center gap-2 border-t border-slate-200 p-5 dark:border-slate-800">
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Showing {visible.length} of {filtered.length} links
                      </p>
                      <button
                        type="button"
                        onClick={() => setLimit((n) => n + PAGE_SIZE)}
                        className={`${toggleBase} ${toggleIdle}`}
                      >
                        Show more
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}