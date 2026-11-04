"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CalendarClock,
  FileCode2,
  Globe,
  Search,
  SearchCode,
  ShieldAlert,
  Type,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Tool } from "@/lib/tools";

/**
 * Homepage hero + tool directory.
 * The hero search box and the directory share one state, so typing filters the list live.
 * Colours are fixed hex values on purpose (no Tailwind config changes needed):
 *   #181D16 text and dark buttons, #DDEDEC hero, #DBEEEC row hover, #ECE9FC small accent.
 */

const ICONS: Record<Tool["icon"], LucideIcon> = {
  Type,
  FileCode2,
  SearchCode,
  CalendarClock,
  BarChart3,
  ShieldAlert,
  Globe,
};

/** Short one-line descriptions so every row fits on a single line. */
const SHORT_DESCRIPTIONS: Record<string, string> = {
  "case-converter": "Change text to UPPER, lower or Title Case.",
  "meta-tag-generator": "Create meta, Open Graph and Twitter tags.",
  "meta-tag-analyzer": "Check the meta tags of any live page.",
  "domain-age-checker": "Find a domain's age, registrar and expiry.",
  "word-counter": "Count words, characters and reading time.",
  "slug-generator": "Turn any title into a clean URL slug.",
  "keyword-density-checker": "See your most used words and phrases.",
  "lorem-ipsum-generator": "Make placeholder text for your designs.",
  "utm-link-builder": "Add campaign tracking to any link.",
  "hreflang-tag-generator": "Create tags for multi-language pages.",
  "broken-link-checker": "Find links on a page that do not work.",
  "alt-tag-checker": "Find images with missing alt text.",
  "links-counter": "Count internal and external links.",
  "heading-structure-checker": "View the H1 to H6 outline of a page.",
  "da-pa-checker": "Check Domain and Page Authority scores.",
  "spam-score-checker": "Check a domain for spam warning signs.",
  "google-index-checker": "Check if a page is indexed in Google.",
};

export default function HomeTools({ tools, liveCount }: { tools: Tool[]; liveCount: number }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tools;
    return tools.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.shortDescription.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
    );
  }, [tools, query]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    document.getElementById("tools")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
      {/* HERO */}
      <section className="bg-[#DDEDEC] py-10 md:py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <p className="inline-block rounded-md bg-[#ECE9FC] px-3 py-1 text-sm font-semibold text-[#181D16]">
            {liveCount} free tools, live now
          </p>
          <h1 className="mt-4 text-[36px] font-bold leading-[1.1] tracking-tight text-[#181D16] md:text-[56px]">
            Free SEO Tools
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-[#181D16]">
            Check domain age, analyze meta tags, find broken links and more. No signup, no popups.
          </p>

          <form
            role="search"
            onSubmit={handleSubmit}
            className="mx-auto mt-8 flex max-w-xl flex-col gap-3 sm:flex-row"
          >
            <div className="relative flex-1">
              <label htmlFor="home-tool-search" className="sr-only">
                Search tools
              </label>
              <Search
                className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#181D16]"
                aria-hidden="true"
              />
              <input
                id="home-tool-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tools"
                autoComplete="off"
                className="w-full rounded-md border-2 border-[#181D16] bg-white py-3.5 pl-12 pr-4 text-base text-[#181D16] placeholder-[#181D16]/60 outline-none focus:ring-2 focus:ring-[#181D16]/30"
              />
            </div>
            <button
              type="submit"
              className="rounded-md bg-[#181D16] px-7 py-3.5 text-base font-bold text-white transition-opacity hover:opacity-90"
            >
              Search
            </button>
          </form>

          <p className="mt-5 text-sm text-[#181D16]/80">
            Free to use &nbsp;·&nbsp; No signup needed &nbsp;·&nbsp; Works on mobile
          </p>
        </div>
      </section>

      {/* TOOL DIRECTORY */}
      <section id="tools" className="scroll-mt-20 py-10 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-[28px] font-bold leading-tight text-[#181D16]">All SEO Tools</h2>
              <p className="mt-1 text-base text-[#181D16]/80">Pick a tool and get your result in seconds.</p>
            </div>
            <p className="rounded-md bg-[#ECE9FC] px-3 py-1 text-sm font-semibold text-[#181D16]">
              {query.trim() ? `${filtered.length} of ${tools.length} tools` : `${tools.length} tools`}
            </p>
          </div>

          {filtered.length > 0 ? (
            <ul className="grid grid-cols-1 gap-x-12 md:grid-cols-2">
              {filtered.map((tool) => {
                const Icon = ICONS[tool.icon];
                return (
                  <li
                    key={tool.slug}
                    className="border-b border-[#181D16]/15 first:border-t md:[&:nth-child(2)]:border-t"
                  >
                    <Link
                      href={`/tools/${tool.slug}`}
                      className="group flex items-center gap-4 px-3 py-4 transition-colors hover:bg-[#DBEEEC] focus-visible:bg-[#DBEEEC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#181D16]"
                    >
                      <Icon className="h-6 w-6 shrink-0 text-[#181D16]" strokeWidth={1.75} aria-hidden="true" />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[18px] font-semibold leading-snug text-[#181D16]">
                          {tool.name}
                        </span>
                        <span className="block truncate text-base text-[#181D16]/75">
                          {SHORT_DESCRIPTIONS[tool.slug] ?? tool.shortDescription}
                        </span>
                      </span>
                      <ArrowRight
                        className="h-5 w-5 shrink-0 text-[#181D16] transition-transform group-hover:translate-x-1"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="border-y border-[#181D16]/15 py-10 text-base text-[#181D16]">
              No tools match &quot;{query.trim()}&quot;.{" "}
              <button
                type="button"
                onClick={() => setQuery("")}
                className="font-bold underline underline-offset-2"
              >
                Clear search
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}