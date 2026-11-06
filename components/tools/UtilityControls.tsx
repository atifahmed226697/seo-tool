"use client";

import { useState } from "react";

export const fieldClass = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-brand-ink";
export const buttonClass = "rounded-full bg-brand-ink px-4 py-2 text-sm font-bold text-white hover:bg-brand-forest disabled:opacity-50";
const secondaryClass = "rounded-full border border-brand-forest px-4 py-2 text-sm font-semibold text-brand-forest hover:bg-brand-blue";

export function downloadFile(file: Blob, filename: string) {
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

export function TextResult({ text, filename, type = "text/plain" }: { text: string; filename: string; type?: string }) {
  const [feedback, setFeedback] = useState("");
  return (
    <div className="space-y-3">
      <label className="block font-semibold">
        Result
        <textarea readOnly value={text} rows={8} className={`mt-1 font-mono text-sm ${fieldClass}`} />
      </label>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className={secondaryClass} onClick={async () => {
          try {
            await navigator.clipboard.writeText(text);
            setFeedback("Copied.");
          } catch {
            setFeedback("Copy is unavailable. Select the result and copy it manually.");
          }
        }}>Copy</button>
        <button type="button" className={secondaryClass} onClick={() => downloadFile(new Blob([text], { type }), filename)}>Download {filename}</button>
        <span className="text-sm" role="status">{feedback}</span>
      </div>
    </div>
  );
}

export function encodeCanvas(canvas: HTMLCanvasElement, format: "image/png" | "image/jpeg" | "image/webp", quality?: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(blob => {
      if (!blob || blob.type !== format) reject(new Error("Your browser could not encode that format."));
      else resolve(blob);
    }, format, quality);
  });
}
