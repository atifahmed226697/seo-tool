import { sitePageMetadata } from "@/lib/site-page-metadata";
import Link from "next/link";
import { tools } from "@/lib/tools";
import { ArrowRight } from "lucide-react";

export const metadata = sitePageMetadata(
  "/about",
  "About",
  "Learn who SEO Toolkit is for, how its browser tools and public URL checks work, and how to report a problem.",
);

export default function AboutPage() {
  const liveCount = tools.filter((t) => t.status === "ready").length;

  return (
    <div>
      {/* Top banner */}
      <section className="bg-brand-blue py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-bold uppercase tracking-widest text-brand-ink">
            The website
          </p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-brand-ink sm:text-4xl">
            About SEO Toolkit
          </h1>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-3xl space-y-4 px-4 text-base leading-relaxed text-slate-700 sm:px-6 lg:px-8 dark:text-slate-300">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Who the tools are for
          </h2>
          <p>
            SEO Toolkit is for site owners, content editors and developers who
            need to check a page or prepare a file before publishing. The directory
            currently lists {liveCount} tools, from metadata and redirect checks
            to sitemap, image and PDF utilities.
          </p>

          <h2 className="pt-6 text-2xl font-bold text-slate-900 dark:text-white">
            How the tools work
          </h2>
          <p>
            Text, image and PDF tools work in the browser. A public URL or domain
            check uses our server to fetch a response or look up public records.
            Some checks depend on external services or what the destination returns.
            See the <Link href="/privacy-policy" className="font-semibold underline">Privacy Policy</Link> for details.
          </p>

          <h2 className="pt-6 text-2xl font-bold text-slate-900 dark:text-white">
            How to read the results
          </h2>
          <p>
            Start with one task. For example, check the old URL after a site
            migration with <Link href="/tools/redirect-checker" className="font-semibold underline">Redirect Checker</Link>,
            then use <Link href="/tools/meta-tag-analyzer" className="font-semibold underline">Meta Tag Analyzer</Link> on
            the destination. Read the result alongside the published page or your
            own dashboard before making changes.
          </p>

          <h2 className="pt-6 text-2xl font-bold text-slate-900 dark:text-white">
            Get in touch
          </h2>
          <p>
            For a bug, a tool suggestion or a question about a result, visit our{" "}
            <Link
              href="/contact"
              className="font-semibold text-indigo-700 underline hover:text-accent-600 dark:text-accent-400"
            >
              Contact page
            </Link>
            .
          </p>

          <div className="pt-8">
            <Link
              href="/#tools"
              className="inline-flex items-center gap-2 rounded-md bg-accent-500 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-accent-600"
            >
              <span>Explore Tools</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}