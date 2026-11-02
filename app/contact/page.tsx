import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Bug, Lightbulb, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Contact SEO Toolkit to report a bug, suggest a new tool or ask a question about our free SEO tools.",
};

const EMAIL = "contact@yourdomain.com";

const reasons = [
  {
    icon: Bug,
    title: "Report a bug",
    text: "A tool gave a wrong result or did not load? Tell us the tool name and what you entered.",
  },
  {
    icon: Lightbulb,
    title: "Suggest a tool",
    text: "Missing a tool you use often? Tell us what it should do.",
  },
  {
    icon: HelpCircle,
    title: "Ask a question",
    text: "Not sure how a tool works? Ask and we will point you in the right direction.",
  },
];

export default function ContactPage() {
  return (
    <div>
      {/* Top banner */}
      <section className="bg-indigo-700 py-12 sm:py-16 dark:bg-indigo-900">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-bold uppercase tracking-widest text-accent-400">
            Contact Us
          </p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            We would like to hear from you.
          </h1>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <p className="text-base leading-relaxed text-slate-700 dark:text-slate-300">
            The easiest way to reach us is by email. Write to the address
            below and we will reply as soon as we can.
          </p>

          {/* Email box */}
          <a
            href={`mailto:${EMAIL}`}
            className="mt-6 flex items-center gap-4 rounded-md border border-slate-200 bg-white p-5 transition-colors hover:border-accent-500 dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-indigo-700 text-white dark:bg-accent-500">
              <Mail className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Email
              </p>
              <p className="truncate text-lg font-semibold text-indigo-700 dark:text-accent-400">
                {EMAIL}
              </p>
            </div>
          </a>

          {/* What to write about */}
          <h2 className="mt-12 text-2xl font-bold text-slate-900 dark:text-white">
            What can you write to us about?
          </h2>
          <div className="mt-4 divide-y divide-slate-200 dark:divide-slate-800">
            {reasons.map((item) => (
              <div key={item.title} className="flex gap-4 py-5">
                <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-indigo-700 dark:text-accent-400" />
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-base leading-relaxed text-slate-700 dark:text-slate-300">
                    {item.text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-8 text-sm text-slate-500 dark:text-slate-400">
            Before you write, you may find your answer in our{" "}
            <Link
              href="/#faq"
              className="font-semibold text-indigo-700 underline hover:text-accent-600 dark:text-accent-400"
            >
              FAQ
            </Link>
            . For how we handle data, see our{" "}
            <Link
              href="/privacy-policy"
              className="font-semibold text-indigo-700 underline hover:text-accent-600 dark:text-accent-400"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  );
}