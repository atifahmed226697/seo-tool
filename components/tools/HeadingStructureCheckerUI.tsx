"use client";

import { useState } from "react";
import { TurnstileWidget } from "@/components/TurnstileWidget";
import { Search, Loader2, AlertCircle, Copy, Check } from "lucide-react";

interface HeadingItem {
  level: number;
  text: string;
}

interface Result {
  url: string;
  headings: HeadingItem[];
}

type Filter = "all" | 1 | 2 | 3 | 4 | 5 | 6;

interface Issue {
  title: string;
  explain: string;
}

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

const LEVELS: (1 | 2 | 3 | 4 | 5 | 6)[] = [1, 2, 3, 4, 5, 6];

export default function HeadingStructureCheckerUI() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
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
    setCopied(false);
    try {
      const res = await fetch("/api/page-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          mode: "headings",
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

  const headings = result?.headings ?? [];

  // Mark headings that jump down more than one level (for example H2 then H5)
  const rows = headings.map((h, i) => {
    const prev = i > 0 ? headings[i - 1].level : null;
    const skipFrom = prev !== null && h.level > prev + 1 ? prev : null;
    return { ...h, skipFrom };
  });

  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  for (const h of headings) {
    if (counts[h.level] !== undefined) counts[h.level] += 1;
  }

  const skipCount = rows.filter((r) => r.skipFrom !== null).length;
  const emptyCount = headings.filter((h) => !h.text.trim()).length;

  const issues: Issue[] = [];
  if (headings.length > 0) {
    if (counts[1] === 0) {
      issues.push({
        title: "No H1 heading",
        explain:
          "Every page should have one H1. It tells visitors and search engines what the page is mainly about.",
      });
    } else if (counts[1] > 1) {
      issues.push({
        title: `${counts[1]} H1 headings`,
        explain:
          "A page should have only one H1. Keep one main title and use H2 for the sections under it.",
      });
    }
    if (skipCount > 0) {
      issues.push({
        title: `${skipCount} skipped ${skipCount === 1 ? "level" : "levels"}`,
        explain:
          "Headings should go down one level at a time, like H2 then H3, not H2 then H5. The rows marked below show where it happens.",
      });
    }
    if (emptyCount > 0) {
      issues.push({
        title: `${emptyCount} empty ${emptyCount === 1 ? "heading" : "headings"}`,
        explain:
          "These headings have no text. Add text to them or remove them from the page.",
      });
    }
  }

  const visible =
    filter === "all" ? rows : rows.filter((r) => r.level === filter);

  async function handleCopy() {
    if (headings.length === 0) return;
    const text = headings
      .map((h) => `${"  ".repeat(h.level - 1)}H${h.level}: ${h.text || "(empty)"}`)
      .join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard not available */
    }
  }

  let headline = "No headings found";
  let headTone = "text-indigo-700 dark:text-slate-100";
  if (headings.length > 0) {
    if (issues.length > 0) {
      headline = `${issues.length} ${issues.length === 1 ? "problem" : "problems"} to fix`;
      headTone = "text-amber-700 dark:text-amber-400";
    } else {
      headline = "Heading structure looks good";
      headTone = "text-emerald-700 dark:text-emerald-400";
    }
  }

  return (
    <div className="space-y-6">
      {/* Input (no extra card, the page already has one) */}
      <form onSubmit={handleCheck} noValidate>
        <label htmlFor="hs-url" className={`mb-2 block ${labelClass}`}>
          Page URL
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="hs-url"
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
            {loading ? "Checking..." : "Check Headings"}
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
          action="page-scan-headings"
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
              <p className={`mt-1 font-serif text-3xl font-bold ${headTone}`}>
                {headline}
              </p>
              <p className="mt-1 break-words text-sm text-slate-600 dark:text-slate-400">
                Found{" "}
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {headings.length}
                </span>{" "}
                {headings.length === 1 ? "heading" : "headings"} on {result.url}
              </p>
            </div>
            {headings.length > 0 && (
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
                {copied ? "Copied!" : "Copy outline"}
              </button>
            )}
          </div>

          {headings.length === 0 ? (
            <p className="p-5 text-sm text-slate-500 dark:text-slate-400">
              We could not find any headings (H1 to H6) on this page.
            </p>
          ) : (
            <>
              {/* Problems */}
              {issues.length > 0 && (
                <div className="border-b border-slate-200 p-5 dark:border-slate-800">
                  <p className={`mb-3 ${labelClass}`}>What to fix</p>
                  <ul className="space-y-3">
                    {issues.map((issue) => (
                      <li key={issue.title} className="flex gap-3">
                        <span
                          className="mt-2 h-2 w-2 shrink-0 rounded-full bg-amber-500"
                          aria-hidden="true"
                        />
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                            {issue.title}
                          </p>
                          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                            {issue.explain}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Level buttons */}
              <div className="border-b border-slate-200 p-5 dark:border-slate-800">
                <p className={`mb-3 ${labelClass}`}>Show headings</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setFilter("all")}
                    aria-pressed={filter === "all"}
                    className={`${toggleBase} ${
                      filter === "all" ? toggleActive : toggleIdle
                    }`}
                  >
                    All ({headings.length})
                  </button>
                  {LEVELS.map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setFilter(lvl)}
                      aria-pressed={filter === lvl}
                      className={`${toggleBase} ${
                        filter === lvl ? toggleActive : toggleIdle
                      } ${counts[lvl] === 0 && filter !== lvl ? "opacity-60" : ""}`}
                    >
                      H{lvl} ({counts[lvl]})
                    </button>
                  ))}
                </div>
              </div>

              {/* List */}
              {visible.length === 0 ? (
                <p className="p-5 text-sm text-slate-500 dark:text-slate-400">
                  {filter === "all"
                    ? "No headings to show."
                    : `This page has no H${filter} headings.`}
                </p>
              ) : (
                <ul className="divide-y divide-slate-200 dark:divide-slate-800">
                  {visible.map((r, i) => (
                    <li
                      key={`${r.level}-${i}-${r.text.slice(0, 30)}`}
                      className="px-5 py-3"
                      style={
                        filter === "all"
                          ? { paddingLeft: `${1.25 + (r.level - 1) * 1.25}rem` }
                          : undefined
                      }
                    >
                      <div className="flex gap-3">
                        <span className="w-7 shrink-0 pt-0.5 text-sm font-bold text-accent-600 dark:text-accent-500">
                          H{r.level}
                        </span>
                        <div className="min-w-0">
                          <p
                            className={`break-words text-base ${
                              r.text.trim()
                                ? "text-slate-900 dark:text-slate-100"
                                : "italic text-slate-500 dark:text-slate-400"
                            }`}
                          >
                            {r.text.trim() || "(empty heading)"}
                          </p>
                          {r.skipFrom !== null && (
                            <p className="mt-0.5 text-sm text-amber-700 dark:text-amber-400">
                              Skips from H{r.skipFrom} to H{r.level}
                            </p>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}