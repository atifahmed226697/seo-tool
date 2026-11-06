"use client";

import { useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, CalendarClock, Link2, Search, Type } from "lucide-react";
import { ToolIcon } from "@/components/ToolIcon";
import type { Tool } from "@/lib/tools";

const shortcuts = [
  { slug: "domain-age-checker", label: "Check domain age", Icon: CalendarClock },
  { slug: "broken-link-checker", label: "Find broken links", Icon: Link2 },
  { slug: "word-counter", label: "Count words", Icon: Type },
];

export default function HomeTools({ tools, children }: { tools: Tool[]; children: ReactNode }) {
  const [query, setQuery] = useState("");
  const resultsHeading = useRef<HTMLHeadingElement>(null);
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const matches = tools.filter((tool) => {
    const searchable = `${tool.name} ${tool.shortDescription} ${tool.category}`.toLowerCase();
    return words.every((word) => searchable.includes(word));
  });
  const toolCount = tools.length;
  const matchCount = matches.length;

  function showResults(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    resultsHeading.current?.focus({ preventScroll: true });
    resultsHeading.current?.scrollIntoView({ block: "start" });
  }

  return (
    <>
      <section className="bg-brand-blue px-5 py-12 text-center sm:px-8 sm:py-16">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Free SEO tools</h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 sm:text-lg">
          Audit public pages, build sitemap and robots.txt files, and prepare text, images and PDFs for publishing.
        </p>
        <form role="search" onSubmit={showResults} className="mx-auto mt-6 flex w-full max-w-lg gap-2">
          <div className="relative min-w-0 flex-1">
            <label htmlFor="home-tool-search" className="sr-only">Search SEO tools</label>
            <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4" aria-hidden="true" />
            <input
              id="home-tool-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Search ${toolCount} tools, e.g. “broken links”`}
              className="w-full rounded-full border border-brand-ink bg-white py-2.5 pl-9 pr-3 text-sm text-brand-ink"
            />
          </div>
          <button type="submit" className="rounded-full bg-brand-ink px-5 py-2 text-sm font-bold text-white hover:bg-brand-ink/90">
            Search
          </button>
        </form>
        <p aria-live="polite" className="mt-2 text-sm text-slate-600">
          {words.length > 0 && (matchCount === 0 ? "No matching tools" : `${matchCount} matching ${matchCount === 1 ? "tool" : "tools"}`)}
        </p>
        <nav aria-label="Popular shortcuts" className="mt-4 flex flex-wrap justify-center gap-2">
          {shortcuts.map(({ slug, label, Icon }) => (
            <Link
              key={slug}
              href={`/tools/${slug}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold hover:underline"
            >
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              {label}
            </Link>
          ))}
        </nav>
      </section>

      {children}

      <section id="tools" className="mx-auto max-w-7xl scroll-mt-20 bg-white px-5 py-12 sm:px-8 sm:py-16">
        <div className="text-center">
          <h2 ref={resultsHeading} tabIndex={-1} className="scroll-mt-20 text-3xl font-bold tracking-tight">Browse all tools</h2>
          <p className="mt-2 text-sm text-slate-600">
            {words.length ? `${matchCount} of ${toolCount} tools match your search.` : `${toolCount} free tools for SEO, content, images and PDFs.`}
          </p>
        </div>

        {matchCount === 0 && (
          <p className="py-8 text-center">
            No matching tools.{" "}
            <button type="button" className="font-semibold underline" onClick={() => setQuery("")}>Clear search</button>
          </p>
        )}

        {matchCount > 0 && (
          <ul className="mt-7 grid gap-3 sm:grid-cols-2">
            {matches.map((tool) => (
              <li key={tool.slug}>
                <Link
                  href={`/tools/${tool.slug}`}
                  className="group flex h-full items-start gap-3 rounded-xl border border-brand-ink/10 bg-brand-blue/65 p-4 transition-colors hover:bg-brand-blue sm:gap-4 sm:p-5"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-forest text-white">
                    <ToolIcon name={tool.icon} className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold group-hover:underline group-hover:underline-offset-4">{tool.name}</h3>
                    <p className="mt-1 text-sm leading-snug text-slate-600">{tool.shortDescription}</p>
                  </div>
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-brand-forest" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
