"use client";

import { useState } from "react";
import { Search, Loader2, AlertCircle } from "lucide-react";

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

export default function LinksCounterUI() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [filter, setFilter] = useState<Filter>("all");

  async function handleCheck(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim() || loading) return;
    setLoading(true);
    setError("");
    setResult(null);
    setFilter("all");
    try {
      const res = await fetch("/api/page-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, mode: "links" }),
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

  const links = result?.links ?? [];
  const internal = links.filter((l) => l.type === "internal").length;
  const external = links.filter((l) => l.type === "external").length;
  const nofollow = links.filter((l) => l.nofollow).length;

  const shown = links.filter((l) => {
    if (filter === "internal") return l.type === "internal";
    if (filter === "external") return l.type === "external";
    if (filter === "nofollow") return l.nofollow;
    return true;
  });

  const cards: { key: Filter; label: string; value: number }[] = [
    { key: "all", label: "Total links", value: links.length },
    { key: "internal", label: "Internal", value: internal },
    { key: "external", label: "External", value: external },
    { key: "nofollow", label: "Nofollow", value: nofollow },
  ];

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleCheck}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <label
          htmlFor="lc-url"
          className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400"
        >
          Page URL
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="lc-url"
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
            {loading ? "Counting..." : "Count Links"}
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
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Enter a page URL to count its internal and external links.</p>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {cards.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => setFilter(c.key)}
                className={`rounded-xl border p-4 text-left transition ${
                  filter === c.key
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950"
                    : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                }`}
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{c.label}</p>
                <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">{c.value}</p>
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
              Links ({shown.length})
            </p>
            {shown.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">No links in this group.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400">
                      <th className="py-2 pr-4">Link</th>
                      <th className="py-2 pr-4">Anchor text</th>
                      <th className="py-2 pr-4">Type</th>
                      <th className="py-2">Follow</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shown.map((l, i) => (
                      <tr key={i} className="border-b border-slate-100 dark:border-slate-800/60">
                        <td className="max-w-xs break-all py-2 pr-4 text-slate-800 dark:text-slate-200">{l.href}</td>
                        <td className="py-2 pr-4 text-slate-600 dark:text-slate-400">{l.text || "-"}</td>
                        <td className="py-2 pr-4 capitalize text-slate-700 dark:text-slate-300">{l.type}</td>
                        <td className="py-2 text-slate-700 dark:text-slate-300">{l.nofollow ? "nofollow" : "dofollow"}</td>
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