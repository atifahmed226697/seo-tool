"use client";

import { useState } from "react";
import { Search, Loader2, AlertCircle } from "lucide-react";

interface ImageItem {
  src: string;
  alt: string | null;
}

interface Result {
  url: string;
  images: ImageItem[];
}

type Filter = "all" | "missing" | "empty" | "ok";

/** Decides the alt status of one image. */
function statusOf(img: ImageItem): "missing" | "empty" | "ok" {
  if (img.alt === null) return "missing";
  if (img.alt.trim() === "") return "empty";
  return "ok";
}

export default function AltTagCheckerUI() {
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
        body: JSON.stringify({ url, mode: "images" }),
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

  const images = result?.images ?? [];
  const missing = images.filter((i) => statusOf(i) === "missing").length;
  const empty = images.filter((i) => statusOf(i) === "empty").length;
  const ok = images.filter((i) => statusOf(i) === "ok").length;

  const shown = images.filter((i) => filter === "all" || statusOf(i) === filter);

  const cards: { key: Filter; label: string; value: number }[] = [
    { key: "all", label: "Total images", value: images.length },
    { key: "missing", label: "Missing alt", value: missing },
    { key: "empty", label: "Empty alt", value: empty },
    { key: "ok", label: "Has alt text", value: ok },
  ];

  const badge = {
    missing: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
    empty: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
    ok: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  };
  const badgeText = { missing: "Missing", empty: "Empty", ok: "OK" };

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleCheck}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <label
          htmlFor="alt-url"
          className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400"
        >
          Page URL
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="alt-url"
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
            {loading ? "Checking..." : "Check Images"}
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
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Enter a page URL to find images with missing alt text.</p>
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
              Images ({shown.length})
            </p>
            {shown.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">No images in this group.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400">
                      <th className="py-2 pr-4">Image</th>
                      <th className="py-2 pr-4">Alt text</th>
                      <th className="py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shown.map((img, i) => {
                      const s = statusOf(img);
                      return (
                        <tr key={i} className="border-b border-slate-100 dark:border-slate-800/60">
                          <td className="max-w-xs break-all py-2 pr-4 text-slate-800 dark:text-slate-200">{img.src}</td>
                          <td className="py-2 pr-4 text-slate-600 dark:text-slate-400">{img.alt || "-"}</td>
                          <td className="py-2">
                            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${badge[s]}`}>{badgeText[s]}</span>
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