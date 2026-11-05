"use client";

import React, { useState } from "react";
import { tools } from "@/lib/tools";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

const availableToolNames = tools
  .filter((tool) => tool.status === "ready")
  .map((tool) => tool.name)
  .join(", ");

const faqs: FaqItem[] = [
  {
    question: "Are the tools in the directory free to use?",
    answer:
      "Yes. Tools listed in our directory are free to use, with no registration or credit card required.",
  },
  {
    question: "Which tools are available?",
    answer: availableToolNames + ".",
  },
  {
    question: "How are my text and URLs processed?",
    answer:
      "Text entered into tools such as Case Converter and the text mode of Keyword Density Checker is processed in your browser. URL and domain checks send the address to our server to retrieve public information. Cloudflare Turnstile handles verification for these requests.",
  },
  {
    question: "Why does a domain or URL check sometimes fail?",
    answer:
      "A website may block automated requests, require a login or take too long to respond. Some registries do not publish every registration detail. Review the error message and try again later or check another public page.",
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