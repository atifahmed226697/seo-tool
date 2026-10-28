"use client";

import { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";

/** Common words we skip so results show meaningful keywords. */
const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "of", "in", "on", "at", "to", "for", "with", "by",
  "from", "is", "are", "was", "were", "be", "been", "it", "this", "that", "these", "those",
  "as", "if", "so", "we", "you", "your", "i", "my", "our", "they", "their", "he", "she",
  "his", "her", "its", "not", "no", "do", "does", "did", "can", "will", "has", "have", "had",
]);

interface Row {
  term: string;
  count: number;
  density: number;
}

/** Counts how often each word or phrase appears. */
function analyze(text: string, size: number, ignoreStop: boolean) {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  const total = words.length;
  const counts = new Map<string, number>();

  for (let i = 0; i + size <= words.length; i++) {
    const slice = words.slice(i, i + size);
    // For single words, skip stop words and 1-letter words.
    if (size === 1 && ignoreStop && (STOP_WORDS.has(slice[0]) || slice[0].length < 2)) continue;
    // For phrases, skip if the phrase starts or ends with a stop word.
    if (size > 1 && ignoreStop && (STOP_WORDS.has(slice[0]) || STOP_WORDS.has(slice[size - 1]))) continue;
    const key = slice.join(" ");
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  const rows: Row[] = Array.from(counts.entries())
    .map(([term, count]) => ({ term, count, density: total ? (count / total) * 100 : 0 }))
    .sort((a, b) => b.count - a.count || a.term.localeCompare(b.term))
    .slice(0, 20);

  return { total, rows };
}

export default function KeywordDensityCheckerUI() {
  const [text, setText] = useState("");
  const [size, setSize] = useState(1);
  const [ignoreStop, setIgnoreStop] = useState(true);

  const { total, rows } = useMemo(() => analyze(text, size, ignoreStop), [text, size, ignoreStop]);

  return (
    <div className="space-y-6">
      <div>
        <label
          htmlFor="kd-input"
          className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400"
        >
          Your text
        </label>
        <textarea
          id="kd-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          placeholder="Paste your article or page content here..."
          className="w-full rounded-xl border border-slate-300 bg-white p-4 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
        />
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-2">
          <label htmlFor="kd-size" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Show
          </label>
          <select
            id="kd-size"
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          >
            <option value={1}>Single words</option>
            <option value={2}>2-word phrases</option>
            <option value={3}>3-word phrases</option>
          </select>
        </div>

        <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
          <input
            type="checkbox"
            checked={ignoreStop}
            onChange={(e) => setIgnoreStop(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300"
          />
          Ignore common words (the, and, of...)
        </label>

        <button
          type="button"
          onClick={() => setText("")}
          disabled={!text}
          className="ml-auto inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          Clear
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
          Top results ({total.toLocaleString()} words in total)
        </p>

        {rows.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Paste some text above to see the most used keywords.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  <th className="py-2 pr-4">#</th>
                  <th className="py-2 pr-4">Keyword</th>
                  <th className="py-2 pr-4">Count</th>
                  <th className="py-2">Density</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={row.term} className="border-b border-slate-100 dark:border-slate-800/60">
                    <td className="py-2 pr-4 text-slate-500 dark:text-slate-400">{i + 1}</td>
                    <td className="py-2 pr-4 font-medium text-slate-900 dark:text-slate-100">{row.term}</td>
                    <td className="py-2 pr-4 text-slate-700 dark:text-slate-300">{row.count}</td>
                    <td className="py-2 text-slate-700 dark:text-slate-300">{row.density.toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}