import React from "react";
import Link from "next/link";
import { getToolBySlug, getRelatedTools } from "@/lib/tools";
import { ToolCard } from "@/components/ToolCard";
import { ToolIcon } from "@/components/ToolIcon";
import { ComingSoonBadge } from "@/components/ComingSoonBadge";
import { ChevronRight, Home, Info, Clock } from "lucide-react";

/** Per-tool "How to use" steps. Tools not listed fall back to DEFAULT_STEPS. */
const DEFAULT_STEPS = [
  { title: "Enter your input", text: "Type or paste your domain, URL or text into the field above." },
  { title: "Run the check", text: "Click the main button and wait a moment for the result." },
  { title: "Review the results", text: "Read the output and use it to improve your pages." },
];

const HOW_TO_STEPS: Record<string, { title: string; text: string }[]> = {
  "case-converter": [
    { title: "Paste your text", text: "Type or paste any text into the box above." },
    { title: "Choose a case", text: "Click UPPERCASE, lowercase, Title Case or Sentence case." },
    { title: "Copy the result", text: "Press Copy and paste the converted text where you need it." },
  ],
  "meta-tag-generator": [
    { title: "Fill in the fields", text: "Add your page title, description and optional social tags." },
    { title: "Check the length", text: "Keep the title near 60 and the description near 160 characters." },
    { title: "Copy the tags", text: "Copy the generated code and paste it inside your page's <head>." },
  ],
  "meta-tag-analyzer": [
    { title: "Enter a page URL", text: "Paste the full public URL of the page you want to audit." },
    { title: "Click Check Tags", text: "We fetch the page and read its title, description, headings and social tags." },
    { title: "Fix the warnings", text: "Follow the suggestions on each card to improve your on-page SEO." },
  ],
  "word-counter": [
    { title: "Paste your text", text: "Type or paste your content into the text box." },
    { title: "See live counts", text: "Words, characters, sentences and paragraphs update as you type." },
    { title: "Check the reading time", text: "Use the reading and speaking time to plan your content length." },
  ],
  "domain-age-checker": [
    { title: "Enter a domain", text: "Type a domain like example.com. URLs and subdomains are cleaned up automatically." },
    { title: "Click Check Domain Age", text: "We look up the public registration record for that domain." },
    { title: "Read the details", text: "See the age, registration and expiry dates, and the registrar." },
  ],
  };
  
interface ToolLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
  slug: string;
}

export function ToolLayout({
  title,
  description,
  children,
  slug,
}: ToolLayoutProps) {
  const currentTool = getToolBySlug(slug);
  const relatedTools = getRelatedTools(slug, 3);
  const steps = HOW_TO_STEPS[slug] ?? DEFAULT_STEPS;

  return (
    <div className="min-h-screen py-8 sm:py-12 bg-slate-50/50 dark:bg-slate-950/40">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex items-center space-x-2 text-xs font-medium text-slate-500 dark:text-slate-400"
        >
          <Link
            href="/"
            className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <Home className="h-3.5 w-3.5" />
            <span>Home</span>
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <Link
            href="/#tools"
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            Tools
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-slate-800 dark:text-slate-200 truncate font-semibold">
            {currentTool ? currentTool.name : title}
          </span>
        </nav>

        {/* Header Block: Category, H1 Title, Description */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            {currentTool && (
              <>
                <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300">
                  <ToolIcon name={currentTool.icon} className="h-3.5 w-3.5" />
                  {currentTool.category}
                </span>
                <ComingSoonBadge status={currentTool.status} size="sm" />
              </>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {title}
          </h1>
          <p className="mt-3 text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
            {description}
          </p>
        </div>

        {/* Step Notice Banner - Shown ONLY on preview/unready tools */}
        {currentTool?.status !== "ready" && (
          <div className="mb-8 rounded-xl border border-amber-200/80 bg-amber-50/90 p-4 sm:p-5 dark:border-amber-900/40 dark:bg-amber-950/30">
            <div className="flex items-start gap-3">
              <div className="rounded-md bg-amber-100 p-1.5 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300 shrink-0 mt-0.5">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                  Notice: Tool Preview
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-amber-800/90 dark:text-amber-300/80 leading-relaxed">
                  This tool is scheduled for integration in upcoming steps. All inputs below are preview only.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tool Interaction Area (Children) */}
        <section
          aria-labelledby="tool-work-area"
          className="mb-14 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="sr-only" id="tool-work-area">
            {title} Interface
          </div>
          {children}
        </section>

        {/* How To Use Section (steps depend on the tool) */}
        <section className="mb-14 rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex items-center gap-2 mb-6">
            <Info className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              How to Use This Tool
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((step, i) => (
              <div
                key={step.title}
                className="relative flex flex-col rounded-xl border border-slate-100 bg-slate-50/80 p-5 dark:border-slate-800/80 dark:bg-slate-900/40"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                    {i + 1}
                  </span>
                  <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                    {step.title}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Related Tools Section */}
        {relatedTools.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Related SEO Tools
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Explore other utilities in the SEO Toolkit directory
                </p>
              </div>
              <Link
                href="/#tools"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
              >
                View all tools →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedTools.map((tool) => (
                <ToolCard key={tool.slug} tool={tool} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}