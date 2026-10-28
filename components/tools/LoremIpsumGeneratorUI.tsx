"use client";

import { useMemo, useState } from "react";
import { Copy, Check } from "lucide-react";

const WORDS = (
  "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua " +
  "enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure " +
  "in reprehenderit voluptate velit esse cillum fugiat nulla pariatur excepteur sint occaecat cupidatat non proident " +
  "sunt culpa qui officia deserunt mollit anim id est laborum"
).split(" ");

type Unit = "paragraphs" | "sentences" | "words";

/** Builds one sentence of random length from the word list. */
function makeSentence(seed: number): string {
  const length = 8 + ((seed * 7) % 9); // 8 to 16 words
  const start = (seed * 5) % WORDS.length;
  const parts: string[] = [];
  for (let i = 0; i < length; i++) parts.push(WORDS[(start + i * 3) % WORDS.length]);
  const text = parts.join(" ");
  return text.charAt(0).toUpperCase() + text.slice(1) + ".";
}

/** Builds the full placeholder text. */
function generate(unit: Unit, amount: number, startWithLorem: boolean): string {
  if (unit === "words") {
    const out: string[] = [];
    for (let i = 0; i < amount; i++) out.push(WORDS[i % WORDS.length]);
    return out.join(" ");
  }

  if (unit === "sentences") {
    const out: string[] = [];
    for (let i = 0; i < amount; i++) out.push(makeSentence(i + 1));
    let text = out.join(" ");
    if (startWithLorem) text = "Lorem ipsum dolor sit amet, " + text.charAt(0).toLowerCase() + text.slice(1);
    return text;
  }

  // paragraphs
  const paragraphs: string[] = [];
  for (let p = 0; p < amount; p++) {
    const sentences: string[] = [];
    const count = 4 + (p % 3); // 4 to 6 sentences
    for (let s = 0; s < count; s++) sentences.push(makeSentence(p * 10 + s + 1));
    paragraphs.push(sentences.join(" "));
  }
  if (startWithLorem && paragraphs.length > 0) {
    paragraphs[0] = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. " + paragraphs[0];
  }
  return paragraphs.join("\n\n");
}

export default function LoremIpsumGeneratorUI() {
  const [unit, setUnit] = useState<Unit>("paragraphs");
  const [amount, setAmount] = useState(3);
  const [startWithLorem, setStartWithLorem] = useState(true);
  const [copied, setCopied] = useState(false);

  const safeAmount = Math.min(Math.max(amount || 1, 1), 100);
  const text = useMemo(
    () => generate(unit, safeAmount, startWithLorem),
    [unit, safeAmount, startWithLorem]
  );

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard not available */
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-6">
        <div>
          <label
            htmlFor="lorem-amount"
            className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400"
          >
            Amount (1 to 100)
          </label>
          <input
            id="lorem-amount"
            type="number"
            min={1}
            max={100}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-28 rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />
        </div>

        <div>
          <label
            htmlFor="lorem-unit"
            className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400"
          >
            Type
          </label>
          <select
            id="lorem-unit"
            value={unit}
            onChange={(e) => setUnit(e.target.value as Unit)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          >
            <option value="paragraphs">Paragraphs</option>
            <option value="sentences">Sentences</option>
            <option value="words">Words</option>
          </select>
        </div>

        <label className="flex items-center gap-2 pb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
          <input
            type="checkbox"
            checked={startWithLorem}
            onChange={(e) => setStartWithLorem(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300"
          />
          Start with &quot;Lorem ipsum&quot;
        </label>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
            Generated text
          </p>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <div className="whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-sm leading-relaxed text-slate-800 dark:bg-slate-950 dark:text-slate-200">
          {text}
        </div>
      </div>
    </div>
  );
}