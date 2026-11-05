"use client";

import { useMemo, useState } from "react";
import { TurnstileWidget } from "@/components/TurnstileWidget";
import {
  Search,
  Globe,
  Loader2,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  Monitor,
  Smartphone,
  Image as ImageIcon,
} from "lucide-react";

type AuditStatus = "pass" | "warn" | "fail";
type RowStatus = AuditStatus | "info";
type Engine = "google" | "bing" | "duckduckgo" | "yahoo";
type Device = "desktop" | "mobile";

interface AuditCheck {
  label: string;
  value: string | number;
  status: AuditStatus;
  suggestion: string;
}

interface MetaAnalysisResult {
  url: string;
  title: string;
  titleLength: number;
  description: string;
  descriptionLength: number;
  canonical: string;
  robots: string;
  viewport: string;
  h1Count: number;
  h1List: string[];
  openGraph: Record<string, string>;
  twitter: Record<string, string>;
  checks: {
    title: AuditCheck;
    description: AuditCheck;
    h1: AuditCheck;
    canonical: AuditCheck;
    ogImage: AuditCheck;
  };
}

interface ChecklistRow {
  tag: string;
  status: RowStatus;
  value: string;
  note: string;
}

const ENGINES: { id: Engine; label: string }[] = [
  { id: "google", label: "Google" },
  { id: "bing", label: "Bing" },
  { id: "duckduckgo", label: "DuckDuckGo" },
  { id: "yahoo", label: "Yahoo" },
];

/** Approximate pixel limits before a search engine cuts the text. */
const LIMITS: Record<Device, { title: number; description: number }> = {
  desktop: { title: 580, description: 920 },
  mobile: { title: 600, description: 980 },
};

const TITLE_FONT = "20px Arial";
const DESC_FONT = "14px Arial";

/* ---------- Pixel measuring helpers ---------- */

let measureContext: CanvasRenderingContext2D | null = null;

/** Width of the text in pixels, using a hidden canvas. */
function measureText(text: string, font: string): number {
  if (typeof document === "undefined") return text.length * 7;
  if (!measureContext) {
    measureContext = document.createElement("canvas").getContext("2d");
  }
  if (!measureContext) return text.length * 7;
  measureContext.font = font;
  return measureContext.measureText(text).width;
}

/** Cuts the text with "..." if it is wider than maxPx. */
function truncateToWidth(text: string, font: string, maxPx: number) {
  if (measureText(text, font) <= maxPx) return { text, cut: false };
  let low = 0;
  let high = text.length;
  while (low < high) {
    const mid = Math.ceil((low + high) / 2);
    if (measureText(text.slice(0, mid).trimEnd() + "…", font) <= maxPx) low = mid;
    else high = mid - 1;
  }
  return { text: text.slice(0, low).trimEnd() + "…", cut: true };
}

/* ---------- Small shared pieces ---------- */

const INPUT_CLASS =
  "w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 placeholder-slate-400 outline-none transition-colors focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500";

const LABEL_CLASS =
  "mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300";

const tabBase = "rounded-md border px-4 py-2 text-sm font-bold transition-colors";
const tabActive =
  "border-indigo-700 bg-indigo-700 text-white dark:border-accent-500 dark:bg-accent-500";
const tabIdle =
  "border-slate-300 bg-white text-slate-700 hover:border-accent-500 hover:text-accent-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:text-accent-400";

const STATUS_STYLES: Record<
  RowStatus,
  { chip: string; label: string; Icon: typeof CheckCircle2 }
> = {
  pass: {
    chip: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
    label: "Good",
    Icon: CheckCircle2,
  },
  warn: {
    chip: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
    label: "Review",
    Icon: AlertTriangle,
  },
  fail: {
    chip: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
    label: "Fix",
    Icon: XCircle,
  },
  info: {
    chip: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    label: "Optional",
    Icon: Info,
  },
};

