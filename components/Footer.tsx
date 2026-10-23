import React from "react";
import Link from "next/link";
import { tools, getCategories } from "@/lib/tools";
import { Wrench, ShieldCheck, Zap } from "lucide-react";

export function Footer() {
  const categories = getCategories();

  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950/80 transition-colors">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand & mission */}
          <div className="md:col-span-2 space-y-4">
            <Link
              href="/"
              className="flex items-center gap-2 font-bold tracking-tight text-slate-900 dark:text-white"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
                <Wrench className="h-4 w-4" />
              </div>
              <span className="text-lg font-black bg-gradient-to-r from-indigo-600 to-sky-500 bg-clip-text text-transparent">
                SEO Toolkit
              </span>
            </Link>
            <p className="max-w-sm text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Free, fast SEO tools for webmasters, digital marketers, content creators and developers.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1">
                <Zap className="h-3.5 w-3.5 text-amber-500" />
                Fast &amp; simple
              </span>
              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                No signup needed
              </span>
            </div>
          </div>

          {/* Tools by Category */}
          {categories.map((category) => {
            const categoryTools = tools.filter((t) => t.category === category);
            return (
              <div key={category} className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                  {category}
                </h4>
                <ul className="space-y-2 text-sm">
                  {categoryTools.map((tool) => (
                    <li key={tool.slug}>
                      <Link
                        href={`/tools/${tool.slug}`}
                        className="text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors block truncate"
                      >
                        {tool.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Bottom copyright line */}
        <div className="mt-12 border-t border-slate-100 pt-8 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} SEO Toolkit. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}