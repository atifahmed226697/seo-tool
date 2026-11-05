import React from "react";
import Link from "next/link";
import { tools } from "@/lib/tools";
import { ArrowRight, Wrench } from "lucide-react";

const exploreLinks = [
  { label: "All Tools", href: "/#tools" },
  { label: "Blog", href: "/blog" },
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms" },
];

export function Footer() {
  // Display the first six available tools.
  const footerTools = tools
    .filter((tool) => tool.status === "ready")
    .slice(0, 6);

  const linkClass =
    "inline-block rounded px-1 py-1 text-sm leading-relaxed text-[#344F48] transition-colors hover:bg-[#CA8EFD] hover:text-[#181D16] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#35615B] dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white";

  const headingClass =
    "text-xs font-bold uppercase tracking-widest text-[#181D16] dark:text-slate-100";

  return (
    <footer className="border-t border-[#BBD5D0] bg-[#DDEDEC] text-[#181D16] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-[1.4fr_1fr_1.2fr_1fr] lg:gap-10">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#35615B]"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#181D16] text-white">
                <Wrench className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="text-lg font-extrabold tracking-tight">
                SEO Toolkit
              </span>
            </Link>

            <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#344F48] dark:text-slate-300">
              Practical SEO tools and guides to help you check your pages,
              improve your content and track your campaigns.
            </p>

            <Link
              href="/#tools"
              className="mt-5 inline-flex items-center gap-2 rounded-md bg-[#181D16] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#CA8EFD] hover:text-[#181D16] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#35615B]"
            >
              Explore tools
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          {/* Site navigation */}
          <nav aria-label="Footer explore links">
            <h2 className={headingClass}>Explore</h2>
            <ul className="-ml-1 mt-4 space-y-1.5">
              {exploreLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Tool navigation */}
          <nav aria-label="Footer tool links">
            <h2 className={headingClass}>Tools</h2>
            <ul className="-ml-1 mt-4 space-y-1.5">
              {footerTools.map((tool) => (
                <li key={tool.slug}>
                  <Link
                    href={`/tools/${tool.slug}`}
                    className={linkClass}
                  >
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Legal navigation */}
          <nav aria-label="Footer legal links">
            <h2 className={headingClass}>Legal</h2>
            <ul className="-ml-1 mt-4 space-y-1.5">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Copyright */}
        <div className="mt-10 flex flex-col gap-3 border-t border-[#BBD5D0] pt-6 text-xs leading-relaxed text-[#344F48] sm:flex-row sm:items-center sm:justify-between dark:border-slate-700 dark:text-slate-400">
          <p>
            © {new Date().getFullYear()} SEO Toolkit. All rights reserved.
          </p>
          <p>Tools and guides for everyday SEO work.</p>
        </div>
      </div>
    </footer>
  );
}