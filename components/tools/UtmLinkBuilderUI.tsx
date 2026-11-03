"use client";

import { useMemo, useState } from "react";
import {
  Copy,
  Check,
  Trash2,
  AlertCircle,
  Info,
  Globe,
  Smartphone,
} from "lucide-react";

type Mode = "web" | "play";

interface Fields {
  url: string;
  appId: string;
  source: string;
  medium: string;
  campaign: string;
  term: string;
  content: string;
}

const EMPTY: Fields = {
  url: "",
  appId: "",
  source: "",
  medium: "",
  campaign: "",
  term: "",
  content: "",
};

const labelClass =
  "text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300";
const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 placeholder-slate-400 outline-none transition-colors focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100";
const toggleBase =
  "inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-bold transition-colors";
const toggleActive =
  "border-indigo-700 bg-indigo-700 text-white dark:border-accent-500 dark:bg-accent-500";
const toggleIdle =
  "border-slate-300 bg-white text-slate-700 hover:border-accent-500 hover:text-accent-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200";

// Android package names look like com.company.app
const PACKAGE_RE = /^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z][a-zA-Z0-9_]*)+$/;

interface BuildResult {
  link: string;
  error: string;
  note: string;
}

/** The campaign values the user filled in, in standard UTM order. */
function collectParams(f: Fields): [string, string][] {
  const all: [string, string][] = [
    ["utm_source", f.source],
    ["utm_medium", f.medium],
    ["utm_campaign", f.campaign],
    ["utm_term", f.term],
    ["utm_content", f.content],
  ];
  return all
    .map(([k, v]) => [k, v.trim()] as [string, string])
    .filter(([, v]) => v !== "");
}

/** Builds the final tracking link, or returns an error message. */
function buildLink(mode: Mode, f: Fields): BuildResult {
  const params = collectParams(f);
  const missing = !f.source.trim() || !f.medium.trim() || !f.campaign.trim();
  const note = missing
    ? "Source, medium and campaign name are recommended, so your analytics can group this traffic properly."
    : "";

  if (mode === "web") {
    const raw = f.url.trim();
    if (!raw) return { link: "", error: "", note: "" };

    let parsed: URL;
    try {
      parsed = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    } catch {
      return { link: "", error: "Please enter a valid website URL.", note: "" };
    }
    if (!parsed.hostname.includes(".")) {
      return { link: "", error: "Please enter a valid website URL.", note: "" };
    }

    for (const [key, value] of params) {
      parsed.searchParams.set(key, value);
    }
    return { link: parsed.toString(), error: "", note };
  }

  // Google Play link
  const id = f.appId.trim();
  if (!id) return { link: "", error: "", note: "" };
  if (!PACKAGE_RE.test(id)) {
    return {
      link: "",
      error:
        "That doesn't look like a valid app ID. It usually looks like com.company.app",
      note: "",
    };
  }

  let link = `https://play.google.com/store/apps/details?id=${encodeURIComponent(id)}`;
  if (params.length > 0) {
    const inner = new URLSearchParams();
    for (const [key, value] of params) inner.set(key, value);
    link += `&referrer=${encodeURIComponent(inner.toString())}`;
  }
  return { link, error: "", note };
}

interface FieldBlockProps {
  id: string;
  label: string;
  tag?: "required" | "optional";
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  hint: string;
  examples?: string[];
  className?: string;
}