/** Bar that shows how much of the pixel limit is used. */
function PixelBar({ pixels, limit }: { pixels: number; limit: number }) {
  let bar = "bg-slate-300 dark:bg-slate-700";
  let text = "text-slate-500";
  let message = "Empty";

  if (pixels > 0 && pixels < limit * 0.5) {
    bar = "bg-accent-400";
    text = "text-accent-600 dark:text-accent-400";
    message = "Below preview guide";
  } else if (pixels >= limit * 0.5 && pixels <= limit) {
    bar = "bg-emerald-500";
    text = "text-emerald-600 dark:text-emerald-400";
    message = "Within preview guide";
  } else if (pixels > limit) {
    bar = "bg-red-500";
    text = "text-red-600 dark:text-red-400";
    message = "Exceeds preview estimate";
  }

  return (
    <div className="mt-2">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div
          className={`h-full rounded-full transition-all duration-300 ${bar}`}
          style={{ width: `${Math.min(100, (pixels / limit) * 100)}%` }}
        />
      </div>
      <p className={`mt-1 text-xs font-semibold tabular-nums ${text}`}>
        {Math.round(pixels)} / {limit} px &nbsp;·&nbsp; {message}
      </p>
    </div>
  );
}

/** Turns "https://example.com/a/b" into domain and path parts. */
function splitUrl(raw: string) {
  try {
    const parsed = new URL(raw);
    const path = parsed.pathname.replace(/\/$/, "").split("/").filter(Boolean);
    return { domain: parsed.hostname, path, full: parsed.href };
  } catch {
    const domain = raw.replace(/^https?:\/\//i, "").split("/")[0] || "example.com";
    return { domain, path: [] as string[], full: raw };
  }
}

/* ---------- Search engine snippet preview ---------- */

function SnippetPreview({
  engine,
  device,
  url,
  title,
  description,
}: {
  engine: Engine;
  device: Device;
  url: string;
  title: string;
  description: string;
}) {
  const limits = LIMITS[device];
  const shownTitle = truncateToWidth(
    title.trim() || "Your page title goes here",
    TITLE_FONT,
    limits.title
  ).text;
  const shownDesc = truncateToWidth(
    description.trim() ||
      "Your meta description goes here. Write a short summary of the page so people know what to expect before they click.",
    DESC_FONT,
    limits.description
  ).text;

  const { domain, path, full } = splitUrl(url);
  const isMobile = device === "mobile";
  const font = { fontFamily: "Arial, Helvetica, sans-serif" };

  const Favicon = (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
      <Globe className="h-3.5 w-3.5" />
    </span>
  );

  const titleEl = (
    <h4
      className={`cursor-pointer text-xl font-normal leading-snug text-[#1a0dab] hover:underline ${
        isMobile ? "" : "truncate"
      }`}
      style={font}
    >
      {shownTitle}
    </h4>
  );

  const descEl = (
    <p className="mt-1 text-sm leading-relaxed text-[#4d5156]" style={font}>
      {shownDesc}
    </p>
  );

  return (
    <div
      className={`rounded-md border border-slate-200 bg-white p-4 text-slate-800 ${
        isMobile ? "max-w-[390px]" : "max-w-[640px]"
      }`}
    >
      {engine === "google" && (
        <>
          <div className="flex items-center gap-2.5" style={font}>
            {Favicon}
            <div className="min-w-0 truncate text-sm leading-tight">
              <span className="text-[#202124]">{domain}</span>
              {path.length > 0 && (
                <span className="text-[#4d5156]"> › {path.join(" › ")}</span>
              )}
            </div>
          </div>
          <div className="mt-2">{titleEl}</div>
          {descEl}
        </>
      )}

      {engine === "bing" && (
        <>
          <div className="mt-0.5">{titleEl}</div>
          <p className="mt-0.5 truncate text-sm text-[#006621]" style={font}>
            {full}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-[#4d5156]" style={font}>
            <span className="mr-1.5 rounded border border-slate-300 px-1 text-[10px] text-slate-500">
              Web
            </span>
            {shownDesc}
          </p>
        </>
      )}

      {engine === "duckduckgo" && (
        <>
          <div className="flex items-center gap-2" style={font}>
            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-sm bg-slate-100 text-slate-500">
              <Globe className="h-3 w-3" />
            </span>
            <span className="truncate text-sm text-[#202124]">{full}</span>
          </div>
          <div className="mt-1">{titleEl}</div>
          {descEl}
        </>
      )}

      {engine === "yahoo" && (
        <>
          <p className="truncate text-sm text-[#202124]" style={font}>
            {full}
          </p>
          <div className="mt-1">{titleEl}</div>
          {descEl}
        </>
      )}
    </div>
  );
}

/* ---------- Social previews ---------- */

function SocialCard({
  variant,
  imageUrl,
  domain,
  title,
  description,
}: {
  variant: "facebook" | "x";
  imageUrl: string;
  domain: string;
  title: string;
  description: string;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = imageUrl && !imageFailed;

  return (
    <div className="overflow-hidden rounded-md border border-slate-200 bg-white dark:border-slate-700">
      <div className="flex aspect-[1.91/1] items-center justify-center bg-slate-100 dark:bg-slate-800">
        {showImage ? (
          <img
            src={imageUrl}
            alt=""
            referrerPolicy="no-referrer"
            loading="lazy"
            onError={() => setImageFailed(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-1 text-slate-400">
            <ImageIcon className="h-8 w-8" />
            <span className="text-xs">
              {imageUrl ? "Image could not be loaded" : "No image set"}
            </span>
          </div>
        )}
      </div>
      <div
        className={`space-y-1 p-3 ${
          variant === "facebook" ? "bg-slate-50 dark:bg-slate-900" : "bg-white dark:bg-slate-900"
        }`}
      >
        <p
          className={`truncate text-xs text-slate-500 dark:text-slate-400 ${
            variant === "facebook" ? "uppercase" : ""
          }`}
        >
          {domain}
        </p>
        <p className="line-clamp-2 text-sm font-bold text-slate-900 dark:text-slate-100">
          {title || "(No title)"}
        </p>
        <p className="line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
          {description || "(No description)"}
        </p>
      </div>
    </div>
  );
}

/* ---------- Checklist builder ---------- */

function buildChecklist(r: MetaAnalysisResult): ChecklistRow[] {
  const og = r.openGraph;
  const tw = r.twitter;
  const hasOg = Object.keys(og).length > 0;

  const twitterRow = (tag: string, key: string, ogKey: string, label: string): ChecklistRow => {
    if (tw[key]) return { tag, status: "pass", value: tw[key], note: "Present." };
    if (og[ogKey]) {
      return {
        tag,
        status: "info",
        value: "Not set",
        note: `X may use the Open Graph ${label} as a fallback.`,
      };
    }
    return { tag, status: "warn", value: "Missing", note: `Add ${key} so shared links look right.` };
  };

  const ogImage = og["og:image"] || "";
  let ogImageRow: ChecklistRow;
  if (!ogImage) {
    ogImageRow = {
      tag: "Open Graph image",
      status: "warn",
      value: "Missing",
      note: "Consider adding og:image for link previews. Display depends on the platform and image accessibility.",
    };
  } else if (!/^https?:\/\//i.test(ogImage)) {
    ogImageRow = {
      tag: "Open Graph image",
      status: "warn",
      value: ogImage,
      note: "Use a full image address starting with https://.",
    };
  } else {
    ogImageRow = { tag: "Open Graph image", status: "pass", value: ogImage, note: "Present." };
  }

  let robotsRow: ChecklistRow;
  if (!r.robots) {
    robotsRow = {
      tag: "Robots",
      status: "info",
      value: "Not set",
      note: "No robots meta tag found. This does not confirm indexability; HTTP headers and other restrictions are not checked.",
    };
  } else if (/noindex/i.test(r.robots)) {
    robotsRow = {
      tag: "Robots",
      status: "warn",
      value: r.robots,
      note: "This page asks search engines not to index it. Remove noindex if you want it in search results.",
    };
  } else {
    robotsRow = { tag: "Robots", status: "pass", value: r.robots, note: "No noindex value detected in this robots meta tag. This does not confirm indexing eligibility or status." };
  }

  return [
    {
      tag: "Title",
      status: r.checks.title.status,
      value: r.title || "Missing",
      note: `${r.checks.title.value}. ${r.checks.title.suggestion}`,
    },
    {
      tag: "Meta description",
      status: r.checks.description.status,
      value: r.description || "Missing",
      note: `${r.checks.description.value}. ${r.checks.description.suggestion}`,
    },
    {
      tag: "Canonical",
      status: r.checks.canonical.status,
      value: r.canonical || "Missing",
      note: r.checks.canonical.suggestion,
    },
    robotsRow,
    r.viewport
      ? { tag: "Viewport", status: "pass", value: r.viewport, note: "Present." }
      : {
          tag: "Viewport",
          status: "warn",
          value: "Missing",
          note: "Add a viewport tag so the page displays correctly on phones.",
        },
    og["og:title"]
      ? { tag: "Open Graph title", status: "pass", value: og["og:title"], note: "Present." }
      : {
          tag: "Open Graph title",
          status: "warn",
          value: "Missing",
          note: "Add og:title so shared links show a proper headline.",
        },
    og["og:description"]
      ? { tag: "Open Graph description", status: "pass", value: og["og:description"], note: "Present." }
      : {
          tag: "Open Graph description",
          status: "warn",
          value: "Missing",
          note: "Add og:description so shared links show a short summary.",
        },
    ogImageRow,
    og["og:type"]
      ? { tag: "Open Graph type", status: "pass", value: og["og:type"], note: "Present." }
      : { tag: "Open Graph type", status: "info", value: "Not set", note: "Optional, for example website or article." },
    og["og:url"]
      ? { tag: "Open Graph URL", status: "pass", value: og["og:url"], note: "Present." }
      : { tag: "Open Graph URL", status: "info", value: "Not set", note: "Optional but recommended." },
    tw["twitter:card"]
      ? { tag: "Twitter card", status: "pass", value: tw["twitter:card"], note: "Present." }
      : {
          tag: "Twitter card",
          status: hasOg ? "warn" : "warn",
          value: "Missing",
          note: "Add twitter:card, for example summary_large_image.",
        },
    twitterRow("Twitter title", "twitter:title", "og:title", "title"),
    twitterRow("Twitter description", "twitter:description", "og:description", "description"),
    twitterRow("Twitter image", "twitter:image", "og:image", "image"),
    {
      tag: "H1",
      status: r.checks.h1.status,
      value: r.h1List[0] ? `${r.checks.h1.value}: ${r.h1List[0]}` : String(r.checks.h1.value),
      note: r.checks.h1.suggestion,
    },
  ];
}

/* ---------- Main component ---------- */

export default function MetaTagAnalyzerUI() {
  const [engine, setEngine] = useState<Engine>("google");
  const [device, setDevice] = useState<Device>("desktop");

  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [snippetUrl, setSnippetUrl] = useState("https://www.example.com");

  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  const [error, setError] = useState("");
  const [result, setResult] = useState<MetaAnalysisResult | null>(null);

  async function handleAnalyze(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim() || loading || !turnstileToken) return;

    const verificationToken = turnstileToken;
    setTurnstileToken("");
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/meta-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          turnstileToken: verificationToken,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setResult(null);
      } else {
        const found = data as MetaAnalysisResult;
        setResult(found);
        // Fill the snippet editor with the real values from the page
        setTitle(found.title);
        setDescription(found.description);
        setSnippetUrl(found.url);
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
      setResult(null);
    } finally {
      setLoading(false);
      setTurnstileToken("");
      setTurnstileResetKey((value) => value + 1);
    }
  }

  const limits = LIMITS[device];
  const titlePixels = useMemo(() => measureText(title, TITLE_FONT), [title]);
  const descPixels = useMemo(() => measureText(description, DESC_FONT), [description]);

  const checklist = useMemo(() => (result ? buildChecklist(result) : []), [result]);
  const issueCount = checklist.filter((row) => row.status === "warn" || row.status === "fail").length;

  // Values used by the social previews
  const social = useMemo(() => {
    if (!result) return null;
    const og = result.openGraph;
    const tw = result.twitter;
    const resolve = (src: string) => {
      if (!src) return "";
      try {
        return new URL(src, result.url).href;
      } catch {
        return src;
      }
    };
    return {
      domain: splitUrl(result.url).domain,
      fbTitle: og["og:title"] || result.title,
      fbDesc: og["og:description"] || result.description,
      fbImage: resolve(og["og:image"] || ""),
      xTitle: tw["twitter:title"] || og["og:title"] || result.title,
      xDesc: tw["twitter:description"] || og["og:description"] || result.description,
      xImage: resolve(tw["twitter:image"] || og["og:image"] || ""),
    };
  }, [result]);

  return (
    <div className="space-y-8">
      {/* SEARCH PREVIEW AND EDITOR */}
      <div className="rounded-md border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/50">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {ENGINES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setEngine(item.id)}
                aria-pressed={engine === item.id}
                className={`${tabBase} ${engine === item.id ? tabActive : tabIdle}`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="inline-flex rounded-md border border-slate-300 bg-white p-0.5 dark:border-slate-700 dark:bg-slate-900">
            {(
              [
                { id: "desktop", label: "Desktop", Icon: Monitor },
                { id: "mobile", label: "Mobile", Icon: Smartphone },
              ] as { id: Device; label: string; Icon: typeof Monitor }[]
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
                <item.Icon className="h-3.5 w-3.5" />
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <p className="mb-3 text-xs text-slate-600 dark:text-slate-400">
          Approximate preview. Search engines may change the title, snippet and
          layout. Editing here does not update the checked website.
        </p>

        <SnippetPreview
          engine={engine}
          device={device}
          url={snippetUrl}
          title={title}
          description={description}
        />

        {/* Edit snippet */}
        <div className="mt-6 space-y-5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Edit snippet
          </p>

          <form onSubmit={handleAnalyze}>
            <label htmlFor="analyzer-url" className={LABEL_CLASS}>
              Page URL
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Globe
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  id="analyzer-url"
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://yourwebsite.com/blog/my-post"
                  autoComplete="off"
                  className={`${INPUT_CLASS} pl-10`}
                />
              </div>
              <button
                type="submit"
                disabled={loading || !url.trim() || !turnstileToken}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-accent-500 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Search className="h-4 w-4" aria-hidden="true" />
                )}
                {loading ? "Checking..." : "Check meta tags"}
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Enter a public page URL. Private or internal addresses are blocked for security.
              You can also skip this and type your own title and description below.
            </p>
            <TurnstileWidget
              action="meta-analyze"
              onToken={setTurnstileToken}
              resetKey={turnstileResetKey}
            />
          </form>

          {error && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-md border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
            >
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="snippet-title" className={LABEL_CLASS}>
              Title
            </label>
            <input
              id="snippet-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter the title here"
              className={INPUT_CLASS}
            />
            <PixelBar pixels={titlePixels} limit={limits.title} />
          </div>

          <div>
            <label htmlFor="snippet-desc" className={LABEL_CLASS}>
              Description
            </label>
            <textarea
              id="snippet-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter the description here"
              className={INPUT_CLASS}
            />
            <PixelBar pixels={descPixels} limit={limits.description} />
          </div>
        </div>
      </div>

      {/* EMPTY STATE */}
      {!result && !loading && !error && (
        <p className="rounded-md border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-600 dark:border-slate-700 dark:text-slate-400">
          Enter a page URL above and click Check meta tags to see social previews and a full
          checklist.
        </p>
      )}

      {/* RESULTS */}
      {result && social && (
        <div className="space-y-8">
          {/* Summary */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-slate-300 bg-white px-5 py-4 dark:border-slate-700 dark:bg-slate-900">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                Checked {result.url}
              </p>
              <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">
                {issueCount === 0
                  ? "No review flags in these HTML checks."
                  : `${issueCount} ${issueCount === 1 ? "item" : "items"} to review in the fetched HTML.`}
              </p>
            </div>
            <span
              className={`rounded-md px-3 py-1.5 text-xs font-bold ${
                issueCount === 0
                  ? STATUS_STYLES.pass.chip
                  : STATUS_STYLES.warn.chip
              }`}
            >
              {issueCount === 0 ? "Checks complete" : "Review suggested"}
            </span>
          </div>

          {/* Social previews */}
          <div>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Social preview estimates
            </h3>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <p className="mb-2 text-xs font-bold text-slate-600 dark:text-slate-400">
                  Facebook
                </p>
                <SocialCard
                  key={`fb-${social.fbImage}`}
                  variant="facebook"
                  imageUrl={social.fbImage}
                  domain={social.domain}
                  title={social.fbTitle}
                  description={social.fbDesc}
                />
              </div>
              <div>
                <p className="mb-2 text-xs font-bold text-slate-600 dark:text-slate-400">
                  X (Twitter)
                </p>
                <SocialCard
                  key={`x-${social.xImage}`}
                  variant="x"
                  imageUrl={social.xImage}
                  domain={social.domain}
                  title={social.xTitle}
                  description={social.xDesc}
                />
              </div>
            </div>
          </div>

          {/* Checklist */}
          <div>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Fetched HTML checklist
            </h3>
            <div className="overflow-x-auto rounded-md border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-400">
                    <th className="px-4 py-3">Tag</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Value and advice</th>
                  </tr>
                </thead>
                <tbody>
                  {checklist.map((row) => {
                    const style = STATUS_STYLES[row.status];
                    return (
                      <tr
                        key={row.tag}
                        className="border-b border-slate-100 align-top last:border-0 dark:border-slate-800/60"
                      >
                        <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">
                          {row.tag}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${style.chip}`}
                          >
                            <style.Icon className="h-3.5 w-3.5" aria-hidden="true" />
                            {style.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="break-words text-slate-800 dark:text-slate-200">
                            {row.value}
                          </p>
                          <p className="mt-0.5 text-slate-500 dark:text-slate-400">{row.note}</p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}