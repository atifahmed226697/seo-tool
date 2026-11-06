"use client";

import React, { useState } from "react";
import {
  toUpperCase,
  toLowerCase,
  toTitleCase,
  toSentenceCase,
  getTextStats,
} from "@/lib/caseUtils";
import { Copy, Check, Download, Trash2, Undo2 } from "lucide-react";

/** First letter of every word in capitals, the rest in lowercase. */
function toCapitalizedCase(input: string): string {
  return input
    .toLowerCase()
    .split(/(\s+)/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

/** Letters switch between lower and upper case one after another. */
function toAlternatingCase(input: string): string {
  let index = 0;
  return input
    .split("")
    .map((char) => {
      if (!/[a-z]/i.test(char)) return char;
      const result = index % 2 === 0 ? char.toLowerCase() : char.toUpperCase();
      index += 1;
      return result;
    })
    .join("");
}

/** Upper case letters become lower case and the other way around. */
function toInverseCase(input: string): string {
  return input
    .split("")
    .map((char) =>
      char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase()
    )
    .join("");
}

const CASE_BUTTONS: {
  label: string;
  badge: string;
  convert: (input: string) => string;
}[] = [
  { label: "Sentence case", badge: "Sc", convert: toSentenceCase },
  { label: "lower case", badge: "lc", convert: toLowerCase },
  { label: "UPPER CASE", badge: "UC", convert: toUpperCase },
  { label: "Capitalized Case", badge: "CC", convert: toCapitalizedCase },
  { label: "aLtErNaTiNg cAsE", badge: "aC", convert: toAlternatingCase },
  { label: "Title Case", badge: "TC", convert: toTitleCase },
  { label: "InVeRsE CaSe", badge: "iC", convert: toInverseCase },
];

const iconButton =
  "inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 transition-colors hover:border-accent-500 hover:text-accent-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-300 disabled:hover:text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:text-accent-400";

export function CaseConverterUI() {
  const [text, setText] = useState("");
  const [previous, setPrevious] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const stats = getTextStats(text);

  const handleConvert = (converter: (input: string) => string) => {
    if (!text) return;
    setPrevious(text); // remember the text so Undo can bring it back
    setText(converter(text));
  };

  const handleUndo = () => {
    if (previous === null) return;
    setText(previous);
    setPrevious(null);
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

  const handleDownload = () => {
    if (!text) return;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "converted-text.txt";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setText("");
    setPrevious(null);
    setCopied(false);
  };

  return (
    <div className="space-y-4">
      {/* Text box */}
      <div>
        <label
          htmlFor="case-converter-input"
          className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300"
        >
          Enter or paste your text
        </label>
        <textarea
          id="case-converter-input"
          rows={10}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste your content here"
          className="w-full resize-y rounded-md border border-slate-300 bg-white p-4 text-base text-slate-900 placeholder-slate-400 transition-colors focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500"
        />
      </div>

      {/* Toolbar: icon buttons on the left, live counts on the right */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            disabled={!text}
            title="Copy text"
            aria-label="Copy text to clipboard"
            className={iconButton}
          >
            {copied ? (
              <Check className="h-4 w-4 text-emerald-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={!text}
            title="Download as .txt"
            aria-label="Download text as a file"
            className={iconButton}
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleUndo}
            disabled={previous === null}
            title="Undo last conversion"
            aria-label="Undo last conversion"
            className={iconButton}
          >
            <Undo2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={!text}
            title="Clear text"
            aria-label="Clear all text"
            className={iconButton}
          >
            <Trash2 className="h-4 w-4" />
          </button>
          {copied && (
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              Copied!
            </span>
          )}
        </div>

        <p className="text-sm tabular-nums text-slate-600 dark:text-slate-400">
          Character Count: <strong className="text-slate-900 dark:text-white">{stats.characters.toLocaleString()}</strong>
          <span className="mx-2 text-slate-300 dark:text-slate-700">|</span>
          Word Count: <strong className="text-slate-900 dark:text-white">{stats.words.toLocaleString()}</strong>
          <span className="mx-2 text-slate-300 dark:text-slate-700">|</span>
          Line Count: <strong className="text-slate-900 dark:text-white">{stats.lines.toLocaleString()}</strong>
        </p>
      </div>

      {/* Case buttons */}
      <div className="rounded-lg bg-brand-forest p-3">
        <div className="flex flex-wrap gap-2">
          {CASE_BUTTONS.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => handleConvert(item.convert)}
              disabled={!text}
              className="inline-flex items-center gap-2 rounded-md border border-transparent bg-white px-3 py-2 text-sm font-semibold text-brand-forest transition-colors enabled:hover:bg-brand-blue focus-visible:outline-white disabled:cursor-not-allowed disabled:bg-brand-blue/80"
            >
              <span className="rounded bg-brand-blue px-1.5 py-0.5 text-[11px] font-bold text-brand-forest">
                {item.badge}
              </span>
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}