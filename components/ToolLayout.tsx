import React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { getToolBySlug, getRelatedTools } from "@/lib/tools";
import { ToolCard } from "@/components/ToolCard";
import { ToolIcon } from "@/components/ToolIcon";
import { getToolContent } from "@/lib/tool-content";

const DEFAULT_STEPS = [
  {
    title: "Enter your input",
    text: "Type or paste your domain, URL or text into the field above.",
  },
  {
    title: "Run the check",
    text: "Click the main button and wait a moment for the result.",
  },
  {
    title: "Review the results",
    text: "Read the output and use it to improve your pages.",
  },
];

const HOW_TO_STEPS: Record<string, { title: string; text: string }[]> = {
  "case-converter": [
    {
      title: "Paste your text",
      text: "Type or paste any text into the box above.",
    },
    {
      title: "Choose a case",
      text: "Click UPPERCASE, lowercase, Title Case or Sentence case.",
    },
    {
      title: "Copy the result",
      text: "Press Copy and paste the converted text where you need it.",
    },
  ],
  "meta-tag-generator": [
    {
      title: "Fill in the fields",
      text: "Add your page title, description and optional social tags.",
    },
    {
      title: "Check the length",
      text: "Keep the title near 60 and the description near 160 characters.",
    },
    {
      title: "Copy the tags",
      text: "Copy the generated code and paste it inside your page's <head>.",
    },
  ],
  "meta-tag-analyzer": [
    {
      title: "Enter a page URL",
      text: "Paste the full public URL of the page you want to audit.",
    },
    {
      title: "Click Check Tags",
      text: "We fetch the page and read its title, description, headings and social tags.",
    },
    {
      title: "Fix the warnings",
      text: "Follow the suggestions on each card to improve your on-page SEO.",
    },
  ],
  "slug-generator": [
    {
      title: "Enter your title",
      text: "Type or paste the page title or any text you want to turn into a URL slug.",
    },
    {
      title: "Choose your options",
      text: 'Pick a hyphen or underscore as the separator, and remove small words like "the" or "and" if you want a shorter slug.',
    },
    {
      title: "Copy the slug",
      text: "Press Copy slug and paste it into your page's URL or permalink field.",
    },
  ],
  "keyword-density-checker": [
    {
      title: "Paste your content",
      text: "Add your article or page text into the box.",
    },
    {
      title: "Choose what to count",
      text: 'Pick single words or 2-3 word phrases, and ignore common words like "the" and "and" for a cleaner list.',
    },
    {
      title: "Review the density",
      text: "See which terms repeat most. Keep your writing natural and avoid repeating any one keyword too often.",
    },
  ],
  "utm-link-builder": [
    {
      title: "Enter your URL",
      text: "Paste the page address you want to track.",
    },
    {
      title: "Fill in the campaign",
      text: "Add the source, medium and campaign name.",
    },
    {
      title: "Copy the link",
      text: "Press Copy link and use it in your ads, emails or posts.",
    },
  ],
  "hreflang-tag-generator": [
    {
      title: "Pick the languages",
      text: "Choose the language or region for every version of your page.",
    },
    {
      title: "Add the page URLs",
      text: "Enter the full address, starting with https://, of each language version.",
    },
    {
      title: "Copy the tags",
      text: "Paste the generated tags inside the <head> of every language version, so each page lists all the others.",
    },
  ],
  "links-counter": [
    {
      title: "Enter a page URL",
      text: "Paste the full public address of the page you want to scan.",
    },
    {
      title: "Click Count Links",
      text: "We list every link found on that page.",
    },
    {
      title: "Filter the results",
      text: "Click Internal, External or Nofollow to see just that group.",
    },
  ],
  "alt-tag-checker": [
    {
      title: "Enter a page URL",
      text: "Paste the full public address of the page you want to scan.",
    },
    {
      title: "Click Check Images",
      text: "We list every image and its alt text.",
    },
    {
      title: "Fix missing alt text",
      text: "Filter by Missing or Empty and add descriptive alt text to those images.",
    },
  ],
  "broken-link-checker": [
    {
      title: "Enter a page URL",
      text: "Paste the full public address of the page you want to scan.",
    },
    {
      title: "Click Check Links",
      text: "We test up to 25 unique links found on that page.",
    },
    {
      title: "Fix the broken ones",
      text: "Errors and failed links are listed first so you can replace or remove them.",
    },
  ],
  "word-counter": [
    {
      title: "Paste your text",
      text: "Type or paste your content into the text box.",
    },
    {
      title: "See live counts",
      text: "Words, characters, sentences and paragraphs update as you type.",
    },
    {
      title: "Check the reading time",
      text: "Use the reading and speaking time to plan your content length.",
    },
  ],
  "domain-age-checker": [
    {
      title: "Enter a domain",
      text: "Type a domain like example.com. URLs and subdomains are cleaned up automatically.",
    },
    {
      title: "Click Check Domain Age",
      text: "We look up the public registration record for that domain.",
    },
    {
      title: "Read the details",
      text: "See the age, registration and expiry dates, and the registrar.",
    },
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
  const content = getToolContent(slug);

  return (
    <div className="min-h-screen bg-[#EFF7F6] py-8 text-[#181D16] dark:bg-slate-950 dark:text-slate-100 sm:py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex items-center gap-2 text-xs font-medium text-[#181D16]/75 dark:text-slate-400"
        >
          <Link
            href="/"
            className="flex shrink-0 items-center gap-1 hover:underline"
          >
            <Home className="h-3.5 w-3.5" aria-hidden="true" />
            Home
          </Link>
          <ChevronRight
            className="h-3.5 w-3.5 shrink-0"
            aria-hidden="true"
          />
          <Link href="/#tools" className="shrink-0 hover:underline">
            Tools
          </Link>
          <ChevronRight
            className="h-3.5 w-3.5 shrink-0"
            aria-hidden="true"
          />
          <span aria-current="page" className="truncate font-semibold">
            {currentTool?.name ?? title}
          </span>
        </nav>

        <header className="mb-8 rounded-xl bg-[#DDEDEC] p-6 dark:bg-slate-900 sm:p-8">
          {currentTool && (
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-md bg-[#ECE9FC] px-2.5 py-1 text-xs font-semibold text-[#181D16]">
              <ToolIcon
                name={currentTool.icon}
                className="h-3.5 w-3.5"
              />
              {currentTool.category}
            </span>
          )}

          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">
            {title}
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-[#181D16]/80 dark:text-slate-300 sm:text-lg">
            {description}
          </p>
        </header>

        <section
          aria-label={`${title} interface`}
          className="mb-12 rounded-xl border border-[#C6DAD7] bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-8"
        >
          {children}
        </section>

        {content && (
          <section
            aria-labelledby="tool-about"
            className="mb-12 border-t border-[#C6DAD7] pt-8 dark:border-slate-800"
          >
            <h2 id="tool-about" className="text-xl font-bold sm:text-2xl">
              {content.aboutTitle}
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#465B55] dark:text-slate-300">
              {content.about}
            </p>
          </section>
        )}

        <section
          aria-labelledby="tool-steps"
          className="mb-12 border-t border-[#C6DAD7] pt-8 dark:border-slate-800"
        >
          <h2 id="tool-steps" className="mb-5 text-xl font-bold">
            How to Use This Tool
          </h2>
          <ol className="grid gap-6 md:grid-cols-3">
            {steps.map((step, index) => (
              <li key={step.title} className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#ECE9FC] text-sm font-bold text-[#181D16]"
                >
                  {index + 1}
                </span>
                <div>
                  <h3 className="text-sm font-bold">{step.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-[#181D16]/75 dark:text-slate-400">
                    {step.text}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {content && (
          <>
            <section
              aria-labelledby="tool-example"
              className="mb-12 border-t border-[#C6DAD7] pt-8 dark:border-slate-800"
            >
              <h2
                id="tool-example"
                className="text-xl font-bold sm:text-2xl"
              >
                {content.exampleTitle}
              </h2>
              <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#465B55] dark:text-slate-300">
                {content.example}
              </p>
            </section>

            {content.faqs.length > 0 && (
              <section
                aria-labelledby="tool-faqs"
                className="mb-12 border-t border-[#C6DAD7] pt-8 dark:border-slate-800"
              >
                <h2
                  id="tool-faqs"
                  className="mb-6 text-xl font-bold sm:text-2xl"
                >
                  Frequently asked questions
                </h2>
                <div className="divide-y divide-[#C6DAD7] dark:divide-slate-800">
                  {content.faqs.map((faq, index) => (
                    <details
                      key={`${index}-${faq.question}`}
                      className="py-4"
                    >
                      <summary className="cursor-pointer text-base font-semibold leading-relaxed">
                        {faq.question}
                      </summary>
                      <p className="mt-3 max-w-3xl text-base leading-relaxed text-[#465B55] dark:text-slate-300">
                        {faq.answer}
                      </p>
                    </details>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {relatedTools.length > 0 && (
          <section
            aria-labelledby="related-tools"
            className="mb-12 border-t border-[#C6DAD7] pt-8 dark:border-slate-800"
          >
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 id="related-tools" className="text-xl font-bold">
                  Related SEO Tools
                </h2>
                <p className="mt-1 text-sm text-[#181D16]/75 dark:text-slate-400">
                  Explore other utilities in the SEO Toolkit directory
                </p>
              </div>
              <Link
                href="/#tools"
                className="text-sm font-semibold underline-offset-4 hover:underline"
              >
                View all tools →
              </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
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