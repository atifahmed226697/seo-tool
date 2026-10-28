"use client";

import { useMemo, useState } from "react";
import { Copy, Check, Plus, Trash2, AlertCircle } from "lucide-react";

interface Row {
  id: number;
  lang: string;
  url: string;
}

/** Common language and region codes for the dropdown. */
const LANGUAGES: { code: string; label: string }[] = [
  { code: "en", label: "English (en)" },
  { code: "en-us", label: "English - US (en-us)" },
  { code: "en-gb", label: "English - UK (en-gb)" },
  { code: "en-in", label: "English - India (en-in)" },
  { code: "en-pk", label: "English - Pakistan (en-pk)" },
  { code: "ur", label: "Urdu (ur)" },
  { code: "ur-pk", label: "Urdu - Pakistan (ur-pk)" },
  { code: "ar", label: "Arabic (ar)" },
  { code: "ar-sa", label: "Arabic - Saudi Arabia (ar-sa)" },
  { code: "hi", label: "Hindi (hi)" },
  { code: "es", label: "Spanish (es)" },
  { code: "es-mx", label: "Spanish - Mexico (es-mx)" },
  { code: "fr", label: "French (fr)" },
  { code: "de", label: "German (de)" },
  { code: "it", label: "Italian (it)" },
  { code: "pt", label: "Portuguese (pt)" },
  { code: "pt-br", label: "Portuguese - Brazil (pt-br)" },
  { code: "ru", label: "Russian (ru)" },
  { code: "tr", label: "Turkish (tr)" },
  { code: "zh", label: "Chinese (zh)" },
  { code: "ja", label: "Japanese (ja)" },
  { code: "ko", label: "Korean (ko)" },
  { code: "x-default", label: "Default / fallback (x-default)" },
];

/** True when the value looks like a full web address. */
function isValidUrl(value: string): boolean {
  try {
    const u = new URL(value.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export default function HreflangTagGeneratorUI() {
  const [rows, setRows] = useState<Row[]>([
    { id: 1, lang: "en", url: "" },
    { id: 2, lang: "x-default", url: "" },
  ]);
  const [nextId, setNextId] = useState(3);
  const [copied, setCopied] = useState(false);

  function updateRow(id: number, key: "lang" | "url", value: string) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [key]: value } : r)));
  }

  function addRow() {
    setRows((prev) => [...prev, { id: nextId, lang: "es", url: "" }]);
    setNextId((n) => n + 1);
  }

  function removeRow(id: number) {
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev));
  }

  const { output, problems } = useMemo(() => {
    const issues: string[] = [];
    const lines: string[] = [];
    const seen = new Set<string>();

    rows.forEach((r, i) => {
      if (!r.url.trim()) return;
      if (!isValidUrl(r.url)) {
        issues.push(`Row ${i + 1}: the URL must start with http:// or https://`);
        return;
      }
      if (seen.has(r.lang)) {
        issues.push(`Row ${i + 1}: the language "${r.lang}" is used more than once.`);
        return;
      }
      seen.add(r.lang);
      lines.push(`<link rel="alternate" hreflang="${r.lang}" href="${r.url.trim()}" />`);
    });

    if (lines.length > 0 && !seen.has("x-default")) {
      issues.push("Tip: add an x-default row so users from other regions get a fallback page.");
    }
    return { output: lines.join("\n"), problems: issues };
  }, [rows]);

  async function handleCopy() {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard not available */
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {rows.map((row, i) => (
          <div key={row.id} className="flex flex-col gap-2 sm:flex-row">
            <select
              aria-label={`Language for row ${i + 1}`}
              value={row.lang}
              onChange={(e) => updateRow(row.id, "lang", e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 sm:w-64"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
            <input
              type="text"
              aria-label={`URL for row ${i + 1}`}
              value={row.url}
              onChange={(e) => updateRow(row.id, "url", e.target.value)}
              placeholder="https://example.com/page"
              className="w-full flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
            <button
              type="button"
              onClick={() => removeRow(row.id)}
              disabled={rows.length <= 1}
              aria-label={`Remove row ${i + 1}`}
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-3 py-2.5 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addRow}
          className="inline-flex items-center gap-2 rounded-lg border border-dashed border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add another language
        </button>
      </div>

      {problems.length > 0 && (
        <div
          role="alert"
          className="space-y-1 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200"
        >
          {problems.map((p) => (
            <p key={p} className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              {p}
            </p>
          ))}
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
            Your hreflang tags
          </p>
          <button
            type="button"
            onClick={handleCopy}
            disabled={!output}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <pre className="overflow-x-auto whitespace-pre rounded-lg bg-slate-50 p-4 font-mono text-xs leading-relaxed text-slate-800 dark:bg-slate-950 dark:text-slate-200">
          {output || "Add a URL for each language and your tags will appear here."}
        </pre>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          Paste these tags inside the &lt;head&gt; of every language version of the page.
        </p>
      </div>
    </div>
  );
}