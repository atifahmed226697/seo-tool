"use client";

import { useState } from "react";
import { TurnstileWidget } from "@/components/TurnstileWidget";
import { Search, Loader2, AlertCircle, Image as ImageIcon } from "lucide-react";

interface ImageItem {
  src: string;
  alt: string | null;
}

interface Result {
  url: string;
  images: ImageItem[];
}

type Status = "missing" | "empty" | "ok";
type Filter = "all" | Status;

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

const EXAMPLES = ["https://example.com", "https://www.wikipedia.org"];

const statusText: Record<Status, string> = {
  missing: "text-red-700 dark:text-red-400",
  empty: "text-amber-700 dark:text-amber-400",
  ok: "text-emerald-700 dark:text-emerald-400",
};
const statusDot: Record<Status, string> = {
  missing: "bg-red-600",
  empty: "bg-amber-500",
  ok: "bg-emerald-600",
};

const statusInfo: Record<Status, { label: string; explain: string }> = {
  missing: {
    label: "No alt",
    explain:
      "This image has no alt attribute. Add a short description so screen readers and search engines understand it.",
  },
  empty: {
    label: "Empty alt",
    explain:
      "The alt text is blank. That is fine for purely decorative images, but add a description if the image carries meaning.",
  },
  ok: {
    label: "Has alt",
    explain: "This image has alt text.",
  },
};

const ORDER: Record<Status, number> = { missing: 0, empty: 1, ok: 2 };

/** Decides the alt status of one image. */
function statusOf(img: ImageItem): Status {
  if (img.alt === null) return "missing";
  if (img.alt.trim() === "") return "empty";
  return "ok";
}

function isInline(src: string): boolean {
  return src.trim().toLowerCase().startsWith("data:");
}

/** A short, readable name instead of a very long address. */
function shortName(src: string): { name: string; sub: string } {
  if (isInline(src)) {
    const m = src.match(/^data:image\/([a-zA-Z0-9.+-]+)/i);
    let type = m ? m[1].toLowerCase() : "";
    if (type.startsWith("svg")) type = "SVG";
    else if (type) type = type.toUpperCase();
    return {
      name: type ? `Inline ${type} image` : "Inline image",
      sub: "Embedded directly in the page code",
    };
  }
  try {
    const u = new URL(src);
    const last = u.pathname.split("/").filter(Boolean).pop() || u.hostname;
    let name = last;
    try {
      name = decodeURIComponent(last);
    } catch {
      /* keep raw name */
    }
    return { name, sub: u.hostname };
  } catch {
    return {
      name: src.length > 60 ? src.slice(0, 57) + "..." : src,
      sub: "",
    };
  }
}

/** Small preview. Falls back to an icon if the image cannot load. */
function Thumb({ src }: { src: string }) {
  const [failed, setFailed] = useState(false);
  const showImage = !failed && !isInline(src) && /^https?:\/\//i.test(src);

  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className="h-full w-full object-contain"
        />
      ) : (
        <ImageIcon
          className="h-5 w-5 text-slate-400 dark:text-slate-500"
          aria-hidden="true"
        />
      )}
    </div>
  );
}

