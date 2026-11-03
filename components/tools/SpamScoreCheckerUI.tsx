"use client";

import React, { useState } from "react";
import { ShieldAlert, Loader2, AlertCircle, Globe, Layers } from "lucide-react";

type Mode = "single" | "bulk";

const MAX_DOMAINS = 20;

const labelClass =
  "text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300";
const inputClass =
  "w-full rounded-md border-2 border-slate-300 bg-white px-4 py-3.5 text-base text-slate-900 placeholder-slate-500 outline-none transition-colors hover:border-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-400";
const toggleBase =
  "inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-bold transition-colors";
const toggleActive =
  "border-indigo-700 bg-indigo-700 text-white dark:border-accent-500 dark:bg-accent-500";
const toggleIdle =
  "border-slate-300 bg-white text-slate-700 hover:border-accent-500 hover:text-accent-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200";

const EXAMPLES = ["example.com", "wikipedia.org"];

/** Turns "https://www.example.com/page" into "example.com". */
function cleanDomain(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^[a-z]+:\/\//, "")
    .replace(/^www\./, "")
    .split(/[/?#]/)[0];
}

function looksLikeDomain(value: string): boolean {
  return /^([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/.test(value);
}

/** Unique, cleaned domains from the bulk box (one per line). */
function parseBulk(text: string): string[] {
  const seen = new Set<string>();
  for (const line of text.split(/\r?\n/)) {
    const d = cleanDomain(line);
    if (d) seen.add(d);
  }
  return Array.from(seen);
}

export function SpamScoreCheckerUI() {
  const [mode, setMode] = useState<Mode>("single");
  const [single, setSingle] = useState("");
  const [bulk, setBulk] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const bulkList = parseBulk(bulk);
  const overLimit = bulkList.length > MAX_DOMAINS;

  /**
   * The real check will be connected here later.
   * For now it returns nothing, so no result is ever invented.
   */
  async function runCheck(_domains: string[]): Promise<null> {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setNotice("");

    let domains: string[] = [];

    if (mode === "single") {
      const d = cleanDomain(single);
      if (!d) {
        setError("Please enter a domain first.");
        return;
      }
      if (!looksLikeDomain(d)) {
        setError("Please enter a valid domain, like example.com.");
        return;
      }
      domains = [d];
    } else {
      if (bulkList.length === 0) {
        setError("Please enter at least one domain first.");
        return;
      }
      if (overLimit) {
        setError(`Please keep it to ${MAX_DOMAINS} domains or fewer.`);
        return;
      }
      const bad = bulkList.find((d) => !looksLikeDomain(d));
      if (bad) {
        setError(`"${bad}" does not look like a valid domain.`);
        return;
      }
      domains = bulkList;
    }

    setError("");
    setLoading(true);
    try {
      const data = await runCheck(domains);
      if (!data) {
        setNotice(
          "We couldn't run this check right now. Please try again in a minute."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Mode toggle */}
      <div role="tablist" aria-label="Check type" className="flex flex-wrap gap-2">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "single"}
          onClick={() => {
            setMode("single");
            setError("");
            setNotice("");
          }}
          className={`${toggleBase} ${mode === "single" ? toggleActive : toggleIdle}`}
        >
          <Globe className="h-4 w-4" aria-hidden="true" />
          Single domain
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "bulk"}
          onClick={() => {
            setMode("bulk");
            setError("");
            setNotice("");
          }}
          className={`${toggleBase} ${mode === "bulk" ? toggleActive : toggleIdle}`}
        >
          <Layers className="h-4 w-4" aria-hidden="true" />
          Bulk (up to {MAX_DOMAINS})
        </button>
      </div>

      {/* Form (no extra card, the page already has one) */}
      <form onSubmit={handleSubmit} noValidate>
        {mode === "single" ? (
          <>
            <label htmlFor="sp-single" className={`mb-2 block ${labelClass}`}>
              Domain name or URL
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                id="sp-single"
                type="text"
                value={single}
                onChange={(e) => {
                  setSingle(e.target.value);
                  if (error) setError("");
                }}
                placeholder="example.com"
                className={`${inputClass} flex-1`}
                autoComplete="off"
                aria-invalid={error ? true : undefined}
              />
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-accent-500 px-7 py-3.5 text-base font-bold text-white transition-colors hover:bg-accent-600 disabled:cursor-wait disabled:opacity-90"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                ) : (
                  <ShieldAlert className="h-5 w-5" aria-hidden="true" />
                )}
                {loading ? "Checking..." : "Check Domain"}
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
                    setSingle(ex);
                    setError("");
                  }}
                  className="rounded-md border border-slate-300 bg-white px-2.5 py-1 font-mono text-xs text-slate-800 transition-colors hover:border-accent-500 hover:text-accent-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                >
                  {ex}
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="mb-2 flex items-center justify-between gap-3">
              <label htmlFor="sp-bulk" className={labelClass}>
                Domains (one per line)
              </label>
              <span
                className={`text-sm font-bold ${
                  overLimit
                    ? "text-red-700 dark:text-red-400"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                {bulkList.length} / {MAX_DOMAINS}
              </span>
            </div>
            <textarea
              id="sp-bulk"
              rows={6}
              value={bulk}
              onChange={(e) => {
                setBulk(e.target.value);
                if (error) setError("");
              }}
              placeholder={"example.com\nwikipedia.org\nmysite.co.uk"}
              className={`${inputClass} resize-y font-mono text-sm`}
              aria-invalid={error ? true : undefined}
            />
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-accent-500 px-7 py-3.5 text-base font-bold text-white transition-colors hover:bg-accent-600 disabled:cursor-wait disabled:opacity-90"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                ) : (
                  <ShieldAlert className="h-5 w-5" aria-hidden="true" />
                )}
                {loading ? "Checking..." : "Check All Domains"}
              </button>
              {bulk && (
                <button
                  type="button"
                  onClick={() => {
                    setBulk("");
                    setError("");
                    setNotice("");
                  }}
                  className="rounded-md border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition-colors hover:border-accent-500 hover:text-accent-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  Clear
                </button>
              )}
            </div>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
              Duplicates are removed automatically. You can paste full URLs too.
            </p>
          </>
        )}
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

      {/* Neutral message */}
      {notice && !error && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-md border border-slate-200 bg-slate-50 p-4 text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          <AlertCircle
            className="mt-0.5 h-5 w-5 shrink-0 text-indigo-700 dark:text-accent-500"
            aria-hidden="true"
          />
          <p className="text-sm leading-relaxed">{notice}</p>
        </div>
      )}
    </div>
  );
}