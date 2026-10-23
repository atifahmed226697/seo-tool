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

  const cards = [
    { label: "Words", value: stats.words.toLocaleString() },
    { label: "Characters", value: stats.characters.toLocaleString() },
    { label: "Characters (no spaces)", value: stats.charactersNoSpaces.toLocaleString() },
    { label: "Sentences", value: stats.sentences.toLocaleString() },
    { label: "Paragraphs", value: stats.paragraphs.toLocaleString() },
    { label: "Reading time", value: formatTime(stats.readingMinutes) },
    { label: "Speaking time", value: formatTime(stats.speakingMinutes) },
  ];

  return (
    <div className="space-y-6">
      <div>
        <label
          htmlFor="word-counter-input"
          className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400"
        >
          Your text
        </label>
        <textarea
          id="word-counter-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          placeholder="Type or paste your text here..."
          className="w-full rounded-xl border border-slate-300 bg-white p-4 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
        />
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={() => setText("")}
            disabled={!text}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Clear
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {card.label}
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}