"use client";

import React, { useState } from "react";
import { Globe, Search, Layers, Table as TableIcon } from "lucide-react";

export function GoogleIndexCheckerUI() {
  const [activeTab, setActiveTab] = useState<"single" | "bulk">("single");

  return (
    <div className="space-y-8">
      {/* Tab Switcher */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setActiveTab("single")}
          className={`inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs sm:text-sm font-semibold transition-colors ${
            activeTab === "single"
              ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          <Search className="h-4 w-4" />
          Single URL
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("bulk")}
          className={`inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs sm:text-sm font-semibold transition-colors ${
            activeTab === "bulk"
              ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          <Layers className="h-4 w-4" />
          Bulk URLs (Up to 20 URLs)
        </button>
      </div>

      {/* Input Area */}
      <div className="rounded-xl border border-slate-200/90 bg-slate-50/50 p-6 dark:border-slate-800 dark:bg-slate-900/40">
        {activeTab === "single" ? (
          <div>
            <label
              htmlFor="single-index-input"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2"
            >
              Exact Page URL
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                id="single-index-input"
                type="url"
                disabled
                readOnly
                placeholder="https://example.com/blog/article-slug"
                className="flex-1 rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-500 opacity-80 cursor-not-allowed dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
              />
              <button
                type="button"
                disabled
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white opacity-60 cursor-not-allowed shadow-sm"
              >
                <Globe className="h-4 w-4" />
                Check Index Status
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <label
                htmlFor="bulk-index-input"
                className="font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
              >
                Paste Multiple Page URLs (One per line)
              </label>
              <span className="text-slate-400">0 / 20 URLs</span>
            </div>
            <textarea
              id="bulk-index-input"
              rows={5}
              disabled
              readOnly
              placeholder={`https://example.com/page-1\nhttps://example.com/page-2\nhttps://example.com/page-3`}
              className="w-full resize-y rounded-lg border border-slate-300 bg-white p-3.5 text-sm text-slate-500 opacity-80 cursor-not-allowed dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
            />
            <button
              type="button"
              disabled
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white opacity-60 cursor-not-allowed shadow-sm"
            >
              <Globe className="h-4 w-4" />
              Check Bulk Indexation
            </button>
          </div>
        )}
      </div>

      {/* Results Table Section with Empty State */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Google Index Verification Results
          </h3>
          <span className="text-xs text-slate-400">0 records</span>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-600 dark:bg-slate-800/60 dark:border-slate-700 dark:text-slate-300">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Page URL</th>
                  <th className="px-4 py-3">Index Status</th>
                  <th className="px-4 py-3">Google Cache Date</th>
                  <th className="px-4 py-3">SERP Snippet Found</th>
                  <th className="px-4 py-3">Live SERP Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <TableIcon className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        No URLs checked yet
                      </span>
                      <p className="text-xs text-slate-400 max-w-sm">
                        Index verification flags and Google search cache timestamps will render here in Step 2.
                      </p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
