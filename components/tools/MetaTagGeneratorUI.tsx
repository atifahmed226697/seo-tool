"use client";

import React, { useState } from "react";
import {
  MetaTagFormData,
  initialMetaTagData,
  generateMetaTags,
  validateHttpUrl,
} from "@/lib/metaUtils";
import {
  Copy,
  Check,
  RotateCcw,
  Code2,
  Globe,
  Share2,
  Twitter,
  Search,
  AlertCircle,
  Monitor,
  Smartphone,
} from "lucide-react";

type TabId = "core" | "facebook" | "twitter";
type Device = "desktop" | "mobile";

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "core", label: "Core SEO", icon: Globe },
  { id: "facebook", label: "Facebook", icon: Share2 },
  { id: "twitter", label: "Twitter", icon: Twitter },
];

// Shared input styles
const INPUT_BASE =
  "w-full rounded-md border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500";
const INPUT_OK =
  "border-slate-300 focus:border-accent-500 focus:ring-accent-500/20 dark:border-slate-700";
const INPUT_BAD =
  "border-red-400 focus:border-red-500 focus:ring-red-500/20 dark:border-red-700";
const LABEL = "text-xs font-bold text-slate-700 dark:text-slate-300";

function inputClass(valid = true): string {
  return `${INPUT_BASE} ${valid ? INPUT_OK : INPUT_BAD}`;
}

