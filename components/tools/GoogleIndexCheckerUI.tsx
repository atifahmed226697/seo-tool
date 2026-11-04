"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Types and settings                                                   */
/* ------------------------------------------------------------------ */

const MAX_BULK = 20;

type Mode = "single" | "bulk";
type IndexStatus = "indexed" | "not-indexed" | "unknown";

/** One checked page. The API step will fill these values later. */
interface IndexRow {
  url: string;
  status: IndexStatus;
  cacheDate: string | null; // for example "12 Oct 2026"
  snippetFound: boolean;
}

/**
 * PLACEHOLDER: no data source is connected yet, so this returns nothing.
 * When the API is added, return one IndexRow per URL here.
 * Never return made-up results.
 */
async function runCheck(urls: string[]): Promise<IndexRow[]> {
  void urls;
  return [];
}

/** Makes sure the value is a full page URL. Adds https:// if missing. Returns "" if invalid. */
function cleanUrl(raw: string): string {
  let value = raw.trim();
  if (!value) return "";
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(value)) value = `https://${value}`;
  try {
    const u = new URL(value);
    if (u.protocol !== "http:" && u.protocol !== "https:") return "";
    if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(u.hostname)) return "";
    return u.toString();
  } catch {
    return "";
  }
}

/** Opens a Google search for the exact page, so the user can verify by eye. */
function googleLink(url: string): string {
  return `https://www.google.com/search?q=${encodeURIComponent(`site:${url}`)}`;
}

const STATUS_TEXT: Record<IndexStatus, string> = {
  indexed: "Indexed",
  "not-indexed": "Not indexed",
  unknown: "Unknown",
};

const STATUS_DOT: Record<IndexStatus, string> = {
  indexed: "bg-emerald-600",
  "not-indexed": "bg-red-600",
  unknown: "bg-slate-400",
};

/* ------------------------------------------------------------------ */
/* Shared styles                                                        */
/* ------------------------------------------------------------------ */

const labelClass = "text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300";
const inputClass =
  "w-full rounded-md border-2 border-slate-300 bg-white px-4 py-3.5 text-base text-slate-900 placeholder-slate-500 outline-none transition-colors hover:border-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-400";
const toggleBase = "rounded-md border px-4 py-2 text-sm font-bold transition-colors";
const toggleActive =
  "border-indigo-700 bg-indigo-700 text-white dark:border-accent-500 dark:bg-accent-500";
const toggleIdle =
  "border-slate-300 bg-white text-slate-700 hover:border-accent-500 hover:text-accent-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200";
const mainBtn =
  "inline-flex items-center justify-center rounded-md bg-accent-500 px-7 py-3.5 text-base font-bold text-white transition-colors hover:bg-accent-600";
const chipBtn =
  "rounded-md border border-slate-300 bg-white px-3 py-1 text-sm text-slate-700 transition-colors hover:border-accent-500 hover:text-accent-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200";

const SAMPLE_URL = "https://www.wikipedia.org/";
const SAMPLE_BULK = "https://www.wikipedia.org/\nhttps://example.com/\nhttps://example.com/blog/";

/* ------------------------------------------------------------------ */
/* Component                                                            */
/* ------------------------------------------------------------------ */