function FieldBlock({
  id,
  label,
  tag,
  value,
  onChange,
  placeholder,
  hint,
  examples,
  className,
}: FieldBlockProps) {
  return (
    <div className={className}>
      <label htmlFor={id} className={`mb-1.5 block ${labelClass}`}>
        {label}
        {tag === "required" && (
          <span className="text-accent-600"> *</span>
        )}
        {tag === "optional" && (
          <span className="font-medium normal-case tracking-normal text-slate-500 dark:text-slate-400">
            {" "}
            (optional)
          </span>
        )}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputClass}
        autoComplete="off"
      />
      <p className="mt-1.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
        {hint}
      </p>
      {examples && examples.length > 0 && (
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-slate-500 dark:text-slate-400">Try:</span>
          {examples.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => onChange(ex)}
              className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-xs text-slate-700 transition-colors hover:border-accent-500 hover:text-accent-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              {ex}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function UtmLinkBuilderUI() {
  const [mode, setMode] = useState<Mode>("web");
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [copied, setCopied] = useState(false);

  const { link, error, note } = useMemo(
    () => buildLink(mode, fields),
    [mode, fields]
  );
  const usedParams = useMemo(() => collectParams(fields), [fields]);

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

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div>
        <div role="tablist" aria-label="Link type" className="flex flex-wrap gap-2">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "web"}
            onClick={() => setMode("web")}
            className={`${toggleBase} ${mode === "web" ? toggleActive : toggleIdle}`}
          >
            <Globe className="h-4 w-4" aria-hidden="true" />
            Web
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "play"}
            onClick={() => setMode("play")}
            className={`${toggleBase} ${mode === "play" ? toggleActive : toggleIdle}`}
          >
            <Smartphone className="h-4 w-4" aria-hidden="true" />
            Google Play
          </button>
        </div>
        <p className="mt-3 flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
          <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {mode === "web"
            ? "Use this for any website page. Fields marked with * are needed for proper tracking."
            : "Use this for an Android app listed on Google Play. Installs from this link can be traced back to your campaign."}
        </p>
      </div>

      {/* Fields */}
      <div className="grid items-start gap-5 sm:grid-cols-2">
        {mode === "web" ? (
          <FieldBlock
            className="sm:col-span-2"
            id="utm-url"
            label="Website URL"
            value={fields.url}
            onChange={(v) => update("url", v)}
            placeholder="https://example.com/landing-page"
            hint="The exact page you want people to land on."
          />
        ) : (
          <FieldBlock
            className="sm:col-span-2"
            id="utm-app-id"
            label="App ID"
            tag="required"
            value={fields.appId}
            onChange={(v) => update("appId", v)}
            placeholder="com.example.app"
            hint="Your app's package name. In your Play Store link, it is the text right after id="
            examples={["com.example.app"]}
          />
        )}

        <FieldBlock
          id="utm-source"
          label="Campaign source"
          tag="required"
          value={fields.source}
          onChange={(v) => update("source", v)}
          placeholder="google"
          hint="Where the visitor comes from: a site, platform or mailing list."
          examples={["google", "newsletter", "facebook"]}
        />
        <FieldBlock
          id="utm-medium"
          label="Campaign medium"
          tag="required"
          value={fields.medium}
          onChange={(v) => update("medium", v)}
          placeholder="cpc"
          hint="The kind of channel used, such as ads, email or social posts."
          examples={["cpc", "email", "social", "referral"]}
        />
        <FieldBlock
          id="utm-campaign"
          label="Campaign name"
          tag="required"
          value={fields.campaign}
          onChange={(v) => update("campaign", v)}
          placeholder="spring_sale"
          hint="A short label for the offer, launch or promotion you are running."
          examples={["spring_sale", "black_friday", "launch_2026"]}
        />
        <FieldBlock
          id="utm-term"
          label="Campaign term"
          tag="optional"
          value={fields.term}
          onChange={(v) => update("term", v)}
          placeholder="running shoes"
          hint="For paid search only: the keyword you are bidding on."
          examples={["running shoes"]}
        />
        <FieldBlock
          className="sm:col-span-2"
          id="utm-content"
          label="Campaign content"
          tag="optional"
          value={fields.content}
          onChange={(v) => update("content", v)}
          placeholder="blue_button"
          hint="Helps you tell apart two ads or links that point to the same page, for example in an A/B test."
          examples={["blue_button", "logo_link", "header_banner"]}
        />
      </div>

      {/* Messages */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>{error}</p>
        </div>
      )}
      {!error && note && link && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>{note}</p>
        </div>
      )}

      {/* Result */}
      <div className="rounded-md border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <p className={`mb-2 ${labelClass}`}>Your tracking link</p>
        <p
          aria-live="polite"
          className={`break-all rounded-md bg-slate-50 p-3 font-mono text-sm dark:bg-slate-950 ${
            link
              ? "text-slate-900 dark:text-slate-100"
              : "text-slate-500 dark:text-slate-400"
          }`}
        >
          {link ||
            (mode === "web"
              ? "Your link will appear here once you enter a website URL."
              : "Your link will appear here once you enter an app ID.")}
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleCopy}
            disabled={!link}
            className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-bold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
              copied
                ? "bg-emerald-600"
                : "bg-accent-500 hover:bg-accent-600"
            }`}
          >
            {copied ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            {copied ? "Copied!" : "Copy link"}
          </button>
          <button
            type="button"
            onClick={() => setFields(EMPTY)}
            className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition-colors hover:border-accent-500 hover:text-accent-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Clear all
          </button>
        </div>

        {link && usedParams.length > 0 && (
          <div className="mt-5 border-t border-slate-200 pt-4 dark:border-slate-800">
            <p className={`mb-2 ${labelClass}`}>What is in your link</p>
            <dl className="divide-y divide-slate-200 dark:divide-slate-800">
              {usedParams.map(([key, value]) => (
                <div
                  key={key}
                  className="grid gap-1 py-2 sm:grid-cols-3 sm:gap-4"
                >
                  <dt className="font-mono text-sm text-slate-600 dark:text-slate-400">
                    {key}
                  </dt>
                  <dd className="break-words text-sm font-medium text-slate-900 sm:col-span-2 dark:text-slate-100">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}