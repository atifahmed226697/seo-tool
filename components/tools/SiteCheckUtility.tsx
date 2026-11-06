"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { TurnstileWidget } from "@/components/TurnstileWidget";
import type { SiteCheckMode, SiteCheckResult } from "@/lib/site-checks";
import { buttonClass, fieldClass } from "./UtilityControls";

const labels = {
  redirect: "Check redirects",
  availability: "Check reachability",
  hosting: "Look up network",
  speed: "Run speed test",
};

export default function SiteCheckUtility({ mode }: { mode: SiteCheckMode }) {
  const [url, setUrl] = useState("");
  const [strategy, setStrategy] = useState("mobile");
  const [token, setToken] = useState("");
  const [resetKey, setResetKey] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<SiteCheckResult | null>(null);

  async function run(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || busy || !url.trim()) return;
    setBusy(true);
    setError("");
    setResult(null);
    try {
      const response = await fetch("/api/site-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, mode, strategy, turnstileToken: token }),
        signal: AbortSignal.timeout(35_000),
      });
      const payload = await response.json() as SiteCheckResult & { error?: string };
      if (!response.ok) throw new Error(payload.error || "The check could not be completed.");
      setResult(payload);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "The check could not be completed.");
    } finally {
      setToken("");
      setResetKey(previous => previous + 1);
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={run} className="space-y-4">
        <label className="block font-semibold">
          {mode === "hosting" ? "Public domain" : "Public page URL"}
          <input value={url} onChange={event => { setUrl(event.target.value); setResult(null); }} placeholder="https://example.com" inputMode="url" maxLength={2048} disabled={busy} required className={`mt-1 ${fieldClass}`} />
        </label>
        {mode === "speed" && (
          <label className="block font-semibold">
            Device
            <select value={strategy} onChange={event => { setStrategy(event.target.value); setResult(null); }} disabled={busy} className={`mt-1 ${fieldClass}`}>
              <option value="mobile">Mobile</option>
              <option value="desktop">Desktop</option>
            </select>
          </label>
        )}
        <TurnstileWidget action={`site-check-${mode}`} onToken={setToken} resetKey={resetKey} />
        <button disabled={!token || !url.trim() || busy} className={buttonClass}>{busy ? "Checking…" : labels[mode]}</button>
      </form>
      {error && <p role="alert" className="text-red-700">{error}</p>}
      {result && (
        <section aria-label="Check result" className="space-y-3 rounded-lg bg-white p-4 text-brand-ink">
          <h2 className="text-lg font-bold" role="status">{result.summary}</h2>
          {result.note && <p className="text-sm">{result.note}</p>}
          {result.hops && (
            <ol className="space-y-2">
              {result.hops.map(({ url: hopUrl, status }, index) => (
                <li key={index} className="flex items-start gap-3 border-t border-slate-200 pt-2 text-sm">
                  <span className="rounded bg-brand-blue px-2 py-1 font-bold">HTTP {status}</span>
                  <span className="min-w-0 break-all">{hopUrl}</span>
                </li>
              ))}
            </ol>
          )}
          {result.entries && (
            <dl className="space-y-2 text-sm">
              {result.entries.map(({ label, value }, index) => (
                <div key={index} className="grid gap-1 border-t border-slate-200 pt-2 sm:grid-cols-2">
                  <dt className="font-bold">{label}</dt>
                  <dd className="break-all">{value}</dd>
                </div>
              ))}
            </dl>
          )}
        </section>
      )}
    </div>
  );
}