export function GoogleIndexCheckerUI() {
  const [mode, setMode] = useState<Mode>("single");
  const [single, setSingle] = useState("");
  const [bulk, setBulk] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState<string[] | null>(null); // URLs that were checked
  const [rows, setRows] = useState<IndexRow[]>([]);
  const [copied, setCopied] = useState(false);

  const bulkCount = bulk.split(/\r?\n/).filter((l) => l.trim()).length;

  async function handleCheck() {
    setError("");
    setChecked(null);
    setRows([]);

    const lines =
      mode === "single" ? [single] : bulk.split(/\r?\n/).filter((l) => l.trim());

    if (lines.every((l) => !l.trim())) {
      setError(
        mode === "single"
          ? "Please enter a page URL first."
          : "Please enter at least one page URL first."
      );
      return;
    }
    if (lines.length > MAX_BULK) {
      setError(`Please enter at most ${MAX_BULK} URLs at a time.`);
      return;
    }

    const urls: string[] = [];
    for (const line of lines) {
      const u = cleanUrl(line);
      if (!u) {
        setError(`"${line.trim()}" does not look like a valid page URL. Example: https://example.com/page`);
        return;
      }
      if (!urls.includes(u)) urls.push(u);
    }

    setLoading(true);
    try {
      const result = await runCheck(urls);
      setRows(result);
      setChecked(urls);
    } catch {
      setError("Something went wrong. Please try again in a minute.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (rows.length === 0) return;
    const text = rows
      .map((r) => `${r.url}\t${STATUS_TEXT[r.status]}\t${r.cacheDate ?? "No cache date"}`)
      .join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard not available */
    }
  }

  const indexedCount = rows.filter((r) => r.status === "indexed").length;

  return (
    <div className="space-y-8">
      {/* Single or bulk */}
      <div>
        <p id="gi-mode-label" className={`mb-2 ${labelClass}`}>
          What do you want to check?
        </p>
        <div role="group" aria-labelledby="gi-mode-label" className="flex flex-wrap gap-2">
          <button
            type="button"
            aria-pressed={mode === "single"}
            onClick={() => {
              setMode("single");
              setError("");
            }}
            className={`${toggleBase} ${mode === "single" ? toggleActive : toggleIdle}`}
          >
            One page
          </button>
          <button
            type="button"
            aria-pressed={mode === "bulk"}
            onClick={() => {
              setMode("bulk");
              setError("");
            }}
            className={`${toggleBase} ${mode === "bulk" ? toggleActive : toggleIdle}`}
          >
            Many pages (up to {MAX_BULK})
          </button>
        </div>
      </div>

      {/* Input */}
      <div>
        {mode === "single" ? (
          <>
            <label htmlFor="gi-single" className={`mb-2 block ${labelClass}`}>
              Exact page URL
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                id="gi-single"
                type="text"
                value={single}
                onChange={(e) => setSingle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCheck();
                }}
                placeholder="https://example.com/blog/article-slug"
                autoComplete="off"
                className={inputClass}
              />
              <button type="button" onClick={handleCheck} disabled={loading} className={`${mainBtn} shrink-0`}>
                {loading ? "Checking..." : "Check index status"}
              </button>
            </div>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Enter the full address of one page, not just the domain.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">Try an example:</span>
              <button type="button" onClick={() => setSingle(SAMPLE_URL)} className={chipBtn}>
                wikipedia.org
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-2 flex items-center justify-between gap-3">
              <label htmlFor="gi-bulk" className={labelClass}>
                Page URLs (one per line)
              </label>
              <span
                className={`text-sm ${
                  bulkCount > MAX_BULK ? "font-bold text-red-700 dark:text-red-300" : "text-slate-600 dark:text-slate-400"
                }`}
              >
                {bulkCount} / {MAX_BULK}
              </span>
            </div>
            <textarea
              id="gi-bulk"
              rows={6}
              value={bulk}
              onChange={(e) => setBulk(e.target.value)}
              placeholder={"https://example.com/page-1\nhttps://example.com/page-2\nhttps://example.com/page-3"}
              className={inputClass}
            />
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button type="button" onClick={handleCheck} disabled={loading} className={mainBtn}>
                {loading ? "Checking..." : "Check all pages"}
              </button>
              <span className="text-sm text-slate-600 dark:text-slate-400">Try an example:</span>
              <button type="button" onClick={() => setBulk(SAMPLE_BULK)} className={chipBtn}>
                3 sample pages
              </button>
            </div>
          </>
        )}

        {error && (
          <p role="alert" className="mt-3 text-sm font-bold text-red-700 dark:text-red-300">
            {error}
          </p>
        )}
      </div>

      {/* Result */}
      {checked && (
        <section
          aria-live="polite"
          className="rounded-md border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex flex-wrap items-start justify-between gap-4 p-5">
            <div>
              <p className={labelClass}>Result</p>
              {rows.length > 0 ? (
                <>
                  <p className="mt-1 font-serif text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {indexedCount} of {rows.length} {rows.length === 1 ? "page is" : "pages are"} indexed
                  </p>
                  <p className="mt-1 text-base text-slate-600 dark:text-slate-400">
                    Indexed pages can appear in Google search results. Pages that are not indexed cannot.
                  </p>
                </>
              ) : (
                <>
                  <p className="mt-1 font-serif text-2xl font-bold text-slate-900 dark:text-slate-100">
                    Index status is not available right now
                  </p>
                  <p className="mt-1 text-base text-slate-600 dark:text-slate-400">
                    We couldn&apos;t retrieve the index status for{" "}
                    {checked.length === 1 ? "this page" : "these pages"} at the moment. Please try again later.
                  </p>
                </>
              )}
            </div>
            {rows.length > 0 && (
              <button
                type="button"
                onClick={handleCopy}
                className={`inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-bold text-white ${
                  copied ? "bg-emerald-600 hover:bg-emerald-700" : "bg-accent-500 hover:bg-accent-600"
                }`}
              >
                {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                {copied ? "Copied!" : "Copy results"}
              </button>
            )}
          </div>

          {rows.length > 0 && (
            <ul className="divide-y divide-slate-200 border-t border-slate-200 dark:divide-slate-800 dark:border-slate-800">
              {rows.map((r) => (
                <li key={r.url} className="space-y-1.5 px-5 py-4">
                  <p className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
                    <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${STATUS_DOT[r.status]}`} aria-hidden="true" />
                    {STATUS_TEXT[r.status]}
                  </p>
                  <p className="break-all text-base text-slate-800 dark:text-slate-200">{r.url}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {r.cacheDate ? `Last cached by Google: ${r.cacheDate}` : "No cache date available"}
                    {" · "}
                    {r.snippetFound ? "Appears in search results" : "Not seen in search results"}
                    {" · "}
                    <a
                      href={googleLink(r.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-indigo-700 underline underline-offset-2 hover:text-accent-600 dark:text-accent-400"
                    >
                      View in Google
                    </a>
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}