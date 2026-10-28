"use client";

import { useState } from "react";
import { Search, Loader2, AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react";

interface Heading {
  level: number;
  text: string;
}

interface Result {
  url: string;
  headings: Heading[];
}

/** Finds problems in the heading structure. */
function findIssues(headings: Heading[]): { type: "ok" | "warn"; text: string }[] {
  const issues: { type: "ok" | "warn"; text: string }[] = [];
  const h1Count = headings.filter((h) => h.level === 1).length;

  if (h1Count === 0) issues.push({ type: "warn", text: "No H1 found. Every page should have exactly one H1." });
  else if (h1Count > 1) issues.push({ type: "warn", text: `${h1Count} H1 headings found. Use only one H1 per page.` });
  else issues.push({ type: "ok", text: "Exactly one H1 found." });

  let skipped = false;
  for (let i = 1; i < headings.length; i++) {
    if (headings[i].level - headings[i - 1].level > 1) skipped = true;
  }
  if (skipped) issues.push({ type: "warn", text: "Some heading levels are skipped (for example H2 then H4)." });
  else if (headings.length > 0) issues.push({ type: "ok", text: "No skipped heading levels." });

  if (headings.some((h) => !h.text)) issues.push({ type: "warn", text: "Some headings are empty." });

  return issues;
}

export default function HeadingStructureCheckerUI() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  async function handleCheck(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim() || loading) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/page-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, mode: "headings" }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Something went wrong. Please try again.");
      else setResult(data as Result);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  const issues = result ? findIssues(result.headings) : [];
  const counts = [1, 2, 3, 4, 5, 6].map((lvl) => ({
    lvl,
    n: result ? result.headings.filter((h) => h.level === lvl).length : 0,
  }));

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleCheck}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <label
          htmlFor="hs-url"
          className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400"
        >
          Page URL
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="hs-url"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/blog/my-post"
            className="w-full flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Search className="h-4 w-4" aria-hidden="true" />}
            {loading ? "Checking..." : "Check Headings"}
          </button>
        </div>
      </form>

      {error && (
        <div role="alert" className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {!result && !error && !loading && (
        <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center dark:border-slate-700">
          <p className="font-semibold text-slate-900 dark:text-slate-100">No page checked yet</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Enter a page URL to see its H1 to H6 outline.</p>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {counts.map((c) => (
              <div key={c.lvl} className="rounded-xl border border-slate-200 bg-white p-3 text-center dark:border-slate-800 dark:bg-slate-900">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">H{c.lvl}</p>
                <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{c.n}</p>
              </div>
            ))}
          </div>

          <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            {issues.map((i) => (
              <p key={i.text} className={`flex items-start gap-2 text-sm ${i.type === "ok" ? "text-emerald-700 dark:text-emerald-300" : "text-amber-700 dark:text-amber-300"}`}>
                {i.type === "ok" ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> : <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />}
                {i.text}
              </p>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
              Heading outline ({result.headings.length})
            </p>
            {result.headings.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">No headings found on this page.</p>
            ) : (
              <ul className="space-y-1.5">
                {result.headings.map((h, idx) => (
                  <li key={idx} style={{ paddingLeft: `${(h.level - 1) * 20}px` }} className="flex items-baseline gap-2 text-sm">
                    <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                      H{h.level}
                    </span>
                    <span className="text-slate-800 dark:text-slate-200">{h.text || "(empty)"}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}