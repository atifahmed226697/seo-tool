"use client";

import { useMemo, useState } from "react";
import { Copy, Check, Download, Minus, Plus, RefreshCw } from "lucide-react";

const WORDS = (
  "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua " +
  "enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure " +
  "in reprehenderit voluptate velit esse cillum fugiat nulla pariatur excepteur sint occaecat cupidatat non proident " +
  "sunt culpa qui officia deserunt mollit anim id est laborum"
).split(" ");

type Unit = "paragraphs" | "sentences" | "words";

const UNITS: { id: Unit; label: string }[] = [
  { id: "paragraphs", label: "Paragraphs" },
  { id: "sentences", label: "Sentences" },
  { id: "words", label: "Words" },
];

const QUICK_AMOUNTS = [1, 3, 5, 10];

/** Builds one sentence of 8 to 16 words from the word list. */
function makeSentence(seed: number): string {
  const length = 8 + ((seed * 7) % 9);
  const start = (seed * 5) % WORDS.length;
  const parts: string[] = [];
  for (let i = 0; i < length; i++) parts.push(WORDS[(start + i * 3) % WORDS.length]);
  const text = parts.join(" ");
  return text.charAt(0).toUpperCase() + text.slice(1) + ".";
}

/**
 * Builds the full placeholder text.
 * "variant" changes the result each time the person clicks Regenerate.
 */
function generate(unit: Unit, amount: number, startWithLorem: boolean, variant: number): string {
  const shift = variant * 37;

  if (unit === "words") {
    const offset = startWithLorem ? 0 : ((variant + 1) * 11) % WORDS.length;
    const out: string[] = [];
    for (let i = 0; i < amount; i++) out.push(WORDS[(offset + i) % WORDS.length]);
    return out.join(" ");
  }

  if (unit === "sentences") {
    const out: string[] = [];
    for (let i = 0; i < amount; i++) out.push(makeSentence(i + 1 + shift));
    let text = out.join(" ");
    if (startWithLorem) {
      text = "Lorem ipsum dolor sit amet, " + text.charAt(0).toLowerCase() + text.slice(1);
    }
    return text;
  }

  // paragraphs
  const paragraphs: string[] = [];
  for (let p = 0; p < amount; p++) {
    const sentences: string[] = [];
    const count = 4 + (p % 3); // 4 to 6 sentences per paragraph
    for (let s = 0; s < count; s++) sentences.push(makeSentence(p * 10 + s + 1 + shift));
    paragraphs.push(sentences.join(" "));
  }
  if (startWithLorem && paragraphs.length > 0) {
    paragraphs[0] = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. " + paragraphs[0];
  }
  return paragraphs.join("\n\n");
}

const actionButton =
  "inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition-colors hover:border-accent-500 hover:text-accent-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:text-accent-400";

const stepButton =
  "inline-flex h-11 w-11 items-center justify-center border border-slate-300 bg-white text-slate-700 transition-colors hover:border-accent-500 hover:text-accent-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-300 disabled:hover:text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200";

export default function LoremIpsumGeneratorUI() {
  const [unit, setUnit] = useState<Unit>("paragraphs");
  const [amount, setAmount] = useState(3);
  const [startWithLorem, setStartWithLorem] = useState(true);
  const [variant, setVariant] = useState(0);
  const [copied, setCopied] = useState(false);

  const safeAmount = Math.min(Math.max(amount || 1, 1), 100);
  const text = useMemo(
    () => generate(unit, safeAmount, startWithLorem, variant),
    [unit, safeAmount, startWithLorem, variant]
  );

  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const charCount = text.length;

  const setClamped = (value: number) => {
    setAmount(Math.min(Math.max(Math.round(value) || 1, 1), 100));
  };

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard not available */
    }
  }

  function handleDownload() {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "lorem-ipsum.txt";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="space-y-5 rounded-md border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/50">
        {/* Type */}
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            What do you need?
          </p>
          <div className="inline-flex flex-wrap gap-2">
            {UNITS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setUnit(item.id)}
                aria-pressed={unit === item.id}
                className={`rounded-md border px-5 py-2 text-sm font-bold transition-colors ${
                  unit === item.id
                    ? "border-indigo-700 bg-indigo-700 text-white dark:border-accent-500 dark:bg-accent-500"
                    : "border-slate-300 bg-white text-slate-700 hover:border-accent-500 hover:text-accent-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:text-accent-400"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Amount */}
        <div className="flex flex-wrap items-end gap-x-8 gap-y-4">
          <div>
            <label
              htmlFor="lorem-amount"
              className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300"
            >
              How many? (1 to 100)
            </label>
            <div className="inline-flex">
              <button
                type="button"
                onClick={() => setClamped(safeAmount - 1)}
                disabled={safeAmount <= 1}
                aria-label="Decrease amount"
                className={`${stepButton} rounded-l-md`}
              >
                <Minus className="h-4 w-4" />
              </button>
              <input
                id="lorem-amount"
                type="number"
                min={1}
                max={100}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                onBlur={() => setClamped(amount)}
                className="h-11 w-20 border-y border-slate-300 bg-white text-center text-base font-bold tabular-nums text-slate-900 outline-none focus:border-accent-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
              <button
                type="button"
                onClick={() => setClamped(safeAmount + 1)}
                disabled={safeAmount >= 100}
                aria-label="Increase amount"
                className={`${stepButton} rounded-r-md`}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Quick pick
            </p>
            <div className="flex gap-2">
              {QUICK_AMOUNTS.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setClamped(n)}
                  aria-pressed={safeAmount === n}
                  className={`h-11 min-w-[2.75rem] rounded-md border px-3 text-sm font-bold transition-colors ${
                    safeAmount === n
                      ? "border-accent-500 bg-accent-500 text-white"
                      : "border-slate-300 bg-white text-slate-700 hover:border-accent-500 hover:text-accent-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:text-accent-400"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 pb-3 text-sm font-medium text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={startWithLorem}
              onChange={(e) => setStartWithLorem(e.target.checked)}
              className="h-4 w-4 accent-accent-500"
            />
            Start with &quot;Lorem ipsum&quot;
          </label>
        </div>
      </div>

      {/* Result */}
      <div className="rounded-md border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-3 dark:border-slate-800">
          <p className="text-sm tabular-nums text-slate-600 dark:text-slate-400">
            Words:{" "}
            <strong className="text-slate-900 dark:text-white">{wordCount.toLocaleString()}</strong>
            <span className="mx-2 text-slate-300 dark:text-slate-700">|</span>
            Characters:{" "}
            <strong className="text-slate-900 dark:text-white">{charCount.toLocaleString()}</strong>
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setVariant((v) => v + 1)}
              className={actionButton}
              title="Generate different text"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Regenerate
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className={actionButton}
              title="Download as .txt"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Download
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className={`inline-flex items-center gap-2 rounded-md px-5 py-2 text-sm font-bold text-white transition-colors ${
                copied ? "bg-emerald-600" : "bg-accent-500 hover:bg-accent-600"
              }`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        <div className="max-h-[28rem] overflow-y-auto whitespace-pre-wrap p-5 text-base leading-relaxed text-slate-800 dark:text-slate-200">
          {text}
        </div>
      </div>
    </div>
  );
}