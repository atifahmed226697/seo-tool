"use client";

import { useState } from "react";
import { Search, Loader2, AlertCircle } from "lucide-react";

interface LinkResult {
  href: string;
  status: number;
}

interface Result {
  url: string;
  checked: number;
  totalFound: number;
  results: LinkResult[];
}

/** Turns a status code into a label and color. */
function describe(status: number): { label: string; cls: string; broken: boolean } {
  if (status === 0)
    return { label: "Failed to load", cls: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300", broken: true };
  if (status >= 400)
    return { label: `Error ${status}`, cls: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300", broken: true };
  if (status >= 300)
    return { label: `Redirect ${status}`, cls: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300", broken: false };
  return { label: `OK ${status}`, cls: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300", broken: false };
}

export default function BrokenLinkCheckerUI() {
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
        body: JSON.stringify({ url, mode: "broken" }),
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

  const rows = result?.results ?? [];
  const brokenCount = rows.filter((r) => describe(r.status).broken).length;
  const sorted = [...rows].sort((a, b) => Number(describe(b.status).broken) - Number(describe(a.status).broken));

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleCheck}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <label
          htmlFor="bl-url"
          className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400"
        >
          Page URL
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="bl-url"
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
            {loading ? "Scanning..." : "Check Links"}
          </button>
        </div>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          To keep the tool fast, up to 25 unique links per page are checked. This can take a few seconds.
        </p>
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
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Enter a page URL to find broken links.</p>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Links found</p>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">{result.totalFound}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Checked</p>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">{result.checked}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Broken</p>
              <p className="mt-1 text-2xl font-bold text-red-600 dark:text-red-400">{brokenCount}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            {sorted.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">No links found on this page.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400">
                      <th className="py-2 pr-4">Link</th>
                      <th className="py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((r) => {
                      const d = describe(r.status);
                      return (
                        <tr key={r.href} className="border-b border-slate-100 dark:border-slate-800/60">
                          <td className="max-w-md break-all py-2 pr-4 text-slate-800 dark:text-slate-200">{r.href}</td>
                          <td className="py-2">
                            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${d.cls}`}>{d.label}</span>
                          </td>
                        </tr>
                      );
                    })}
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