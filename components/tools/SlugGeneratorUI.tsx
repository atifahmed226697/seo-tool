"use client";

import { useMemo, useState } from "react";
import { Copy, Check, Trash2 } from "lucide-react";

/** Turns a title into a clean URL slug. */
function makeSlug(input: string, separator: string, removeStopWords: boolean): string {
  const stopWords = new Set([
    "a", "an", "the", "and", "or", "of", "in", "on", "to", "for", "is", "are", "at", "by",
  ]);

  let text = input
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

  return (
    <div className="space-y-6">
      <div>
        <label
          htmlFor="slug-input"
          className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400"
        >
          Your title or text
        </label>
        <textarea
          id="slug-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          rows={3}
          placeholder="e.g. 10 Best SEO Tips for Beginners in 2026"
          className="w-full rounded-xl border border-slate-300 bg-white p-4 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
        />
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-2">
          <label htmlFor="slug-separator" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Separator
          </label>
          <select
            id="slug-separator"
            value={separator}
            onChange={(e) => setSeparator(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          >
            <option value="-">Hyphen ( - )</option>
            <option value="_">Underscore ( _ )</option>
          </select>
        </div>

        <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
          <input
            type="checkbox"
            checked={removeStopWords}
            onChange={(e) => setRemoveStopWords(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300"
          />
          Remove small words (a, the, of...)
        </label>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
          Your slug
        </p>
        <p className="break-all rounded-lg bg-slate-50 p-3 font-mono text-sm text-slate-900 dark:bg-slate-950 dark:text-slate-100">
          {slug || "your-slug-will-appear-here"}
        </p>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{slug.length} characters</p>

        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={handleCopy}
            disabled={!slug}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {copied ? "Copied!" : "Copy slug"}
          </button>
          <button
            type="button"
            onClick={() => setTitle("")}
            disabled={!title}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}