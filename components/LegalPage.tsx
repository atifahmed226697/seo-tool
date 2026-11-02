import React from "react";

interface LegalPageProps {
  title: string;
  updated: string;
  children: React.ReactNode;
}

export function LegalPage({ title, updated, children }: LegalPageProps) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <h1 className="text-3xl font-extrabold tracking-tight text-indigo-700 sm:text-4xl dark:text-white">
        {title}
      </h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Last updated: {updated}
      </p>
      <div className="mt-8 h-1 w-16 rounded-full bg-accent-500" aria-hidden="true" />
      <div className="mt-8 space-y-4 text-base leading-relaxed text-slate-700 dark:text-slate-300">
        {children}
      </div>
    </div>
  );
}

export function LegalHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="pt-6 text-xl font-bold text-slate-900 dark:text-white">
      {children}
    </h2>
  );
}