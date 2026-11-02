import type { Metadata } from "next";
import Link from "next/link";
import { tools } from "@/lib/tools";
import { ToolCard } from "@/components/ToolCard";
import { FaqAccordion } from "@/components/FaqAccordion";
import { ArrowDown } from "lucide-react";

export const metadata: Metadata = {
  title: "SEO Toolkit - Free SEO Tools for Webmasters and Marketers",
  description:
    "Free SEO tools: Case Converter, Meta Tag Generator, Meta Tag Analyzer, Domain Age Checker and more. Fast, simple and no signup needed.",
};

/**
 * Ad slot: abhi sirf dotted dabba dikhta hai.
 * AdSense approve hone ke baad is dabbe ke andar ad ka code lagayenge.
 * min-h is liye hai ke ad aane par page neeche upar na hile.
 */
function AdSlot({ className = "" }: { className?: string }) {
  return (
    <div className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>
      <div className="flex min-h-[100px] items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-50 text-xs uppercase tracking-widest text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-600">
        Advertisement
      </div>
    </div>
  );
}

export default function HomePage() {
  const liveCount = tools.filter((t) => t.status === "ready").length;
  const categories = Array.from(new Set(tools.map((t) => t.category)));

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. HERO */}
      <section className="bg-indigo-700 py-14 sm:py-20 dark:bg-indigo-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-widest text-accent-400">
              {liveCount} free tools, live now
            </p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
              Free SEO tools that do one job well.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-indigo-100 sm:text-lg">
              Check domain age, analyze meta tags, scan a page for broken links,
              count words and more. No signup, no popups.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="#tools"
                className="inline-flex items-center gap-2 rounded-md bg-accent-500 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-accent-600"
              >
                <span>Explore Tools</span>
                <ArrowDown className="h-4 w-4" />
              </Link>
              <Link
                href="#about"
                className="inline-flex items-center rounded-md border border-indigo-300/50 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                About SEO Toolkit
              </Link>
            </div>

            <p className="mt-8 text-xs font-medium text-indigo-200">
              Free to use &nbsp;·&nbsp; No signup needed &nbsp;·&nbsp; Works on mobile
            </p>
          </div>
        </div>
      </section>

      {/* AD SLOT 1: hero ke neeche */}
      <AdSlot className="mt-8" />

      {/* 2. TOOLS, CATEGORY WISE */}
      <section id="tools" className="scroll-mt-20 py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                All SEO Tools
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Pick a tool and get your result in seconds.
              </p>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              <strong className="text-slate-900 dark:text-white">{tools.length}</strong> tools
            </p>
          </div>

          <div className="space-y-12">
            {categories.map((category) => {
              const items = tools.filter((t) => t.category === category);
              return (
                <div key={category}>
                  <div className="mb-2 flex items-center gap-3">
                    <span className="h-5 w-1 rounded-full bg-accent-500" aria-hidden="true" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-700 dark:text-slate-200">
                      {category}
                    </h3>
                    <span className="text-xs text-slate-400">{items.length}</span>
                  </div>
                  <div className="grid grid-cols-1 gap-x-10 md:grid-cols-2">
                    {items.map((tool) => (
                      <ToolCard key={tool.slug} tool={tool} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* AD SLOT 2: tools ke baad */}
      <AdSlot />

      {/* 3. ABOUT (content section, SEO / AEO ke liye) */}
      <section id="about" className="scroll-mt-20 py-14 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            What is SEO Toolkit?
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-700 dark:text-slate-300">
            SEO Toolkit is a free collection of online tools for webmasters,
            bloggers and digital marketers. Each tool does one job: check how
            old a domain is, read the meta tags of a page, find broken links,
            or clean up text. You open the tool, paste your input and get the
            result right away.
          </p>

          <h3 className="mt-10 text-lg font-bold text-slate-900 dark:text-white">
            What can I do with these tools?
          </h3>
          <p className="mt-2 text-base leading-relaxed text-slate-700 dark:text-slate-300">
            You can write and test meta tags, build UTM links for campaigns,
            generate hreflang tags for multi-language sites, check heading
            structure and image alt text, count internal and external links,
            and measure keyword density in your content. Content tools such as
            the Word Counter and Slug Generator help you prepare articles
            before you publish them.
          </p>

          <h3 className="mt-10 text-lg font-bold text-slate-900 dark:text-white">
            Are the tools really free?
          </h3>
          <p className="mt-2 text-base leading-relaxed text-slate-700 dark:text-slate-300">
            Yes. Every live tool is free to use, with no registration and no
            credit card. A few tools marked Coming soon need paid data sources,
            and we will announce them when they launch.
          </p>

          <h3 className="mt-10 text-lg font-bold text-slate-900 dark:text-white">
            Is my data safe?
          </h3>
          <p className="mt-2 text-base leading-relaxed text-slate-700 dark:text-slate-300">
            Text tools like the Case Converter and Meta Tag Generator run
            entirely in your browser. Tools that check a live URL or domain
            send only that address to our server, and we do not store it.
          </p>
        </div>
      </section>

      {/* 4. FAQ */}
      <section
        id="faq"
        className="scroll-mt-20 border-t border-slate-200 py-14 sm:py-20 dark:border-slate-800"
      >
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
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