"use client";

import { useMemo, useState } from "react";
import { Copy, Check, Trash2, AlertCircle } from "lucide-react";

interface Fields {
  url: string;
  source: string;
  medium: string;
  campaign: string;
  term: string;
  content: string;
}

const EMPTY: Fields = { url: "", source: "", medium: "", campaign: "", term: "", content: "" };

/** Builds the final tracking link, or returns an error message. */
function buildLink(f: Fields): { link: string; error: string } {
  const raw = f.url.trim();
  if (!raw) return { link: "", error: "" };

  let parsed: URL;
  try {
    parsed = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    return { link: "", error: "Please enter a valid website URL." };
  }

  const params: [string, string][] = [
    ["utm_source", f.source],
    ["utm_medium", f.medium],
    ["utm_campaign", f.campaign],
    ["utm_term", f.term],
    ["utm_content", f.content],
  ];
  for (const [key, value] of params) {
    if (value.trim()) parsed.searchParams.set(key, value.trim());
  }

  const missing = !f.source.trim() || !f.medium.trim() || !f.campaign.trim();
  return {
    link: parsed.toString(),
    error: missing ? "Source, medium and campaign name are recommended for tracking." : "",
  };
}

export default function UtmLinkBuilderUI() {
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [copied, setCopied] = useState(false);

  const { link, error } = useMemo(() => buildLink(fields), [fields]);

  function update(key: keyof Fields, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  async function handleCopy() {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard not available */
    }
  }

  const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100";
  const labelClass =
    "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400";

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="utm-url" className={labelClass}>
          Website URL
        </label>
        <input
          id="utm-url"
          type="text"
          value={fields.url}
          onChange={(e) => update("url", e.target.value)}
          placeholder="https://example.com/landing-page"
          className={inputClass}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="utm-source" className={labelClass}>
            Campaign source *
          </label>
          <input
            id="utm-source"
            type="text"
            value={fields.source}
            onChange={(e) => update("source", e.target.value)}
            placeholder="google, newsletter, facebook"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="utm-medium" className={labelClass}>
            Campaign medium *
          </label>
          <input
            id="utm-medium"
            type="text"
            value={fields.medium}
            onChange={(e) => update("medium", e.target.value)}
            placeholder="cpc, email, social"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="utm-campaign" className={labelClass}>
            Campaign name *
          </label>
          <input
            id="utm-campaign"
            type="text"
            value={fields.campaign}
            onChange={(e) => update("campaign", e.target.value)}
            placeholder="spring_sale"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="utm-term" className={labelClass}>
            Campaign term (optional)
          </label>
          <input
            id="utm-term"
            type="text"
            value={fields.term}
            onChange={(e) => update("term", e.target.value)}
            placeholder="running shoes"
            className={inputClass}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="utm-content" className={labelClass}>
            Campaign content (optional)
          </label>
          <input
            id="utm-content"
            type="text"
            value={fields.content}
            onChange={(e) => update("content", e.target.value)}
            placeholder="blue_button"
            className={inputClass}
          />
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>{error}</p>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
          Your tracking link
        </p>
        <p className="break-all rounded-lg bg-slate-50 p-3 font-mono text-sm text-slate-900 dark:bg-slate-950 dark:text-slate-100">
          {link || "Your link will appear here once you enter a URL."}
        </p>

        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={handleCopy}
            disabled={!link}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {copied ? "Copied!" : "Copy link"}
          </button>
          <button
            type="button"
            onClick={() => setFields(EMPTY)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Clear all
          </button>
        </div>
      </div>
    </div>
  );
}