/** Colour and message for a length bar. */
function lengthState(length: number, min: number, max: number) {
  if (length === 0) {
    return { bar: "bg-slate-300 dark:bg-slate-700", text: "text-slate-500", message: "Empty" };
  }
  if (length < min) {
    return { bar: "bg-accent-400", text: "text-accent-600 dark:text-accent-400", message: "A bit short" };
  }
  if (length <= max) {
    return { bar: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400", message: "Good length" };
  }
  return { bar: "bg-red-500", text: "text-red-600 dark:text-red-400", message: "Too long" };
}

function LengthBar({ length, min, max }: { length: number; min: number; max: number }) {
  const state = lengthState(length, min, max);
  const percent = Math.min(100, (length / max) * 100);
  return (
    <div className="mt-2">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div
          className={`h-full rounded-full transition-all duration-300 ${state.bar}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className={`mt-1 text-xs font-semibold tabular-nums ${state.text}`}>
        {length} / {max} &nbsp;·&nbsp; {state.message}
      </p>
    </div>
  );
}

/** Splits a line of HTML into coloured pieces for the code panel. */
const TOKEN = /(<!--[\s\S]*?-->|<\/?[a-zA-Z][\w-]*|\/?>|[\w:-]+(?==")|"[^"]*")/g;

function highlightLine(line: string): React.ReactNode[] {
  return line.split(TOKEN).map((part, i) => {
    if (!part) return null;
    // Even positions are plain text between tokens
    if (i % 2 === 0) return <span key={i}>{part}</span>;

    let color = "text-slate-200";
    if (part.startsWith("<!--")) color = "text-slate-500 italic";
    else if (/^<\/?[a-zA-Z]/.test(part)) color = "text-accent-400";
    else if (part === ">" || part === "/>") color = "text-accent-400";
    else if (part.startsWith('"')) color = "text-emerald-300";
    else if (/^[\w:-]+$/.test(part)) color = "text-sky-300";

    return (
      <span key={i} className={color}>
        {part}
      </span>
    );
  });
}

export function MetaTagGeneratorUI() {
  const [formData, setFormData] = useState<MetaTagFormData>(initialMetaTagData);
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<TabId>("core");
  const [device, setDevice] = useState<Device>("desktop");

  const handleChange = (field: keyof MetaTagFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleClear = () => {
    setFormData(initialMetaTagData);
    setCopied(false);
  };

  const generatedHtml = generateMetaTags(formData);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedHtml);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code: ", err);
    }
  };

  // Live validation checks
  const canonicalCheck = validateHttpUrl(formData.canonical);
  const ogImageCheck = validateHttpUrl(formData.ogImage);
  const twitterImageCheck = validateHttpUrl(formData.twitterImage);

  // Address shown in the Google preview
  const displayUrl =
    formData.canonical.trim() || formData.ogUrl.trim() || "https://example.com";
  let parsedDomain = "example.com";
  let parsedPath = "";
  try {
    const parsed = new URL(displayUrl);
    parsedDomain = parsed.hostname;
    parsedPath =
      parsed.pathname !== "/"
        ? parsed.pathname.replace(/\/$/, "").split("/").filter(Boolean).join(" › ")
        : "";
  } catch {
    parsedDomain = displayUrl.replace(/^https?:\/\//i, "").split("/")[0] || "example.com";
  }

  const isMobile = device === "mobile";
  const lines = generatedHtml.split("\n");
  const tagCount = lines.filter((l) => /^\s*<(meta|title|link)/.test(l)).length;

  return (
    <div className="space-y-8">
      {/* GOOGLE PREVIEW */}
      <div className="rounded-md border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/50">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-accent-600 dark:text-accent-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Google preview
            </h3>
          </div>

          <div className="inline-flex rounded-md border border-slate-300 bg-white p-0.5 dark:border-slate-700 dark:bg-slate-900">
            {(
              [
                { id: "desktop", label: "Desktop", icon: Monitor },
                { id: "mobile", label: "Mobile", icon: Smartphone },
              ] as { id: Device; label: string; icon: React.ElementType }[]
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setDevice(item.id)}
                aria-pressed={device === item.id}
                className={`inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-bold transition-colors ${
                  device === item.id
                    ? "bg-indigo-700 text-white dark:bg-accent-500"
                    : "text-slate-600 hover:text-accent-600 dark:text-slate-300"
                }`}
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div
          className={`rounded-md border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950 ${
            isMobile ? "max-w-[360px]" : "max-w-2xl"
          }`}
        >
          <div className="flex items-center gap-2 text-xs">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <Globe className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0 truncate">
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {parsedDomain}
              </span>
              {parsedPath && (
                <span className="text-slate-400 dark:text-slate-500"> › {parsedPath}</span>
              )}
            </div>
          </div>

          <h4
            className={`mt-2 cursor-pointer font-sans font-medium text-blue-700 hover:underline dark:text-blue-400 ${
              isMobile ? "line-clamp-2 text-lg leading-snug" : "line-clamp-1 text-xl"
            }`}
          >
            {formData.title.trim() || "Your page title goes here"}
          </h4>

          <p
            className={`mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400 ${
              isMobile ? "line-clamp-3" : "line-clamp-2"
            }`}
          >
            {formData.description.trim() ||
              "Write a meta description below to see how your page summary will look to people searching on Google. Aim for 120 to 160 characters."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* FORM */}
        <div className="space-y-5 lg:col-span-7">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3 dark:border-slate-800">
            {TABS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                aria-pressed={tab === item.id}
                className={`inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-bold transition-colors ${
                  tab === item.id
                    ? "border-indigo-700 bg-indigo-700 text-white dark:border-accent-500 dark:bg-accent-500"
                    : "border-slate-300 bg-white text-slate-700 hover:border-accent-500 hover:text-accent-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:text-accent-400"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </div>

          {/* CORE SEO TAB */}
          {tab === "core" && (
            <div className="space-y-5">
              <div>
                <label htmlFor="meta-title" className={LABEL}>
                  Page title <span className="text-red-500">*</span>
                </label>
                <input
                  id="meta-title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  placeholder="e.g. Best SEO Toolkit & Meta Generator 2026"
                  className={`mt-1.5 ${inputClass()}`}
                />
                <LengthBar length={formData.title.length} min={30} max={60} />
              </div>

              <div>
                <label htmlFor="meta-desc" className={LABEL}>
                  Meta description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="meta-desc"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="e.g. Generate clean HTML meta tags, Open Graph and Twitter Cards to get more clicks from search and social."
                  className={`mt-1.5 ${inputClass()}`}
                />
                <LengthBar length={formData.description.length} min={120} max={160} />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="meta-keywords" className={LABEL}>
                    Keywords (comma separated)
                  </label>
                  <input
                    id="meta-keywords"
                    type="text"
                    value={formData.keywords}
                    onChange={(e) => handleChange("keywords", e.target.value)}
                    placeholder="seo, meta tags, digital marketing"
                    className={`mt-1.5 ${inputClass()}`}
                  />
                </div>

                <div>
                  <label htmlFor="meta-canonical" className={LABEL}>
                    Canonical URL
                  </label>
                  <input
                    id="meta-canonical"
                    type="url"
                    value={formData.canonical}
                    onChange={(e) => handleChange("canonical", e.target.value)}
                    placeholder="https://example.com/page"
                    className={`mt-1.5 ${inputClass(canonicalCheck.isValid)}`}
                  />
                  {!canonicalCheck.isValid && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                      <AlertCircle className="h-3 w-3" />
                      {canonicalCheck.error}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="meta-robots" className={LABEL}>
                  Robots directives
                </label>
                <select
                  id="meta-robots"
                  value={formData.robots}
                  onChange={(e) =>
                    handleChange("robots", e.target.value as MetaTagFormData["robots"])
                  }
                  className={`mt-1.5 ${inputClass()}`}
                >
                  <option value="index,follow">index, follow (Recommended)</option>
                  <option value="noindex,follow">noindex, follow</option>
                  <option value="index,nofollow">index, nofollow</option>
                  <option value="noindex,nofollow">noindex, nofollow</option>
                </select>
              </div>
            </div>
          )}

          {/* FACEBOOK TAB */}
          {tab === "facebook" && (
            <div className="space-y-5">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Optional. Empty fields use your page title and description.
              </p>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="og-title" className={LABEL}>
                    OG title
                  </label>
                  <input
                    id="og-title"
                    type="text"
                    value={formData.ogTitle}
                    onChange={(e) => handleChange("ogTitle", e.target.value)}
                    placeholder="Defaults to Page Title if empty"
                    className={`mt-1.5 ${inputClass()}`}
                  />
                </div>

                <div>
                  <label htmlFor="og-type" className={LABEL}>
                    OG type
                  </label>
                  <select
                    id="og-type"
                    value={formData.ogType}
                    onChange={(e) => handleChange("ogType", e.target.value)}
                    className={`mt-1.5 ${inputClass()}`}
                  >
                    <option value="website">website (Default)</option>
                    <option value="article">article</option>
                    <option value="product">product</option>
                    <option value="profile">profile</option>
                    <option value="book">book</option>
                    <option value="video.other">video.other</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="og-desc" className={LABEL}>
                  OG description
                </label>
                <textarea
                  id="og-desc"
                  rows={2}
                  value={formData.ogDescription}
                  onChange={(e) => handleChange("ogDescription", e.target.value)}
                  placeholder="Defaults to Meta Description if empty"
                  className={`mt-1.5 ${inputClass()}`}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="og-url" className={LABEL}>
                    OG URL
                  </label>
                  <input
                    id="og-url"
                    type="url"
                    value={formData.ogUrl}
                    onChange={(e) => handleChange("ogUrl", e.target.value)}
                    placeholder="https://example.com/page"
                    className={`mt-1.5 ${inputClass()}`}
                  />
                </div>

                <div>
                  <label htmlFor="og-image" className={LABEL}>
                    OG image URL
                  </label>
                  <input
                    id="og-image"
                    type="url"
                    value={formData.ogImage}
                    onChange={(e) => handleChange("ogImage", e.target.value)}
                    placeholder="https://example.com/og-banner.jpg"
                    className={`mt-1.5 ${inputClass(ogImageCheck.isValid)}`}
                  />
                  {!ogImageCheck.isValid && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                      <AlertCircle className="h-3 w-3" />
                      {ogImageCheck.error}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TWITTER TAB */}
          {tab === "twitter" && (
            <div className="space-y-5">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Optional. Empty fields use your Facebook (Open Graph) values.
              </p>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="twitter-card" className={LABEL}>
                    Card type
                  </label>
                  <select
                    id="twitter-card"
                    value={formData.twitterCard}
                    onChange={(e) =>
                      handleChange(
                        "twitterCard",
                        e.target.value as MetaTagFormData["twitterCard"]
                      )
                    }
                    className={`mt-1.5 ${inputClass()}`}
                  >
                    <option value="summary_large_image">summary_large_image (Recommended)</option>
                    <option value="summary">summary</option>
                    <option value="app">app</option>
                    <option value="player">player</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="twitter-site" className={LABEL}>
                    Twitter handle (@username)
                  </label>
                  <input
                    id="twitter-site"
                    type="text"
                    value={formData.twitterSite}
                    onChange={(e) => handleChange("twitterSite", e.target.value)}
                    placeholder="@yourbrand"
                    className={`mt-1.5 ${inputClass()}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="twitter-title" className={LABEL}>
                    Twitter title
                  </label>
                  <input
                    id="twitter-title"
                    type="text"
                    value={formData.twitterTitle}
                    onChange={(e) => handleChange("twitterTitle", e.target.value)}
                    placeholder="Defaults to OG Title if empty"
                    className={`mt-1.5 ${inputClass()}`}
                  />
                </div>

                <div>
                  <label htmlFor="twitter-image" className={LABEL}>
                    Twitter image URL
                  </label>
                  <input
                    id="twitter-image"
                    type="url"
                    value={formData.twitterImage}
                    onChange={(e) => handleChange("twitterImage", e.target.value)}
                    placeholder="Defaults to OG Image if empty"
                    className={`mt-1.5 ${inputClass(twitterImageCheck.isValid)}`}
                  />
                  {!twitterImageCheck.isValid && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                      <AlertCircle className="h-3 w-3" />
                      {twitterImageCheck.error}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="twitter-desc" className={LABEL}>
                  Twitter description
                </label>
                <textarea
                  id="twitter-desc"
                  rows={2}
                  value={formData.twitterDescription}
                  onChange={(e) => handleChange("twitterDescription", e.target.value)}
                  placeholder="Defaults to OG Description if empty"
                  className={`mt-1.5 ${inputClass()}`}
                />
              </div>
            </div>
          )}
        </div>

        {/* CODE OUTPUT (stays in view while scrolling on large screens) */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-20">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Code2 className="h-4 w-4 text-accent-600 dark:text-accent-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Your meta tags
                </h3>
                <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {tagCount} tags
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClear}
                  title="Clear all fields"
                  className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition-colors hover:border-red-400 hover:text-red-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:text-red-400"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Clear
                </button>

                <button
                  type="button"
                  onClick={handleCopy}
                  className={`inline-flex items-center gap-1.5 rounded-md px-4 py-1.5 text-xs font-bold text-white transition-colors ${
                    copied ? "bg-emerald-600" : "bg-accent-500 hover:bg-accent-600"
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copy tags
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="max-h-[70vh] min-h-[320px] overflow-auto rounded-md border border-slate-800 bg-slate-950 p-4 font-mono text-xs leading-relaxed">
              {generatedHtml.trim() ? (
                <pre className="whitespace-pre-wrap break-words text-slate-200">
                  {lines.map((line, i) => (
                    <div key={i}>{line ? highlightLine(line) : "\u00A0"}</div>
                  ))}
                </pre>
              ) : (
                <p className="text-slate-500">Fill in the page title to see your tags here.</p>
              )}
            </div>

            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Empty fields are skipped automatically. Special characters are safely escaped for
              HTML attributes. Paste the tags inside your page&apos;s &lt;head&gt;.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}