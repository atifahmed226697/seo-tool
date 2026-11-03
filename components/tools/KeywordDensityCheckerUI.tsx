"use client";

import { useMemo, useState } from "react";
import { Check, Loader2, Trash2, X } from "lucide-react";

/** Common words we skip so results show meaningful keywords. */
const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "of", "in", "on", "at", "to", "for", "with", "by",
  "from", "is", "are", "was", "were", "be", "been", "it", "this", "that", "these", "those",
  "as", "if", "so", "we", "you", "your", "i", "my", "our", "they", "their", "he", "she",
  "his", "her", "its", "not", "no", "do", "does", "did", "can", "will", "has", "have", "had",
  "about", "also", "into", "than", "then", "there", "just", "more", "most", "other", "such",
  "only", "over", "out", "up", "which", "who", "what", "when", "where", "how", "all", "any",
  "some", "very", "too",
]);

const MAX_ROWS = 30;
const SIZES = [1, 2, 3, 4];

type Mode = "text" | "url";

interface PageData {
  url: string;
  loadSeconds: number;
  title: string;
  description: string;
  headings: string[];
  altTexts: string[];
  bodyText: string;
}

interface Row {
  term: string;
  count: number;
  density: number;
}

/** Splits text into lowercase words (letters, numbers, ' and -). */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, " ")
    .split(/\s+/)
    .map((w) => w.replace(/^['-]+|['-]+$/g, ""))
    .filter((w) => w && /[a-z0-9]/.test(w));
}

/** Makes text easy to search for a whole word or phrase. */
function toSearchable(text: string): string {
  return ` ${tokenize(text).join(" ")} `;
}

function contains(searchable: string, term: string): boolean {
  return searchable.includes(` ${term} `);
}

