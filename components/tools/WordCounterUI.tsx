"use client";

import { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";

/** Counts everything we show from the given text. */
function analyze(text: string) {
  const trimmed = text.trim();
  const words = trimmed ? trimmed.split(/\s+/).length : 0;
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, "").length;
  const sentences = trimmed ? (trimmed.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || []).length : 0;
  const paragraphs = trimmed ? trimmed.split(/\n\s*\n/).filter((p) => p.trim()).length : 0;
  const readingMinutes = words / 200; // average silent reading speed
  const speakingMinutes = words / 130; // average speaking speed
  return { words, characters, charactersNoSpaces, sentences, paragraphs, readingMinutes, speakingMinutes };
}

/** Turns minutes into a friendly "1 min 30 sec" text. */
function formatTime(minutes: number): string {
  if (minutes <= 0) return "0 sec";
  const totalSeconds = Math.round(minutes * 60);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  if (m === 0) return `${s} sec`;
  return s === 0 ? `${m} min` : `${m} min ${s} sec`;
}

export default function WordCounterUI() {
  const [text, setText] = useState("");
  const stats = useMemo(() => analyze(text), [text]);

  // Main numbers: shown big at the top
  const mainStats = [
    { label: "Words", value: stats.words.toLocaleString(), highlight: true },
    { label: "Characters", value: stats.characters.toLocaleString(), highlight: false },
    { label: "Sentences", value: stats.sentences.toLocaleString(), highlight: false },
    { label: "Paragraphs", value: stats.paragraphs.toLocaleString(), highlight: false },
  ];

  // Extra numbers: smaller, in a second row
  const extraStats = [
    { label: "Characters (no spaces)", value: stats.charactersNoSpaces.toLocaleString() },
    { label: "Reading time", value: formatTime(stats.readingMinutes) },
    { label: "Speaking time", value: formatTime(stats.speakingMinutes) },
  ];

  return (
    <div className="space-y-5">
      {/* Results: placed above the text box so counts are always in view */}
      <div className="overflow-hidden rounded-md border border-slate-300 dark:border-slate-700">
        <div className="grid grid-cols-2 gap-px bg-slate-200 sm:grid-cols-4 dark:bg-slate-800">
          {mainStats.map((item) => (
            <div key={item.label} className="bg-white px-4 py-4 dark:bg-slate-900">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {item.label}
              </p>
              <p
                className={`mt-1 font-serif text-3xl font-bold tabular-nums ${
                  item.highlight
                    ? "text-accent-600 dark:text-accent-400"
                    : "text-indigo-700 dark:text-white"
                }`}
              >
                {item.value}
              </p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-px border-t border-slate-200 bg-slate-200 sm:grid-cols-3 dark:border-slate-800 dark:bg-slate-800">
          {extraStats.map((item) => (
            <div
              key={item.label}
              className="flex items-baseline justify-between gap-3 bg-slate-50 px-4 py-3 dark:bg-slate-900/70"
            >
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {item.label}
              </p>
              <p className="font-serif text-lg font-bold tabular-nums text-indigo-700 dark:text-white">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Text box */}
      <div>
        <label
          htmlFor="word-counter-input"
          className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300"
        >
          Your text
        </label>
        <textarea
          id="word-counter-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={12}
          placeholder="Type or paste your text here..."
          className="w-full resize-y rounded-md border border-slate-300 bg-white p-4 text-base text-slate-900 placeholder-slate-400 outline-none transition-colors focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500"
        />
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={() => setText("")}
            disabled={!text}
            className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-accent-500 hover:text-accent-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-slate-300 disabled:hover:text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:text-accent-400"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}