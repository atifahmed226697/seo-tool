"use client";

import { useMemo, useState } from "react";
import { Copy, Check, Trash2 } from "lucide-react";

/** Turns a title into a clean URL slug. (Logic unchanged.) */
function makeSlug(input: string, separator: string, removeStopWords: boolean): string {
  const stopWords = new Set([
    "a", "an", "the", "and", "or", "of", "in", "on", "to", "for", "is", "are", "at", "by",
  ]);

  const text = input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s-]/g, " ")
    .trim();

  let words = text.split(/[\s-]+/).filter(Boolean);
  if (removeStopWords) {
    const filtered = words.filter((w) => !stopWords.has(w));
    if (filtered.length > 0) words = filtered;
  }
  return words.join(separator);
}

/** Slugs up to this many characters are easy to read and share. */
const GOOD_LENGTH = 60;

const SEPARATORS = [
  { value: "-", label: "Hyphen ( - )" },
  { value: "_", label: "Underscore ( _ )" },
];

const labelClass = "text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300";
const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 placeholder-slate-400 outline-none transition-colors focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100";
const toggleBase = "rounded-md border px-4 py-2 text-sm font-bold transition-colors";
const toggleActive =
  "border-indigo-700 bg-indigo-700 text-white dark:border-accent-500 dark:bg-accent-500";
const toggleIdle =
  "border-slate-300 bg-white text-slate-700 hover:border-accent-500 hover:text-accent-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:text-accent-400";

export default function SlugGeneratorUI() {
  const [title, setTitle] = useState("");
  const [separator, setSeparator] = useState("-");
  const [removeStopWords, setRemoveStopWords] = useState(false);
  const [copied, setCopied] = useState(false);

  const slug = useMemo(
    () => makeSlug(title, separator, removeStopWords),
    [title, separator, removeStopWords]
  );

  async function handleCopy() {
    if (!slug) return;
    try {
      await navigator.clipboard.writeText(slug);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard not available */
    }
  }

  const isGood = slug.length > 0 && slug.length <= GOOD_LENGTH;
  const isLong = slug.length > GOOD_LENGTH;

  return (
    <div className="space-y-6">
      {/* Input */}
      <div>
        <label htmlFor="slug-input" className={`mb-2 block ${labelClass}`}>
          Your title or text
        </label>
        <textarea
          id="slug-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          rows={3}
          placeholder="e.g. 10 Best SEO Tips for Beginners in 2026"
          className={inputClass}
        />
      </div>

      {/* Options */}
      <div className="flex flex-wrap items-end gap-x-8 gap-y-4">
        <div>
          <p id="slug-separator-label" className={`mb-2 ${labelClass}`}>
            Separator
          </p>
          <div role="group" aria-labelledby="slug-separator-label" className="flex gap-2">
            {SEPARATORS.map((s) => (
              <button
                key={s.value}
                type="button"
                aria-pressed={separator === s.value}
                onClick={() => setSeparator(s.value)}
                className={`${toggleBase} ${separator === s.value ? toggleActive : toggleIdle}`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-2 pb-2 text-base text-slate-700 dark:text-slate-300">
          <input
            type="checkbox"
            checked={removeStopWords}
            onChange={(e) => setRemoveStopWords(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 accent-accent-500"
          />
          Remove small words (a, the, of...)
        </label>
      </div>

      {/* Result */}
      <div className="rounded-md border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <p className={`mb-2 ${labelClass}`}>Your slug</p>
        <p
          className={`break-all rounded-md border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-base dark:border-slate-800 dark:bg-slate-950 ${
            slug ? "text-slate-900 dark:text-slate-100" : "text-slate-400"
          }`}
        >
          {slug || "your-slug-will-appear-here"}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
          <span>{slug.length} characters</span>
          {isGood && (
            <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
              Good length
            </span>
          )}
          {isLong && (
            <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300">
              A bit long
            </span>
          )}
        </div>
        {isLong && (
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Shorter slugs (under {GOOD_LENGTH} characters) are easier to read and share. Try turning on
            &quot;Remove small words&quot;.
          </p>
        )}

        <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-800">
          <p className={`mb-2 ${labelClass}`}>Full URL preview</p>
          <p className="break-all font-mono text-sm text-slate-700 dark:text-slate-300">
            https://yourdomain.com/{slug || "your-slug"}
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleCopy}
            disabled={!slug}
            className={`inline-flex items-center gap-2 rounded-md px-6 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50 ${
              copied ? "bg-emerald-600 hover:bg-emerald-700" : "bg-accent-500 hover:bg-accent-600"
            }`}
          >
            {copied ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            {copied ? "Copied!" : "Copy slug"}
          </button>
          <button
            type="button"
            onClick={() => setTitle("")}
            disabled={!title}
            className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 hover:border-accent-500 hover:text-accent-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}