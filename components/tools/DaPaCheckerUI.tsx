"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Types and settings                                                   */
/* ------------------------------------------------------------------ */

const MAX_BULK = 20;

type Mode = "single" | "bulk";

/** One checked domain. The API step will fill these numbers later. */
interface AuthorityRow {
  domain: string;
  da: number;
  pa: number;
  linkingDomains: number;
}

/**
 * PLACEHOLDER: no data source is connected yet, so this returns nothing.
 * When the API is added, return one AuthorityRow per domain here.
 * Never return made-up numbers.
 */
async function runCheck(domains: string[]): Promise<AuthorityRow[]> {
  void domains;
  return [];
}

/** Cleans "https://www.example.com/page" into "example.com". Returns "" if it is not a domain. */
function cleanDomain(raw: string): string {
  let value = raw.trim().toLowerCase();
  if (!value) return "";
  if (!/^[a-z][a-z0-9+.-]*:\/\//.test(value)) value = `https://${value}`;
  try {
    const host = new URL(value).hostname.replace(/^www\./, "");
    return /^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(host) ? host : "";
  } catch {
    return "";
  }
}

/* ------------------------------------------------------------------ */
/* Shared styles                                                        */
/* ------------------------------------------------------------------ */

const labelClass = "text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300";
const inputClass =
  "w-full rounded-md border-2 border-slate-300 bg-white px-4 py-3.5 text-base text-slate-900 placeholder-slate-500 outline-none transition-colors hover:border-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-400";
const toggleBase = "rounded-md border px-4 py-2 text-sm font-bold transition-colors";
const toggleActive =
  "border-indigo-700 bg-indigo-700 text-white dark:border-accent-500 dark:bg-accent-500";
const toggleIdle =
  "border-slate-300 bg-white text-slate-700 hover:border-accent-500 hover:text-accent-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200";
const mainBtn =
  "inline-flex items-center justify-center rounded-md bg-accent-500 px-7 py-3.5 text-base font-bold text-white transition-colors hover:bg-accent-600";
const chipBtn =
  "rounded-md border border-slate-300 bg-white px-3 py-1 text-sm text-slate-700 transition-colors hover:border-accent-500 hover:text-accent-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200";

/* ------------------------------------------------------------------ */
/* Component                                                            */
/* ------------------------------------------------------------------ */

export function DaPaCheckerUI() {
  const [mode, setMode] = useState<Mode>("single");
  const [single, setSingle] = useState("");
  const [bulk, setBulk] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState<string[] | null>(null); // domains that were checked
  const [rows, setRows] = useState<AuthorityRow[]>([]);
  const [copied, setCopied] = useState(false);

  const bulkCount = bulk.split(/\r?\n/).filter((l) => l.trim()).length;

  async function handleCheck() {
    setError("");
    setChecked(null);
    setRows([]);

    // Collect and clean the domains.
    const lines =
      mode === "single"
        ? [single]
        : bulk.split(/\r?\n/).filter((l) => l.trim());

    if (lines.every((l) => !l.trim())) {
      setError(
        mode === "single"
          ? "Please enter a domain or URL first."
          : "Please enter at least one domain first."
      );
      return;
    }
    if (lines.length > MAX_BULK) {
      setError(`Please enter at most ${MAX_BULK} domains at a time.`);
      return;
    }

    const domains: string[] = [];
    for (const line of lines) {
      const d = cleanDomain(line);
      if (!d) {
        setError(`"${line.trim()}" does not look like a valid domain. Example: example.com`);
        return;
      }
      if (!domains.includes(d)) domains.push(d);
    }

    setLoading(true);
    try {
      const result = await runCheck(domains);
      setRows(result);
      setChecked(domains);
    } catch {
      setError("Something went wrong. Please try again in a minute.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (rows.length === 0) return;
    const text = rows
      .map((r) => `${r.domain}\tDA ${r.da}\tPA ${r.pa}\tLinking domains ${r.linkingDomains}`)
      .join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard not available */
    }
  }

  return (
    <div className="space-y-8">
      {/* Single or bulk */}
      <div>
        <p id="dapa-mode-label" className={`mb-2 ${labelClass}`}>
          What do you want to check?
        </p>
        <div role="group" aria-labelledby="dapa-mode-label" className="flex flex-wrap gap-2">
          <button
            type="button"
            aria-pressed={mode === "single"}
            onClick={() => {
              setMode("single");
              setError("");
            }}
            className={`${toggleBase} ${mode === "single" ? toggleActive : toggleIdle}`}
          >
            One domain
          </button>
          <button
            type="button"
            aria-pressed={mode === "bulk"}
            onClick={() => {
              setMode("bulk");
              setError("");
            }}
            className={`${toggleBase} ${mode === "bulk" ? toggleActive : toggleIdle}`}
          >
            Many domains (up to {MAX_BULK})
          </button>
        </div>
      </div>

      {/* Input */}
      <div>
        {mode === "single" ? (
          <>
            <label htmlFor="dapa-single" className={`mb-2 block ${labelClass}`}>
              Domain or URL
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                id="dapa-single"
                type="text"
                value={single}
                onChange={(e) => setSingle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCheck();
                }}
                placeholder="https://example.com"
                autoComplete="off"
                className={inputClass}
              />
              <button type="button" onClick={handleCheck} disabled={loading} className={`${mainBtn} shrink-0`}>
                {loading ? "Checking..." : "Check authority"}
              </button>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">Try an example:</span>
              {["wikipedia.org", "example.com"].map((d) => (
                <button key={d} type="button" onClick={() => setSingle(d)} className={chipBtn}>
                  {d}
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="mb-2 flex items-center justify-between gap-3">
              <label htmlFor="dapa-bulk" className={labelClass}>
                Domains (one per line)
              </label>
              <span
                className={`text-sm ${
                  bulkCount > MAX_BULK ? "font-bold text-red-700 dark:text-red-300" : "text-slate-600 dark:text-slate-400"
                }`}
              >
                {bulkCount} / {MAX_BULK}
              </span>
            </div>
            <textarea
              id="dapa-bulk"
              rows={6}
              value={bulk}
              onChange={(e) => setBulk(e.target.value)}
              placeholder={"example.com\nwikipedia.org\nexample.co.uk"}
              className={inputClass}
            />
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button type="button" onClick={handleCheck} disabled={loading} className={mainBtn}>
                {loading ? "Checking..." : "Check all domains"}
              </button>
              <span className="text-sm text-slate-600 dark:text-slate-400">Try an example:</span>
              <button
                type="button"
                onClick={() => setBulk("example.com\nwikipedia.org\nexample.co.uk")}
                className={chipBtn}
              >
                3 sample domains
              </button>
            </div>
          </>
        )}

        {error && (
          <p role="alert" className="mt-3 text-sm font-bold text-red-700 dark:text-red-300">
            {error}
          </p>
        )}
      </div>

      {/* Result */}
      {checked && (
        <section
          aria-live="polite"
          className="rounded-md border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex flex-wrap items-start justify-between gap-4 p-5">
            <div>
              <p className={labelClass}>Result</p>
              {rows.length > 0 ? (
                <>
                  <p className="mt-1 font-serif text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {rows.length} {rows.length === 1 ? "domain" : "domains"} checked
                  </p>
                  <p className="mt-1 text-base text-slate-600 dark:text-slate-400">
                    Higher scores (out of 100) mean stronger authority.
                  </p>
                </>
              ) : (
                <>
                  <p className="mt-1 font-serif text-2xl font-bold text-slate-900 dark:text-slate-100">
                    Scores are not available right now
                  </p>
                  <p className="mt-1 text-base text-slate-600 dark:text-slate-400">
                    We couldn&apos;t retrieve authority scores for {checked.length === 1 ? `"${checked[0]}"` : "these domains"}{" "}
                    at the moment. Please try again later.
                  </p>
                </>
              )}
            </div>
            {rows.length > 0 && (
              <button
                type="button"
                onClick={handleCopy}
                className={`inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-bold text-white ${
                  copied ? "bg-emerald-600 hover:bg-emerald-700" : "bg-accent-500 hover:bg-accent-600"
                }`}
              >
                {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                {copied ? "Copied!" : "Copy results"}
              </button>
            )}
          </div>

          {rows.length > 0 && (
            <ul className="divide-y divide-slate-200 border-t border-slate-200 dark:divide-slate-800 dark:border-slate-800">
              {rows.map((r) => (
                <li key={r.domain} className="grid gap-3 px-5 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
                  <p className="break-all font-bold text-slate-900 dark:text-slate-100">{r.domain}</p>
                  <dl className="flex gap-6 text-sm">
                    <div>
                      <dt className="text-slate-600 dark:text-slate-400">Domain Authority</dt>
                      <dd className="font-serif text-xl font-bold text-slate-900 dark:text-slate-100">{r.da}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-600 dark:text-slate-400">Page Authority</dt>
                      <dd className="font-serif text-xl font-bold text-slate-900 dark:text-slate-100">{r.pa}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-600 dark:text-slate-400">Linking domains</dt>
                      <dd className="font-serif text-xl font-bold text-slate-900 dark:text-slate-100">
                        {r.linkingDomains}
                      </dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}