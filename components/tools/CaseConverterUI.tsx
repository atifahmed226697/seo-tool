"use client";

import React, { useState } from "react";
import {
  toUpperCase,
  toLowerCase,
  toTitleCase,
  toSentenceCase,
  getTextStats,
} from "@/lib/caseUtils";
import {
  Copy,
  Check,
  RotateCcw,
  ArrowDownAZ,
  FileText,
  AlignLeft,
  Hash,
} from "lucide-react";

export function CaseConverterUI() {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

  const stats = getTextStats(text);

  const handleConvert = (converter: (input: string) => string) => {
    if (!text) return;
    setText(converter(text));
  };

  const handleCopy = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const handleClear = () => {
    setText("");
    setCopied(false);
  };

  return (
    <div className="space-y-6">
      {/* Live Counter Statistics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="flex items-center gap-3 rounded-xl border border-slate-200/90 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-900/60">
          <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-950/70 dark:text-indigo-400">
            <Hash className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Characters
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              {stats.characters.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-slate-200/90 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-900/60">
          <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/70 dark:text-emerald-400">
            <FileText className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Words
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              {stats.words.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-slate-200/90 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-900/60">
          <div className="rounded-lg bg-sky-50 p-2 text-sky-600 dark:bg-sky-950/70 dark:text-sky-400">
            <AlignLeft className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Sentences
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              {stats.sentences.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-slate-200/90 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-900/60">
          <div className="rounded-lg bg-amber-50 p-2 text-amber-600 dark:bg-amber-950/70 dark:text-amber-400">
            <AlignLeft className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Lines
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              {stats.lines.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Main Textarea Input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label
            htmlFor="case-converter-input"
            className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
          >
            Enter or Paste Text
          </label>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {stats.charactersNoSpaces} characters excluding spaces
          </span>
        </div>

        <div className="relative">
          <textarea
            id="case-converter-input"
            rows={10}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste your text here to convert case instantly..."
            className="w-full resize-y rounded-xl border border-slate-300 bg-white p-4 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500"
            aria-label="Input text for case transformation"
          />
        </div>
      </div>

      {/* Action Buttons Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* 4 Required Transformation Buttons */}
        <button
          type="button"
          onClick={() => handleConvert(toUpperCase)}
          disabled={!text}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 active:scale-95"
        >
          <ArrowDownAZ className="h-4 w-4" />
          UPPERCASE
        </button>

        <button
          type="button"
          onClick={() => handleConvert(toLowerCase)}
          disabled={!text}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 active:scale-95"
        >
          <ArrowDownAZ className="h-4 w-4" />
          lowercase
        </button>

        <button
          type="button"
          onClick={() => handleConvert(toTitleCase)}
          disabled={!text}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 active:scale-95"
        >
          <ArrowDownAZ className="h-4 w-4" />
          Title Case
        </button>

        <button
          type="button"
          onClick={() => handleConvert(toSentenceCase)}
          disabled={!text}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 active:scale-95"
        >
          <ArrowDownAZ className="h-4 w-4" />
          Sentence case
        </button>

        {/* Copy & Clear Controls */}
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            disabled={!text}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-xs sm:text-sm font-medium transition-all ${
              copied
                ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            aria-label="Copy converted text to clipboard"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                  Copied!
                </span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>Copy</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleClear}
            disabled={!text}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-red-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Clear all text"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Clear</span>
          </button>
        </div>
      </div>
    </div>
  );
}
