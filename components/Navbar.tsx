"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { tools } from "@/lib/tools";
import { ToolIcon } from "@/components/ToolIcon";
import { Wrench, Menu, X, ChevronDown, ArrowRight } from "lucide-react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const pathname = usePathname();

  /** Small status label shown next to each tool. */
  const statusLabel = (status: string) => (status === "ready" ? "Ready" : "Soon");
  const statusClass = (status: string) =>
    status === "ready"
      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
      : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300";

  const linkBase =
    "text-sm font-medium transition-colors hover:text-accent-600 dark:hover:text-accent-400";
  const linkActive = "text-indigo-700 dark:text-accent-400";
  const linkIdle = "text-slate-600 dark:text-slate-300";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 transition-opacity hover:opacity-90"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-700 text-white dark:bg-accent-500">
            <Wrench className="h-4 w-4" />
          </div>
          <span className="text-lg font-extrabold leading-none tracking-tight text-indigo-700 dark:text-white">
            SEO Toolkit
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7">
          <Link
            href="/"
            className={`${linkBase} ${pathname === "/" ? linkActive : linkIdle}`}
          >
            Home
          </Link>

          <div
            className="relative"
            onMouseEnter={() => setToolsDropdownOpen(true)}
            onMouseLeave={() => setToolsDropdownOpen(false)}
          >
            <button
              type="button"
              className={`flex items-center gap-1 ${linkBase} ${
                pathname?.startsWith("/tools") ? linkActive : linkIdle
              }`}
              onClick={() => setToolsDropdownOpen(!toolsDropdownOpen)}
              aria-expanded={toolsDropdownOpen}
            >
              <span>All Tools</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  toolsDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {toolsDropdownOpen && (
              <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 w-80">
                <div className="max-h-[70vh] overflow-y-auto rounded-lg border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-900">
                  <div className="space-y-0.5">
                    {tools.map((tool) => {
                      const isActive = pathname === `/tools/${tool.slug}`;
                      return (
                        <Link
                          key={tool.slug}
                          href={`/tools/${tool.slug}`}
                          onClick={() => setToolsDropdownOpen(false)}
                          className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
                            isActive
                              ? "bg-indigo-50 text-indigo-700 dark:bg-slate-800 dark:text-accent-400"
                              : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                          }`}
                        >
                          <ToolIcon
                            name={tool.icon}
                            className="h-4 w-4 text-indigo-600 dark:text-accent-400"
                          />
                          <div className="flex-1 truncate">
                            <span className="font-semibold block truncate">{tool.name}</span>
                          </div>
                          <span
                            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${statusClass(
                              tool.status
                            )}`}
                          >
                            {statusLabel(tool.status)}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          <Link
            href="/blog"
            className={`${linkBase} ${
              pathname?.startsWith("/blog") ? linkActive : linkIdle
            }`}
          >
            Blog
          </Link>
          <Link href="/#faq" className={`${linkBase} ${linkIdle}`}>
            FAQ
          </Link>
        </nav>

        {/* Action Button & Mobile Menu Toggle */}
        <div className="flex items-center gap-2">
          <Link
            href="/#tools"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-md bg-accent-500 px-3.5 py-2 text-xs font-bold text-white transition-colors hover:bg-accent-600"
          >
            <span>Browse Tools</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex items-center justify-center rounded-md p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 md:hidden dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="max-h-[80vh] overflow-y-auto border-b border-slate-200 bg-white px-4 py-4 md:hidden dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col space-y-3">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold text-slate-800 hover:text-accent-600 dark:text-slate-200"
            >
              Home
            </Link>
            <Link
              href="/blog"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold text-slate-800 hover:text-accent-600 dark:text-slate-200"
            >
              Blog
            </Link>
            <Link
              href="/#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold text-slate-800 hover:text-accent-600 dark:text-slate-200"
            >
              FAQ
            </Link>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 mb-2">
                All Tools
              </div>
              <div className="grid grid-cols-1 gap-1">
                {tools.map((tool) => (
                  <Link
                    key={tool.slug}
                    href={`/tools/${tool.slug}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between rounded-md p-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <span className="flex items-center gap-2">
                      <ToolIcon
                        name={tool.icon}
                        className="h-3.5 w-3.5 text-indigo-600 dark:text-accent-400"
                      />
                      {tool.name}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${statusClass(
                        tool.status
                      )}`}
                    >
                      {statusLabel(tool.status)}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}