/** Counts how often each word or phrase of the given size appears. */
function analyzeWords(words: string[], size: number, ignoreStop: boolean) {
  const counts = new Map<string, number>();

  for (let i = 0; i + size <= words.length; i++) {
    const slice = words.slice(i, i + size);
    // Single words: skip stop words and 1-letter words.
    if (size === 1 && ignoreStop && (STOP_WORDS.has(slice[0]) || slice[0].length < 2)) continue;
    // Phrases: skip if the phrase starts or ends with a stop word.
    if (size > 1 && ignoreStop && (STOP_WORDS.has(slice[0]) || STOP_WORDS.has(slice[size - 1]))) continue;
    const key = slice.join(" ");
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  const total = words.length;
  let rows: Row[] = Array.from(counts.entries())
    .map(([term, count]) => ({ term, count, density: total ? (count / total) * 100 : 0 }))
    .sort((a, b) => b.count - a.count || a.term.localeCompare(b.term));

  // For phrases, hide one-time phrases when there are repeated ones (less noise).
  if (size > 1) {
    const repeated = rows.filter((r) => r.count > 1);
    if (repeated.length > 0) rows = repeated;
  }

  return { uniqueCount: counts.size, rows: rows.slice(0, MAX_ROWS) };
}

function Flag({ ok }: { ok: boolean }) {
  return ok ? (
    <Check className="h-4 w-4 text-emerald-600" aria-label="Yes" />
  ) : (
    <X className="h-4 w-4 text-red-500" aria-label="No" />
  );
}

const CLOUD_COLORS = [
  "text-indigo-700 dark:text-slate-100",
  "text-accent-600 dark:text-accent-400",
  "text-slate-500 dark:text-slate-400",
];

const tabBase = "rounded-md border px-5 py-2 text-sm font-bold transition-colors";
const tabActive =
  "border-indigo-700 bg-indigo-700 text-white dark:border-accent-500 dark:bg-accent-500";
const tabIdle =
  "border-slate-300 bg-white text-slate-700 hover:border-accent-500 hover:text-accent-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:text-accent-400";

const checkboxLabel =
  "flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300";

export default function KeywordDensityCheckerUI() {
  const [mode, setMode] = useState<Mode>("text");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [page, setPage] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [ignoreStop, setIgnoreStop] = useState(true);
  const [includeMeta, setIncludeMeta] = useState(true);
  const [includeTitle, setIncludeTitle] = useState(true);
  const [includeAlt, setIncludeAlt] = useState(true);
  const [size, setSize] = useState(1);

  // The text we analyze: typed text, or the content of the fetched page.
  const analysisText = useMemo(() => {
    if (mode === "text") return text;
    if (!page) return "";
    return [
      page.bodyText,
      includeTitle ? page.title : "",
      includeMeta ? page.description : "",
      includeAlt ? page.altTexts.join(" ") : "",
    ].join(" ");
  }, [mode, text, page, includeTitle, includeMeta, includeAlt]);

  const words = useMemo(() => tokenize(analysisText), [analysisText]);

  const results = useMemo(() => {
    const out: Record<number, { uniqueCount: number; rows: Row[] }> = {};
    for (const s of SIZES) out[s] = analyzeWords(words, s, ignoreStop);
    return out;
  }, [words, ignoreStop]);

  // Used to show if a keyword is in the title, description or headings.
  const titleSearch = useMemo(() => toSearchable(page?.title || ""), [page]);
  const descSearch = useMemo(() => toSearchable(page?.description || ""), [page]);
  const headSearch = useMemo(() => toSearchable((page?.headings || []).join(" ")), [page]);

  const handleCheck = async () => {
    if (!url.trim() || loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/keyword-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data) {
        setError(data?.error || "Could not check that page. Please try again.");
        setPage(null);
        return;
      }
      setPage(data as PageData);
    } catch {
      setError("Network error. Please check your connection and try again.");
      setPage(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setText("");
    setUrl("");
    setPage(null);
    setError("");
  };

  const hasInput = mode === "text" ? text.length > 0 : url.length > 0 || page !== null;
  const hasResults = words.length > 0;

  // Tag cloud: top single words, bigger when used more often.
  const cloudRows = [...results[1].rows].sort((a, b) => a.term.localeCompare(b.term));
  const counts = cloudRows.map((r) => r.count);
  const minCount = counts.length ? Math.min(...counts) : 0;
  const maxCount = counts.length ? Math.max(...counts) : 0;
  const cloudSize = (count: number) =>
    maxCount === minCount ? 1.15 : 0.9 + ((count - minCount) / (maxCount - minCount)) * 1.2;

  const current = results[size];
  const showFlags = mode === "url" && page !== null;

  return (
    <div className="space-y-6">
      {/* Mode tabs */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode("text")}
          aria-pressed={mode === "text"}
          className={`${tabBase} ${mode === "text" ? tabActive : tabIdle}`}
        >
          Text
        </button>
        <button
          type="button"
          onClick={() => setMode("url")}
          aria-pressed={mode === "url"}
          className={`${tabBase} ${mode === "url" ? tabActive : tabIdle}`}
        >
          URL
        </button>
      </div>

      {/* Input */}
      {mode === "text" ? (
        <div>
          <label
            htmlFor="kd-input"
            className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300"
          >
            Your text
          </label>
          <textarea
            id="kd-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={10}
            placeholder="Paste your article or page content here..."
            className="w-full resize-y rounded-md border border-slate-300 bg-white p-4 text-base text-slate-900 placeholder-slate-400 outline-none transition-colors focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500"
          />
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Total words: <strong className="text-slate-900 dark:text-white">{words.length.toLocaleString()}</strong>
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label
              htmlFor="kd-url"
              className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300"
            >
              Page URL
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                id="kd-url"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCheck();
                }}
                placeholder="example.com/my-article"
                className="w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 placeholder-slate-400 outline-none transition-colors focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500"
              />
              <button
                type="button"
                onClick={handleCheck}
                disabled={!url.trim() || loading}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-accent-500 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                {loading ? "Checking..." : "Check keywords"}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <label className={checkboxLabel}>
              <input
                type="checkbox"
                checked={includeMeta}
                onChange={(e) => setIncludeMeta(e.target.checked)}
                className="h-4 w-4 accent-accent-500"
              />
              Include meta description
            </label>
            <label className={checkboxLabel}>
              <input
                type="checkbox"
                checked={includeTitle}
                onChange={(e) => setIncludeTitle(e.target.checked)}
                className="h-4 w-4 accent-accent-500"
              />
              Include title
            </label>
            <label className={checkboxLabel}>
              <input
                type="checkbox"
                checked={includeAlt}
                onChange={(e) => setIncludeAlt(e.target.checked)}
                className="h-4 w-4 accent-accent-500"
              />
              Include image alt text
            </label>
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
            >
              {error}
            </p>
          )}
        </div>
      )}

      {/* Options row */}
      <div className="flex flex-wrap items-center gap-6">
        <label className={checkboxLabel}>
          <input
            type="checkbox"
            checked={ignoreStop}
            onChange={(e) => setIgnoreStop(e.target.checked)}
            className="h-4 w-4 accent-accent-500"
          />
          Ignore common words (the, and, of...)
        </label>

        <button
          type="button"
          onClick={handleClear}
          disabled={!hasInput}
          className="ml-auto inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-accent-500 hover:text-accent-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-slate-300 disabled:hover:text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:text-accent-400"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          Clear
        </button>
      </div>

      {/* Results */}
      {!hasResults ? (
        <p className="rounded-md border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
          {mode === "text"
            ? "Paste some text above to see the most used keywords."
            : "Enter a page URL above and click Check keywords."}
        </p>
      ) : (
        <div className="space-y-6">
          {/* Summary */}
          <div className="overflow-hidden rounded-md border border-slate-300 dark:border-slate-700">
            <div
              className={`grid gap-px bg-slate-200 dark:bg-slate-800 ${
                mode === "url" ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-2"
              }`}
            >
              <div className="bg-white px-4 py-4 dark:bg-slate-900">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Total words
                </p>
                <p className="mt-1 font-serif text-3xl font-bold tabular-nums text-accent-600 dark:text-accent-400">
                  {words.length.toLocaleString()}
                </p>
              </div>
              <div className="bg-white px-4 py-4 dark:bg-slate-900">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Unique keywords
                </p>
                <p className="mt-1 font-serif text-3xl font-bold tabular-nums text-indigo-700 dark:text-white">
                  {results[1].uniqueCount.toLocaleString()}
                </p>
              </div>
              {mode === "url" && page && (
                <div className="bg-white px-4 py-4 dark:bg-slate-900">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Page load time
                  </p>
                  <p className="mt-1 font-serif text-3xl font-bold tabular-nums text-indigo-700 dark:text-white">
                    {page.loadSeconds}s
                  </p>
                </div>
              )}
            </div>
            {mode === "url" && page && (
              <p className="truncate border-t border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-400">
                Checked: {page.url}
              </p>
            )}
          </div>

          {/* Tag cloud */}
          {cloudRows.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Tag cloud
              </h3>
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2 rounded-md border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                {cloudRows.map((row, i) => (
                  <span
                    key={row.term}
                    title={`${row.count} times`}
                    className={`font-semibold ${CLOUD_COLORS[i % CLOUD_COLORS.length]}`}
                    style={{ fontSize: `${cloudSize(row.count)}rem` }}
                  >
                    {row.term}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Keyword density table with 1/2/3/4 word tabs */}
          <div>
            <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Keyword density
            </h3>
            <div className="mb-3 flex flex-wrap gap-2">
              {SIZES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  aria-pressed={size === s}
                  className={`${tabBase} !px-4 !py-1.5 ${size === s ? tabActive : tabIdle}`}
                >
                  {s === 1 ? "1 word" : `${s} words`}
                </button>
              ))}
            </div>

            {current.rows.length === 0 ? (
              <p className="rounded-md border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
                Not enough text to show {size}-word phrases.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-md border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-400">
                      <th className="px-4 py-3">#</th>
                      <th className="px-4 py-3">Keyword</th>
                      <th className="px-4 py-3">Freq</th>
                      <th className="px-4 py-3">Density</th>
                      {showFlags && (
                        <>
                          <th className="px-4 py-3">Title</th>
                          <th className="px-4 py-3">Desc</th>
                          <th className="px-4 py-3">H1-H6</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {current.rows.map((row, i) => (
                      <tr
                        key={row.term}
                        className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
                      >
                        <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400">{i + 1}</td>
                        <td className="px-4 py-2.5 font-medium text-slate-900 dark:text-slate-100">
                          {row.term}
                        </td>
                        <td className="px-4 py-2.5 tabular-nums text-slate-700 dark:text-slate-300">
                          {row.count}
                        </td>
                        <td className="px-4 py-2.5 tabular-nums text-slate-700 dark:text-slate-300">
                          {row.density.toFixed(2)}%
                        </td>
                        {showFlags && (
                          <>
                            <td className="px-4 py-2.5">
                              <Flag ok={contains(titleSearch, row.term)} />
                            </td>
                            <td className="px-4 py-2.5">
                              <Flag ok={contains(descSearch, row.term)} />
                            </td>
                            <td className="px-4 py-2.5">
                              <Flag ok={contains(headSearch, row.term)} />
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}