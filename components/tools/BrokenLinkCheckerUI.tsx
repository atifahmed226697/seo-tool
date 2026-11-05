"use client";

import { useState } from "react";
import { TurnstileWidget } from "@/components/TurnstileWidget";
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

type Kind = "broken" | "redirect" | "ok";
type Filter = "all" | Kind;

interface StatusInfo {
  kind: Kind;
  label: string;
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

const chipTone: Record<Kind, string> = {
  broken:
    "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200",
  redirect:
    "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200",
  ok: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
};

const EXAMPLES = ["https://example.com", "https://www.wikipedia.org"];

/** Turns a status code into a label and a plain-English explanation. */
function describe(status: number): StatusInfo {
  if (status === 0) {
    return {
      kind: "broken",
      label: "Not reachable",
      explain: "The link did not respond or could not be opened.",
    };
  }
  if (status === 404 || status === 410) {
    return {
      kind: "broken",
      label: `Error ${status}`,
      explain: "The page was not found. It may have been moved or deleted.",
    };
  }
  if (status >= 500) {
    return {
      kind: "broken",
      label: `Error ${status}`,
      explain: "The other website had a server problem.",
    };
  }
  if (status >= 400) {
    return {
      kind: "broken",
      label: `Error ${status}`,
      explain: "The other website refused or could not handle the request.",
    };
  }
  if (status >= 300) {
    return {
      kind: "redirect",
      label: `Redirect ${status}`,
      explain: "The link sends visitors to a different address.",
    };
  }
  return {
    kind: "ok",
    label: `OK ${status}`,
    explain: "The link is working.",
  };
}

const ORDER: Record<Kind, number> = { broken: 0, redirect: 1, ok: 2 };

export default function BrokenLinkCheckerUI() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [filter, setFilter] = useState<Filter>("all");

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
    try {
      const res = await fetch("/api/page-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          mode: "broken",
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

  const rows = result?.results ?? [];
  const withInfo = rows
    .map((r) => ({ ...r, info: describe(r.status) }))
    .sort((a, b) => ORDER[a.info.kind] - ORDER[b.info.kind]);

  const counts = {
    all: withInfo.length,
    broken: withInfo.filter((r) => r.info.kind === "broken").length,
    redirect: withInfo.filter((r) => r.info.kind === "redirect").length,
    ok: withInfo.filter((r) => r.info.kind === "ok").length,
  };

  const visible =
    filter === "all" ? withInfo : withInfo.filter((r) => r.info.kind === filter);

  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "broken", label: "Broken" },
    { key: "redirect", label: "Redirects" },
    { key: "ok", label: "Working" },
  ];

  return (
    <div className="space-y-6">
      {/* Input (no extra card, the page already has one) */}
      <form onSubmit={handleCheck} noValidate>
        <label htmlFor="bl-url" className={`mb-2 block ${labelClass}`}>
          Page URL
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="bl-url"
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
            {loading ? "Scanning..." : "Check Links"}
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

        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          To keep the tool fast, up to 25 unique links per page are checked. This
          can take a few seconds.
        </p>
        <TurnstileWidget
          action="page-scan-broken"
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
          <div className="border-b border-slate-200 p-5 dark:border-slate-800">
            <p className={labelClass}>Result</p>
            <p
              className={`mt-1 font-serif text-3xl font-bold ${
                counts.broken > 0
                  ? "text-red-700 dark:text-red-400"
                  : counts.all > 0
                  ? "text-emerald-700 dark:text-emerald-400"
                  : "text-indigo-700 dark:text-slate-100"
              }`}
            >
              {counts.all === 0
                ? "No links found"
                : counts.broken === 0
                ? "No broken links found"
                : `${counts.broken} broken ${counts.broken === 1 ? "link" : "links"}`}
            </p>
            <p className="mt-1 break-words text-sm text-slate-600 dark:text-slate-400">
              Checked{" "}
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {result.checked}
              </span>{" "}
              of{" "}
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {result.totalFound}
              </span>{" "}
              links on {result.url}
            </p>
          </div>

          {counts.all === 0 ? (
            <p className="p-5 text-sm text-slate-500 dark:text-slate-400">
              We could not find any links on this page.
            </p>
          ) : (
            <>
              {/* Filters */}
              <div className="flex flex-wrap gap-2 border-b border-slate-200 p-5 dark:border-slate-800">
                {filters.map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setFilter(f.key)}
                    aria-pressed={filter === f.key}
                    className={`${toggleBase} ${
                      filter === f.key ? toggleActive : toggleIdle
                    }`}
                  >
                    {f.label} ({counts[f.key]})
                  </button>
                ))}
              </div>

              {/* Table */}
              {visible.length === 0 ? (
                <p className="p-5 text-sm text-slate-500 dark:text-slate-400">
                  No links in this group.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800">
                        <th className={`px-5 py-3 ${labelClass}`}>Link</th>
                        <th className={`px-5 py-3 ${labelClass}`}>Status</th>
                        <th className={`hidden px-5 py-3 sm:table-cell ${labelClass}`}>
                          What it means
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {visible.map((r) => (
                        <tr key={r.href}>
                          <td className="max-w-md break-all px-5 py-3 text-slate-800 dark:text-slate-200">
                            {r.href}
                          </td>
                          <td className="whitespace-nowrap px-5 py-3 align-top">
                            <span
                              className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-bold ${chipTone[r.info.kind]}`}
                            >
                              {r.info.label}
                            </span>
                          </td>
                          <td className="hidden px-5 py-3 text-slate-600 sm:table-cell dark:text-slate-400">
                            {r.info.explain}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}