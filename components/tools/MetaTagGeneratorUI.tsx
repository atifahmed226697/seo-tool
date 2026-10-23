"use client";

import React, { useState } from "react";
import {
  MetaTagFormData,
  initialMetaTagData,
  generateMetaTags,
  getTitleHealth,
  getDescriptionHealth,
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
} from "lucide-react";

export function MetaTagGeneratorUI() {
  const [formData, setFormData] = useState<MetaTagFormData>(initialMetaTagData);
  const [copied, setCopied] = useState(false);

  const handleChange = (
    field: keyof MetaTagFormData,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleClear = () => {
    setFormData(initialMetaTagData);
    setCopied(false);
  };

  const handleCopy = async () => {
    const code = generateMetaTags(formData);
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code: ", err);
    }
  };

  // Live health and validation checks
  const titleHealth = getTitleHealth(formData.title.length);
  const descHealth = getDescriptionHealth(formData.description.length);
  const canonicalCheck = validateHttpUrl(formData.canonical);
  const ogImageCheck = validateHttpUrl(formData.ogImage);
  const twitterImageCheck = validateHttpUrl(formData.twitterImage);

  const generatedHtml = generateMetaTags(formData);

  // Formatted URL for the Google snippet preview
  const displayUrl =
    formData.canonical.trim() || formData.ogUrl.trim() || "https://example.com";
  let parsedDomain = "example.com";
  let parsedPath = "";
  try {
    const parsed = new URL(displayUrl);
    parsedDomain = parsed.hostname;
    parsedPath = parsed.pathname !== "/" ? parsed.pathname.replace(/\/$/, "") : "";
  } catch {
    parsedDomain = displayUrl.replace(/^https?:\/\//i, "").split("/")[0] || "example.com";
  }

  return (
    <div className="space-y-10">
      {/* GOOGLE SEARCH RESULT LIVE PREVIEW */}
      <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="flex items-center gap-2 mb-3">
          <Search className="h-4 w-4 text-indigo-500" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Google Search SERP Preview (Live)
          </h3>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950 max-w-2xl">
          {/* Breadcrumb line */}
          <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 text-[10px] font-bold">
              <Globe className="h-3 w-3" />
            </div>
            <div className="flex items-center gap-1 truncate">
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {parsedDomain}
              </span>
              {parsedPath && (
                <span className="text-slate-400 dark:text-slate-500 truncate">
                  {parsedPath.split("/").filter(Boolean).map((seg) => ` › ${seg}`)}
                </span>
              )}
            </div>
          </div>

          {/* Title link */}
          <h4 className="mt-1.5 text-base sm:text-lg font-medium text-blue-700 hover:underline dark:text-blue-400 cursor-pointer line-clamp-1">
            {formData.title.trim() || "Your Website Title Goes Here"}
          </h4>

          {/* Description snippet */}
          <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {formData.description.trim() ||
              "Enter a meta description below to preview how your page summary will display to search engine users. Ideal length is between 120 and 160 characters."}
          </p>
        </div>
      </div>

      {/* FORM AND CODE BOX GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* FORM INPUTS (Left Column) */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Core SEO Metadata */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2 dark:border-slate-800">
              <Globe className="h-4 w-4 text-indigo-500" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Core SEO Metadata
              </h3>
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <label
                  htmlFor="meta-title"
                  className="font-semibold text-slate-700 dark:text-slate-300"
                >
                  Page Title <span className="text-red-500">*</span>
                </label>
                <span className={titleHealth.colorClass}>
                  {formData.title.length} / 60 ({titleHealth.statusText})
                </span>
              </div>
              <input
                id="meta-title"
                type="text"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="e.g. Best SEO Toolkit & Meta Generator 2026"
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <label
                  htmlFor="meta-desc"
                  className="font-semibold text-slate-700 dark:text-slate-300"
                >
                  Meta Description <span className="text-red-500">*</span>
                </label>
                <span className={descHealth.colorClass}>
                  {formData.description.length} / 160 ({descHealth.statusText})
                </span>
              </div>
              <textarea
                id="meta-desc"
                rows={3}
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="e.g. Generate clean, standards-compliant HTML meta tags, Open Graph, and Twitter Cards to maximize search ranking and social clicks..."
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500"
              />
            </div>

            {/* Keywords & Canonical */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="meta-keywords"
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Keywords (Comma Separated)
                </label>
                <input
                  id="meta-keywords"
                  type="text"
                  value={formData.keywords}
                  onChange={(e) => handleChange("keywords", e.target.value)}
                  placeholder="seo, meta tags, digital marketing"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="meta-canonical"
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Canonical URL
                </label>
                <input
                  id="meta-canonical"
                  type="url"
                  value={formData.canonical}
                  onChange={(e) => handleChange("canonical", e.target.value)}
                  placeholder="https://example.com/page"
                  className={`w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-slate-900 transition-colors focus:outline-none focus:ring-2 ${
                    canonicalCheck.isValid
                      ? "border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      : "border-red-400 focus:border-red-500 focus:ring-red-500/20 dark:border-red-700"
                  }`}
                />
                {!canonicalCheck.isValid && (
                  <p className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                    <AlertCircle className="h-3 w-3" />
                    {canonicalCheck.error}
                  </p>
                )}
              </div>
            </div>

            {/* Robots Directive */}
            <div className="space-y-1.5">
              <label
                htmlFor="meta-robots"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Robots Directives
              </label>
              <select
                id="meta-robots"
                value={formData.robots}
                onChange={(e) =>
                  handleChange(
                    "robots",
                    e.target.value as MetaTagFormData["robots"]
                  )
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                <option value="index,follow">index, follow (Recommended)</option>
                <option value="noindex,follow">noindex, follow</option>
                <option value="index,nofollow">index, nofollow</option>
                <option value="noindex,nofollow">noindex, nofollow</option>
              </select>
            </div>
          </div>

          {/* 2. Open Graph Protocol */}
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Share2 className="h-4 w-4 text-indigo-500" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Open Graph / Facebook
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="og-title"
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  OG Title
                </label>
                <input
                  id="og-title"
                  type="text"
                  value={formData.ogTitle}
                  onChange={(e) => handleChange("ogTitle", e.target.value)}
                  placeholder="Defaults to Page Title if empty"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="og-type"
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  OG Type
                </label>
                <select
                  id="og-type"
                  value={formData.ogType}
                  onChange={(e) => handleChange("ogType", e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
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

            <div className="space-y-1.5">
              <label
                htmlFor="og-desc"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                OG Description
              </label>
              <textarea
                id="og-desc"
                rows={2}
                value={formData.ogDescription}
                onChange={(e) => handleChange("ogDescription", e.target.value)}
                placeholder="Defaults to Meta Description if empty"
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="og-url"
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  OG URL
                </label>
                <input
                  id="og-url"
                  type="url"
                  value={formData.ogUrl}
                  onChange={(e) => handleChange("ogUrl", e.target.value)}
                  placeholder="https://example.com/page"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="og-image"
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  OG Image URL
                </label>
                <input
                  id="og-image"
                  type="url"
                  value={formData.ogImage}
                  onChange={(e) => handleChange("ogImage", e.target.value)}
                  placeholder="https://example.com/og-banner.jpg"
                  className={`w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-slate-900 transition-colors focus:outline-none focus:ring-2 ${
                    ogImageCheck.isValid
                      ? "border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      : "border-red-400 focus:border-red-500 focus:ring-red-500/20 dark:border-red-700"
                  }`}
                />
                {!ogImageCheck.isValid && (
                  <p className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                    <AlertCircle className="h-3 w-3" />
                    {ogImageCheck.error}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 3. Twitter Card Tags */}
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Twitter className="h-4 w-4 text-indigo-500" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Twitter Card
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="twitter-card"
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Card Type
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
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                >
                  <option value="summary_large_image">summary_large_image (Recommended)</option>
                  <option value="summary">summary</option>
                  <option value="app">app</option>
                  <option value="player">player</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="twitter-site"
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Twitter Handle (@username)
                </label>
                <input
                  id="twitter-site"
                  type="text"
                  value={formData.twitterSite}
                  onChange={(e) => handleChange("twitterSite", e.target.value)}
                  placeholder="@yourbrand"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="twitter-title"
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Twitter Title
                </label>
                <input
                  id="twitter-title"
                  type="text"
                  value={formData.twitterTitle}
                  onChange={(e) => handleChange("twitterTitle", e.target.value)}
                  placeholder="Defaults to OG Title if empty"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="twitter-image"
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Twitter Image URL
                </label>
                <input
                  id="twitter-image"
                  type="url"
                  value={formData.twitterImage}
                  onChange={(e) => handleChange("twitterImage", e.target.value)}
                  placeholder="Defaults to OG Image if empty"
                  className={`w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-slate-900 transition-colors focus:outline-none focus:ring-2 ${
                    twitterImageCheck.isValid
                      ? "border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      : "border-red-400 focus:border-red-500 focus:ring-red-500/20 dark:border-red-700"
                  }`}
                />
                {!twitterImageCheck.isValid && (
                  <p className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                    <AlertCircle className="h-3 w-3" />
                    {twitterImageCheck.error}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="twitter-desc"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Twitter Description
              </label>
              <textarea
                id="twitter-desc"
                rows={2}
                value={formData.twitterDescription}
                onChange={(e) => handleChange("twitterDescription", e.target.value)}
                placeholder="Defaults to OG Description if empty"
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>
          </div>
        </div>

        {/* GENERATED HTML OUTPUT BOX (Right Column) */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="sticky top-20 flex flex-col h-full">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <Code2 className="h-4 w-4 text-indigo-500" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Live HTML Meta Output
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClear}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-red-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
                  title="Clear all fields"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Clear
                </button>

                <button
                  type="button"
                  onClick={handleCopy}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold shadow-sm transition-all ${
                    copied
                      ? "bg-emerald-600 text-white"
                      : "bg-indigo-600 text-white hover:bg-indigo-500"
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
                      Copy Tags
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Code Box */}
            <div className="relative flex-1 min-h-[460px] rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-indigo-300 overflow-auto shadow-inner">
              <pre className="whitespace-pre-wrap leading-relaxed select-all">
                {generatedHtml}
              </pre>
            </div>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Empty fields are skipped automatically. Special characters are safely escaped for HTML attributes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
