import React from "react";
import Link from "next/link";
import { tools } from "@/lib/tools";
import { Wrench } from "lucide-react";

const quickLinks = [
  { label: "Blog", href: "/blog" },
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms" },
];

export function Footer() {
  // Sirf pehle 6 live tools footer mein dikhayenge
  const popularTools = tools.filter((t) => t.status === "ready").slice(0, 6);

  const linkClass =
    "text-sm text-indigo-200 transition-colors hover:text-accent-400";
  const headingClass =
    "text-xs font-bold uppercase tracking-widest text-white";

  return (
    <footer className="bg-indigo-800 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent-500 text-white">
                <Wrench className="h-4 w-4" />
              </div>
              <span className="text-lg font-extrabold tracking-tight text-white">
                SEO Toolkit
              </span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-indigo-200">
              Free, fast SEO tools for webmasters, bloggers and digital
              marketers. No signup, no clutter.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className={headingClass}>Quick Links</h4>
            <ul className="mt-4 space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Tools */}
          <div>
            <h4 className={headingClass}>Popular Tools</h4>
            <ul className="mt-4 space-y-3">
              {popularTools.map((tool) => (
                <li key={tool.slug}>
                  <Link href={`/tools/${tool.slug}`} className={linkClass}>
                    {tool.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/#tools"
                  className="text-sm font-semibold text-accent-400 transition-colors hover:text-accent-300"
                >
                  View all tools →
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom line */}
        <div className="mt-12 flex flex-col items-center justify-between gap-2 border-t border-white/10 pt-6 text-xs text-indigo-300 sm:flex-row">
          <p>© {new Date().getFullYear()} SEO Toolkit. All rights reserved.</p>
          <p>Made for webmasters and marketers.</p>
        </div>
      </div>
    </footer>
  );
}