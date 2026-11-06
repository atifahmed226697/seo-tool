import { sitePageMetadata } from "@/lib/site-page-metadata";
import Link from "next/link";
import { ArrowRight, CalendarClock, Link2, Minus, Plus, Search } from "lucide-react";
import HomeTools from "@/components/HomeTools";
import { tools } from "@/lib/tools";

export const metadata = sitePageMetadata(
  "/",
  "Free SEO Tools for Website Audits and Publishing",
  "Check meta tags, broken links and redirects, generate robots.txt and XML sitemaps, and prepare images and content with free online tools.",
);

const featured = [
  { slug: "meta-tag-analyzer", description: "See the title, description and social tags a public page provides.", action: "Analyze metadata", Icon: Search },
  { slug: "broken-link-checker", description: "Review links that return errors or need a manual check.", action: "Check page links", Icon: Link2 },
  { slug: "domain-age-checker", description: "Find when a domain was registered, its registrar and when it expires.", action: "Check domain age", Icon: CalendarClock },
];

const steps = [
  ["Find the right tool", "Search by name or task, such as redirects, sitemaps or image compression."],
  ["Enter the input", "Paste a public URL or text, or choose a file for an image or PDF tool."],
  ["Review and use the result", "Confirm flagged issues on the page itself. Copy or download the output when you use a generator or converter."],
];

const questions = [
  ["Are the SEO tools free?", "The tools listed in the directory are free to use without an account. Some public URL checks require a verification challenge."],
  ["Which tools should I use before publishing?", "Use Meta Tag Generator for the page title and description, Word Counter for the draft, and Image Compressor for images. Once the page is public, use Meta Tag Analyzer and Broken Link Checker to review what was published."],
  ["Do uploaded images or PDFs leave my device?", "The image and PDF tools process selected files in your browser. The Image to Text tool downloads a recognition model. Tools that check a public URL send the address to our server."],
  ["Why did a URL check fail even though the page opens for me?", "A site can limit automated traffic, require authentication, or respond differently by location. Confirm the URL and verify the result in your browser before changing the page."],
  ["Can the tools tell me whether a page will rank or be indexed?", "Use the reports to check specific inputs and public page responses. For indexing status on a site you manage, check the URL in Google Search Console."],
];

export default function HomePage() {
  const available = tools.filter((tool) => tool.status === "ready");
  return (
    <div className="bg-white text-brand-ink">
      <HomeTools tools={available}>
        <section aria-labelledby="quick-checks" className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
          <h2 id="quick-checks" className="text-center text-3xl font-bold">Quick checks for public pages</h2>
          <p className="mt-2 text-center text-sm text-slate-600">Paste a URL or domain to see what the page or registry currently reports.</p>
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
              <h2 className="text-3xl font-bold tracking-tight">Check what a published page serves</h2>
              <p className="mt-4 leading-7 text-slate-700">
                Start with the title and meta description, then check the page’s headings, links and image alt text. These tools read the HTML returned for the URL you enter. If a site relies on JavaScript to add content, compare the report with the page in your browser.
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
            <p className="mt-1 text-sm text-slate-600">See examples for an article, a service page and a product page.</p>
          </div>
          <Link href="/blog" className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-ink">
            Browse SEO guides <ArrowRight className="h-4 w-4" aria-hidden="true" />
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
        <h2 className="text-2xl font-bold">Find a tool for your next task</h2>
        <Link href="#tools" className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-brand-ink hover:bg-brand-blue">
          Browse tools <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </section>
    </div>
  );
}
