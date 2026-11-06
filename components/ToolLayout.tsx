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
  "robots-txt-generator": [
    { title: "Provide input", text: "Enter crawler groups and Allow or Disallow paths. Add your sitemap URL if you have one." },
    { title: "Run the tool", text: "Use the main button to process your input." },
    { title: "Use the result", text: "Copy or download robots.txt and place it at the root of your site." },
  ],
  "xml-sitemap-generator": [
    { title: "Provide input", text: "Paste one complete URL per line. Use the same protocol and hostname for all pages." },
    { title: "Run the tool", text: "Use the main button to process your input." },
    { title: "Use the result", text: "Download sitemap.xml and publish it on your site." },
  ],
  "json-viewer": [
    { title: "Provide input", text: "Paste a JSON document into the input." },
    { title: "Run the tool", text: "Use the main button to process your input." },
    { title: "Use the result", text: "Review the formatted JSON or copy and download it." },
  ],
  "favicon-generator": [
    { title: "Provide input", text: "Choose a JPG, PNG or WebP logo or image." },
    { title: "Run the tool", text: "Use the main button to process your input." },
    { title: "Use the result", text: "Download the favicon with 16, 32 and 48 pixel versions." },
  ],
  "image-compressor": [
    { title: "Provide input", text: "Choose an image, a target size and an output format." },
    { title: "Run the tool", text: "Use the main button to process your input." },
    { title: "Use the result", text: "Compare the original and compressed sizes and download the result." },
  ],
  "redirect-checker": [
    { title: "Provide input", text: "Enter the public URL you want to inspect." },
    { title: "Run the tool", text: "Complete verification and submit the check." },
    { title: "Use the result", text: "Review each HTTP status and the destination shown at the end of the chain." },
  ],
  "is-it-down": [
    { title: "Provide input", text: "Enter the public URL you want to check." },
    { title: "Run the tool", text: "Complete verification and submit the check." },
    { title: "Use the result", text: "Read the observed HTTP status or connection error." },
  ],
  "domain-hosting-checker": [
    { title: "Provide input", text: "Enter the public domain you want to look up." },
    { title: "Run the tool", text: "Complete verification and submit the check." },
    { title: "Use the result", text: "Review its IP addresses and the registered network. A proxy can hide the origin host." },
  ],
  "image-converter": [
    { title: "Provide input", text: "Choose an image and select the output format." },
    { title: "Run the tool", text: "Use the main button to process your input." },
    { title: "Use the result", text: "Preview and download the converted image." },
  ],
  "html-viewer": [
    { title: "Provide input", text: "Paste the HTML you want to preview." },
    { title: "Run the tool", text: "Use the main button to process your input." },
    { title: "Use the result", text: "Review the rendered markup. The preview disables scripts and external resources." },
  ],
  "merge-pdf": [
    { title: "Provide input", text: "Choose two to ten PDFs and arrange them in the order you want." },
    { title: "Run the tool", text: "Use the main button to process your input." },
    { title: "Use the result", text: "Download the merged PDF." },
  ],
  "split-pdf": [
    { title: "Provide input", text: "Choose a PDF and enter page numbers or ranges, such as 1, 3-5." },
    { title: "Run the tool", text: "Use the main button to process your input." },
    { title: "Use the result", text: "Download a new PDF containing the selected pages." },
  ],
  "rotate-pdf": [
    { title: "Provide input", text: "Choose a PDF, select the pages and set the clockwise rotation." },
    { title: "Run the tool", text: "Use the main button to process your input." },
    { title: "Use the result", text: "Download the full PDF with the selected pages rotated." },
  ],
  "pdf-to-jpg": [
    { title: "Provide input", text: "Choose a PDF and enter up to ten page numbers or a range." },
    { title: "Run the tool", text: "Use the main button to process your input." },
    { title: "Use the result", text: "Download each selected page as a JPG." },
  ],
  "image-to-text": [
    { title: "Provide input", text: "Choose a clear JPG, PNG or WebP with English text." },
    { title: "Run the tool", text: "Use the main button to process your input." },
    { title: "Use the result", text: "Review the extracted text, then copy or download it." },
  ],
  "page-speed-test": [
    { title: "Provide input", text: "Enter a public URL and select mobile or desktop." },
    { title: "Run the tool", text: "Complete verification and submit the check." },
    { title: "Use the result", text: "Review the Lighthouse lab score, timings and available suggestions." },
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
    <div className="min-h-screen bg-brand-blue/30 py-6 text-brand-ink dark:bg-slate-950 dark:text-slate-100 sm:py-9">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <nav
          aria-label="Breadcrumb"
          className="mb-5 flex w-fit max-w-full items-center gap-2 rounded-lg bg-brand-blue px-3 py-2 text-xs font-semibold text-brand-forest dark:bg-slate-800 dark:text-slate-100"
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

        <header className="mb-6 rounded-xl bg-brand-forest p-6 text-white sm:p-8">
          {currentTool && (
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-md bg-brand-blue px-2.5 py-1 text-xs font-bold text-brand-forest">
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
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-white/90 sm:text-lg">
            {description}
          </p>
        </header>

        <section
          aria-label={`${title} interface`}
          className="mb-12 min-w-0 rounded-xl border border-brand-forest/20 bg-brand-blue/65 p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-8"
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
              <li key={step.title} className="flex items-start gap-3 rounded-xl bg-brand-blue p-4 text-brand-ink">
                <span
                  aria-hidden="true"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-forest text-sm font-bold text-white"
                >
                  {index + 1}
                </span>
                <div>
                  <h3 className="text-sm font-bold">{step.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">
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