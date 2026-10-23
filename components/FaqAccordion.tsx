"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

const faqs: FaqItem[] = [
  {
    question: "Are all tools in SEO Toolkit free to use?",
    answer:
      "Yes. The tools that are live today are free, with no registration or credit card required. Some tools marked Coming soon need paid data sources, and we will announce how they work when they launch.",
  },
  {
    question: "Which tools are available right now?",
    answer:
      "Case Converter, Meta Tag Generator, Meta Tag Analyzer and Domain Age Checker are live. DA/PA Checker, Spam Score Checker and Google Index Checker are coming soon.",
  },
  {
    question: "Is my data or URL kept private?",
    answer:
      "Case Converter and Meta Tag Generator run entirely in your browser, so your text is never sent to us. Meta Tag Analyzer and Domain Age Checker send only the URL or domain you enter to our server so it can look it up. We do not sell your queries.",
  },
  {
    question: "Why does a domain or URL check sometimes fail?",
    answer:
      "Some websites block automated requests, and some domain extensions do not publish registration data. If a check fails, try again in a minute or test a different page.",
  },
];

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-4">
      {faqs.map((faq, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={index}
            className="rounded-xl border border-slate-200 bg-white transition-all dark:border-slate-800 dark:bg-slate-900/60"
          >
            <button
              type="button"
              onClick={() => toggle(index)}
              className="flex w-full items-center justify-between p-5 text-left text-sm sm:text-base font-semibold text-slate-900 transition-colors hover:text-indigo-600 dark:text-slate-100 dark:hover:text-indigo-400"
              aria-expanded={isOpen}
            >
              <span className="flex items-center gap-3 pr-4">
                <HelpCircle className="h-4 w-4 text-indigo-500 shrink-0" />
                {faq.question}
              </span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${
                  isOpen ? "rotate-180 text-indigo-600 dark:text-indigo-400" : ""
                }`}
              />
            </button>
            {isOpen && (
              <div className="border-t border-slate-100 px-5 pb-5 pt-3 text-xs sm:text-sm leading-relaxed text-slate-600 dark:border-slate-800/80 dark:text-slate-400">
                {faq.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}