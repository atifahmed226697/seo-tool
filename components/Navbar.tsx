"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { tools } from "@/lib/tools";
import { ToolIcon } from "@/components/ToolIcon";
import { Wrench, Menu, X, ChevronDown, ArrowRight } from "lucide-react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const toolsButtonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  const linkBase =
    "text-sm font-medium transition-colors hover:text-accent-600 dark:hover:text-accent-400";
  const linkActive = "text-indigo-700 dark:text-accent-400";
  const linkIdle = "text-slate-600 dark:text-slate-300";

  function renderToolLinks(closeMenu: () => void) {
    return tools.filter((tool) => tool.status === "ready").map((tool) => {
      const href = `/tools/${tool.slug}`;
      const isActive = pathname === href;

      return (
        <Link
          key={tool.slug}
          href={href}
          onClick={closeMenu}
          aria-current={isActive ? "page" : undefined}
          className={`flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium leading-snug transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#35615B] ${
            isActive
              ? "bg-[#DDEDEC] text-[#181D16] dark:bg-slate-800 dark:text-accent-400"
              : "text-[#181D16] hover:bg-[#CA8EFD] dark:text-slate-200 dark:hover:bg-slate-800"
          }`}
        >
          <span className="shrink-0" aria-hidden="true">
            <ToolIcon
              name={tool.icon}
              className="h-4 w-4 text-[#35615B] dark:text-accent-400"
            />
          </span>
          <span>{tool.name}</span>
        </Link>
      );
    });
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 transition-opacity hover:opacity-90"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#181D16] text-white">
            <Wrench className="h-4 w-4" />
          </div>
          <span className="text-lg font-extrabold leading-none tracking-tight text-indigo-700 dark:text-white">
            SEO Toolkit
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          <Link
            href="/"
            className={`${linkBase} ${pathname === "/" ? linkActive : linkIdle}`}
          >
            Home
          </Link>

          <div
            className="relative"
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) {
                setToolsDropdownOpen(false);
              }
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape" && toolsDropdownOpen) {
                event.preventDefault();
                setToolsDropdownOpen(false);
                toolsButtonRef.current?.focus();
              }
            }}
          >
            <button
              ref={toolsButtonRef}
              type="button"
              className={`flex items-center gap-1 ${linkBase} ${
                pathname?.startsWith("/tools") ? linkActive : linkIdle
              }`}
              onClick={() => setToolsDropdownOpen((open) => !open)}
              aria-expanded={toolsDropdownOpen}
              aria-controls="desktop-tools-dropdown"
            >
              <span>All Tools</span>
              <ChevronDown
                aria-hidden="true"
                className={`h-4 w-4 transition-transform ${
                  toolsDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            <div
              id="desktop-tools-dropdown"
              hidden={!toolsDropdownOpen}
              className="absolute left-1/2 top-full w-[28rem] -translate-x-1/2 pt-3"
            >
              <div className="max-h-[70vh] overflow-y-auto rounded-xl border border-[#C6DAD7] bg-white p-3 shadow-lg dark:border-slate-800 dark:bg-slate-900">
                <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                  {renderToolLinks(() => setToolsDropdownOpen(false))}
                </div>
              </div>
            </div>
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

        <div className="flex items-center gap-2">
          <Link
            href="/#tools"
            className="hidden items-center gap-1.5 rounded-md bg-[#181D16] px-3.5 py-2 text-xs font-bold text-white transition-colors hover:bg-indigo-800 sm:inline-flex"
          >
            <span>Browse Tools</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="inline-flex items-center justify-center rounded-md p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 md:hidden dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      <nav
        id="mobile-navigation"
        hidden={!mobileMenuOpen}
        aria-label="Mobile navigation"
        className="max-h-[80vh] overflow-y-auto border-b border-slate-200 bg-white px-4 py-4 md:hidden dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex flex-col gap-3">
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

          <div className="border-t border-[#C6DAD7] pt-3 dark:border-slate-800">
            <h2 className="mb-2 px-3 text-xs font-bold uppercase tracking-wide text-[#35615B] dark:text-slate-300">
              All Tools
            </h2>
            <div className="grid grid-cols-1 gap-1">
              {renderToolLinks(() => setMobileMenuOpen(false))}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}