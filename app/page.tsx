import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarClock, Link2, Minus, Plus, Search } from "lucide-react";
import HomeTools from "@/components/HomeTools";
import { tools } from "@/lib/tools";

export const metadata: Metadata = {
  title: "Free SEO Tools for Webmasters and Marketers",
  description: "Analyze metadata, check links, research domains and prepare content with SEO Toolkit.",
};

const featured = [
  { slug: "meta-tag-analyzer", description: "See the title, description and social tags a public page provides.", action: "Analyze metadata", Icon: Search },
  { slug: "broken-link-checker", description: "Review links that return errors or need a manual check.", action: "Check page links", Icon: Link2 },
  { slug: "domain-age-checker", description: "Find when a domain was registered, its registrar and when it expires.", action: "Check domain age", Icon: CalendarClock },
];

const steps = [
  ["Choose a tool", "Search by name or browse all tools below."],
  ["Enter your input", "Add a public page URL, a domain or some text, depending on the tool."],
  ["Review the result", "Use what you find to decide what to update or investigate next."],
];

const questions = [
  ["Do I need an account to use the tools?", "No. The tools are free to use, with no registration or credit card."],
  ["Where should I start with a page audit?", "Start with Meta Tag Analyzer to review the title and description. Then check the heading structure, links and image alt text to decide what to update."],
  ["Why might a public page check fail?", "Some websites require a login, block automated requests or take too long to respond. Check that the URL opens publicly and try again."],
  ["Can I check a draft before publishing it?", "Yes. Paste the draft into Word Counter or use the text mode in Keyword Density Checker. Tools that scan a page need a public URL."],
];

export default function HomePage() {
  const available = tools.filter((tool) => tool.status === "ready");
  return (
    <div className="bg-white text-brand-ink">
      <HomeTools tools={available}>
        <section aria-labelledby="quick-checks" className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
          <h2 id="quick-checks" className="text-center text-3xl font-bold">Start with a quick check</h2>
          <p className="mt-2 text-center text-sm text-slate-600">Open a tool, enter your input and get the result.</p>
          <ul className="mt-7 grid gap-4 sm:grid-cols-3">
            {featured.map(({ slug, description, action, Icon }) => {
              const tool = available.find((item) => item.slug === slug);
              if (!tool) return null;
              return (
                <li key={slug}>
                  <Link href={`/tools/${slug}`} className="group flex h-full flex-col rounded-xl bg-brand-blue p-5 sm:p-6">
                    <span className="mb-3 w-fit rounded-lg bg-white p-2">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <h3 className="font-bold">{tool.name}</h3>
                    <p className="mb-5 mt-1 flex-1 text-sm leading-6 text-slate-600">{description}</p>
                    <span className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-ink px-3 py-2 text-center text-xs font-bold text-white group-hover:bg-brand-ink/90">
                      {action} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <section aria-labelledby="home-steps" className="mx-auto max-w-7xl bg-white px-5 pb-12 sm:px-8 sm:pb-16">
          <h2 id="home-steps" className="text-center text-3xl font-bold">How to use the tools</h2>
          <ol className="mt-7 grid gap-4 sm:grid-cols-3">
            {steps.map(([title, text], index) => (
              <li key={title} className="rounded-xl bg-brand-blue p-5 sm:p-6">
                <span aria-hidden="true" className="block text-4xl font-extrabold leading-none">{index + 1}</span>
                <h3 className="mt-3 font-bold">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="about" className="scroll-mt-20 border-y border-brand-ink/10 bg-brand-blue">
          <div className="mx-auto grid max-w-7xl items-center gap-8 px-5 py-12 sm:px-8 lg:grid-cols-[1.25fr_1fr] lg:gap-16">
            <div className="max-w-xl">
              <h2 className="text-3xl font-bold tracking-tight">Review a page before you publish</h2>
              <p className="mt-4 leading-7 text-slate-700">
                Use Meta Tag Analyzer on a public URL to see the title and description the page actually serves. Then review the heading outline and count the links on the page. If the page is still a draft, use Word Counter or prepare the title and description in Meta Tag Generator.
              </p>
            </div>
            <ul aria-label="Page review tools" className="divide-y divide-brand-ink/15 border-y border-brand-ink/15">
              {[
                ["Title and description", "meta-tag-analyzer"],
                ["Heading structure", "heading-structure-checker"],
                ["Internal and external links", "links-counter"],
                ["Image alt text", "alt-tag-checker"],
              ].map(([label, slug]) => (
                <li key={slug}>
                  <Link href={`/tools/${slug}`} className="group flex items-center justify-between gap-3 py-3 font-semibold">
                    <span className="group-hover:underline">{label}</span>
                    <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </HomeTools>

      <section className="border-y border-brand-ink/10 bg-brand-blue">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5 px-5 py-8 sm:px-8">
          <div>
            <h2 className="text-xl font-bold">Writing a meta description?</h2>
            <p className="mt-1 text-sm text-slate-600">Use the guide to turn a page’s main point into a clear summary.</p>
          </div>
          <Link href="/blog" className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-ink">
            Read the guide <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-3xl scroll-mt-20 px-5 py-12 sm:px-8 sm:py-16">
        <h2 className="text-center text-3xl font-bold tracking-tight">Frequently asked questions</h2>
        <div className="mt-7 divide-y divide-brand-ink/15 border-y border-brand-ink/15">
          {questions.map(([question, answer], index) => (
            <details key={question} open={index === 0 ? true : undefined} className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold [&::-webkit-details-marker]:hidden">
                {question}
                <Plus className="h-4 w-4 shrink-0 group-open:hidden" aria-hidden="true" />
                <Minus className="hidden h-4 w-4 shrink-0 group-open:block" aria-hidden="true" />
              </summary>
              <p className="mt-2 text-sm leading-6 text-slate-600">{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="bg-brand-ink px-5 py-10 text-center text-white sm:py-12">
        <h2 className="text-2xl font-bold">Ready to check a page?</h2>
        <Link href="#tools" className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-brand-ink hover:bg-brand-blue">
          Browse tools <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </section>
    </div>
  );
}