export default function AltTagCheckerUI() {
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
          mode: "images",
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

  const rows = (result?.images ?? [])
    .map((img) => ({ img, status: statusOf(img) }))
    .sort((a, b) => ORDER[a.status] - ORDER[b.status]);

  const counts = {
    all: rows.length,
    missing: rows.filter((r) => r.status === "missing").length,
    empty: rows.filter((r) => r.status === "empty").length,
    ok: rows.filter((r) => r.status === "ok").length,
  };

  const visible =
    filter === "all" ? rows : rows.filter((r) => r.status === filter);

  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "missing", label: "No alt" },
    { key: "empty", label: "Empty alt" },
    { key: "ok", label: "Has alt" },
  ];

  let headline = "No images found";
  let headTone = "text-indigo-700 dark:text-slate-100";
  let headNote = "We could not find any images on this page.";

  if (counts.all > 0) {
    if (counts.missing > 0) {
      headline = `${counts.missing} ${
        counts.missing === 1 ? "image has" : "images have"
      } no alt text`;
      headTone = "text-red-700 dark:text-red-400";
      headNote =
        "Add a short description to these first. It helps visitors who use screen readers and helps search engines understand your images.";
    } else if (counts.empty > 0) {
      headline = `${counts.empty} ${
        counts.empty === 1 ? "image has" : "images have"
      } empty alt text`;
      headTone = "text-amber-700 dark:text-amber-400";
      headNote =
        "Empty alt is correct for decorative images. If an image shows something useful, give it a short description.";
    } else {
      headline = "All images have alt text";
      headTone = "text-emerald-700 dark:text-emerald-400";
      headNote = "Nothing to fix here. Good work.";
    }
  }

  return (
    <div className="space-y-6">
      {/* Input (no extra card, the page already has one) */}
      <form onSubmit={handleCheck} noValidate>
        <label htmlFor="alt-url" className={`mb-2 block ${labelClass}`}>
          Page URL
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="alt-url"
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
            {loading ? "Checking..." : "Check Images"}
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
        <TurnstileWidget
          action="page-scan-images"
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
            <p className={`mt-1 font-serif text-3xl font-bold ${headTone}`}>
              {headline}
            </p>
            <p className="mt-1 break-words text-sm text-slate-600 dark:text-slate-400">
              Found{" "}
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {counts.all}
              </span>{" "}
              {counts.all === 1 ? "image" : "images"} on {result.url}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              {headNote}
            </p>
          </div>

          {counts.all > 0 && (
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

              {/* Explain statuses once above the results. */}
              <div className="space-y-2 border-b border-slate-200 px-5 py-4 text-sm leading-relaxed text-slate-600 dark:border-slate-800 dark:text-slate-400">
                <p>
                  <strong className="text-slate-800 dark:text-slate-200">
                    No alt:
                  </strong>{" "}
                  The image has no alt attribute. Review its purpose and add
                  appropriate alternative text.
                </p>
                <p>
                  <strong className="text-slate-800 dark:text-slate-200">
                    Empty alt:
                  </strong>{" "}
                  An empty alt attribute is suitable for decorative images.
                  Meaningful images need text that describes their purpose.
                </p>
              </div>

              {/* List */}
              {visible.length === 0 ? (
                <p className="p-5 text-sm text-slate-500 dark:text-slate-400">
                  No images in this group.
                </p>
              ) : (
                <ul className="divide-y divide-slate-200 dark:divide-slate-800">
                  {visible.map(({ img, status }, i) => {
                    const { name, sub } = shortName(img.src);
                    const info = statusInfo[status];
                    const altText = img.alt ? img.alt.trim() : "";
                    const tooLong = status === "ok" && altText.length > 125;
                    return (
                      <li
                        key={`${img.src.slice(0, 80)}-${i}`}
                        className="flex gap-4 p-5"
                      >
                        <Thumb src={img.src} />

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p
                                className="break-all text-sm font-bold text-slate-900 dark:text-slate-100"
                                title={isInline(img.src) ? undefined : img.src}
                              >
                                {name}
                              </p>
                              {sub && (
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  {sub}
                                </p>
                              )}
                            </div>
                                                        <span
                              className={`inline-flex w-24 shrink-0 items-center gap-2 text-sm font-bold ${statusText[status]}`}
                            >
                              <span
                                className={`h-2 w-2 rounded-full ${statusDot[status]}`}
                                aria-hidden="true"
                              />
                              {info.label}
                            </span>
                          </div>

                          <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
                            <span className="font-bold text-slate-600 dark:text-slate-400">
                              Alt text:{" "}
                            </span>
                            {altText ? (
                              <span>&ldquo;{altText}&rdquo;</span>
                            ) : (
                              <span className="text-slate-500 dark:text-slate-400">
                                none
                              </span>
                            )}
                          </p>

                          
                          {tooLong && (
                            <p className="mt-1 text-sm leading-relaxed text-amber-700 dark:text-amber-400">
                              This alt text is quite long. Try to keep it under
                              125 characters.
                            </p>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}