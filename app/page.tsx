import type { Metadata } from "next";
import Link from "next/link";
import { tools } from "@/lib/tools";
import { ToolCard } from "@/components/ToolCard";
import { FaqAccordion } from "@/components/FaqAccordion";
import { ArrowDown, Zap, Lock, Smartphone, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "SEO Toolkit - Free SEO Tools for Webmasters and Marketers",
  description:
    "Free SEO tools: Case Converter, Meta Tag Generator, Meta Tag Analyzer and Domain Age Checker. Fast, simple and no signup needed.",
};

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-gradient-to-b from-slate-50 via-white to-slate-50/50 py-20 sm:py-28 dark:border-slate-800 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div
          aria-hidden="true"
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-indigo-500/15 to-sky-400/15 blur-3xl pointer-events-none rounded-full"
        />

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl dark:text-white">
            <span className="block">Free SEO Tools by</span>
            <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-sky-500 bg-clip-text text-transparent">
              SEO Toolkit
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
            Check domain age, analyze meta tags, generate tags and convert text case. Fast, simple and free.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="#tools"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 hover:bg-indigo-500 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Explore Tools</span>
              <ArrowDown className="h-4 w-4 animate-bounce" />
            </Link>
            <Link
              href="#why-us"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Why Use These Tools
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Free to use
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              No signup needed
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Works on mobile
            </span>
          </div>
        </div>
      </section>

      {/* 2. TOOLS GRID SECTION */}
      <section id="tools" className="py-16 sm:py-24 bg-white dark:bg-slate-900/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                All Tools
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
                SEO and Content Tools
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Pick a tool and get your result in seconds.
              </p>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              <strong>{tools.length}</strong> tools
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} />
            ))}
          </div>
        </div>
      </section>

      {/* 3. WHY USE THESE TOOLS SECTION */}
      <section
        id="why-us"
        className="py-16 sm:py-24 bg-slate-50/70 border-y border-slate-200/80 dark:border-slate-800 dark:bg-slate-950/40"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Why Use These Tools
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400">
              Simple tools that do one job well, without clutter.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 mb-5">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Fast and simple
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                Fast pages with no popups, no forced signup and no clutter. Open a tool and get your result.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 mb-5">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Respects your privacy
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                Text tools like the Case Converter and Meta Tag Generator run entirely in your browser. Tools that check a live URL or domain send only that address to our server, and we don&apos;t store it.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-400 mb-5">
                <Smartphone className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Works on any device
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                Works on phones, tablets and desktops, with dark mode support.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FAQ SECTION */}
      <section id="faq" className="py-16 sm:py-24 bg-white dark:bg-slate-900/60">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Frequently Asked Questions
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Quick answers about how the tools work.
            </p>
          </div>

          <FaqAccordion />
        </div>
      </section>
    </div>
  );
}