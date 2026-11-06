import type { Metadata } from "next";
import Link from "next/link";
import { tools } from "@/lib/tools";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "SEO Toolkit is a free collection of simple SEO and content tools for webmasters, bloggers and marketers. Learn what we build and why.",
};

export default function AboutPage() {
  const liveCount = tools.filter((t) => t.status === "ready").length;

  return (
    <div>
      {/* Top banner */}
      <section className="bg-brand-blue py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-bold uppercase tracking-widest text-brand-ink">
            About Us
          </p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-brand-ink sm:text-4xl">
            Simple SEO tools, built to be used.
          </h1>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-3xl space-y-4 px-4 text-base leading-relaxed text-slate-700 sm:px-6 lg:px-8 dark:text-slate-300">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Who we are
          </h2>
          <p>
            SEO Toolkit is a free website with practical tools for webmasters,
            bloggers, content writers and digital marketers. Right now there
            are {liveCount} tools live, and more are on the way.
          </p>

          <h2 className="pt-6 text-2xl font-bold text-slate-900 dark:text-white">
            Why we built it
          </h2>
          <p>
            Many SEO tool websites are slow, full of popups, or ask you to
            create an account before you can check one thing. We wanted the
            opposite: open a tool, paste your input, get your answer. Nothing
            more.
          </p>

          <h2 className="pt-6 text-2xl font-bold text-slate-900 dark:text-white">
            What you can do here
          </h2>
          <p>
            You can generate and analyze meta tags, check how old a domain is,
            build UTM links, create hreflang tags, scan a page for broken links
            and missing image alt text, check heading structure, and count
            words or measure keyword density in your writing.
          </p>

          <h2 className="pt-6 text-2xl font-bold text-slate-900 dark:text-white">
            How we work
          </h2>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong>Free to use.</strong> No signup and no credit card for any
              live tool.
            </li>
            <li>
              <strong>Private by design.</strong> Text tools run in your
              browser. Tools that check a live page send only the address you
              enter, and we do not store it.
            </li>
            <li>
              <strong>Honest about limits.</strong> Tools that need paid data,
              such as DA / PA and Spam Score, are marked Coming soon until they
              work properly.
            </li>
            <li>
              <strong>Supported by ads.</strong> We may show ads to cover the
              cost of running the site. See our{" "}
              <Link
                href="/privacy-policy"
                className="font-semibold text-indigo-700 underline hover:text-accent-600 dark:text-accent-400"
              >
                Privacy Policy
              </Link>{" "}
              for details.
            </li>
          </ul>

          <h2 className="pt-6 text-2xl font-bold text-slate-900 dark:text-white">
            Get in touch
          </h2>
          <p>
            Found a bug, or want a tool we do not have yet? We would like to
            hear it. Visit our{" "}
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