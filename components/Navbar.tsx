"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { tools } from "@/lib/tools";
import { ToolIcon } from "@/components/ToolIcon";
import { Wrench, Menu, X, ChevronDown, Layers } from "lucide-react";

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

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 font-bold tracking-tight text-slate-900 dark:text-white transition-opacity hover:opacity-90"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm shadow-indigo-500/20">
            <Wrench className="h-4 w-4" />
          </div>
          <span className="text-lg font-black leading-none bg-gradient-to-r from-indigo-600 via-indigo-500 to-sky-500 bg-clip-text text-transparent">
            SEO Toolkit
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors hover:text-indigo-600 dark:hover:text-indigo-400 ${
              pathname === "/"
                ? "text-indigo-600 dark:text-indigo-400"
                : "text-slate-600 dark:text-slate-300"
            }`}
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
              className={`flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-indigo-600 dark:hover:text-indigo-400 ${
                pathname?.startsWith("/tools")
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-slate-600 dark:text-slate-300"
              }`}
              onClick={() => setToolsDropdownOpen(!toolsDropdownOpen)}
              aria-expanded={toolsDropdownOpen}
            >
              <span>Explore Tools</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  toolsDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {toolsDropdownOpen && (
              <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 w-80">
                <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-900">
                  <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    All Tools
                  </div>
                  <div className="space-y-1">
                    {tools.map((tool) => {
                      const isActive = pathname === `/tools/${tool.slug}`;
                      return (
                        <Link
                          key={tool.slug}
                          href={`/tools/${tool.slug}`}
                          onClick={() => setToolsDropdownOpen(false)}
                          className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                            isActive
                              ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
                              : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                          }`}
                        >
                          <ToolIcon name={tool.icon} className="h-4 w-4 text-indigo-500" />
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
            href="/#why-us"
            className="text-sm font-medium text-slate-600 transition-colors hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400"
          >
            Why Us
          </Link>
          <Link
            href="/#faq"
            className="text-sm font-medium text-slate-600 transition-colors hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400"
          >
            FAQ
          </Link>
        </nav>

        {/* Action Button & Mobile Menu Toggle */}
        <div className="flex items-center gap-3">
          <Link
            href="/#tools"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Browse Directory</span>
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex items-center justify-center rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 md:hidden dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-slate-200 bg-white px-4 py-4 md:hidden dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col space-y-3">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold text-slate-800 hover:text-indigo-600 dark:text-slate-200"
            >
              Home
            </Link>
            <Link
              href="/#why-us"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-slate-600 hover:text-indigo-600 dark:text-slate-400"
            >
              Why Use These Tools
            </Link>
            <Link
              href="/#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-slate-600 hover:text-indigo-600 dark:text-slate-400"
            >
              Frequently Asked Questions
            </Link>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 mb-2">
                Tools
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
                      <ToolIcon name={tool.icon} className="h-3.5 w-3.5 text-indigo-500" />
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
