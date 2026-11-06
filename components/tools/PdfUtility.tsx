"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { buttonClass, downloadFile, encodeCanvas, fieldClass } from "./UtilityControls";

type Mode = "merge" | "split" | "rotate" | "jpg";
type Result = { blob: Blob; name: string };

function pageIndices(input: string, pageCount: number, maxPages: number) {
  const indices = new Set<number>();
  for (const part of input.split(",")) {
    const range = /^(\d+)(?:\s*-\s*(\d+))?$/.exec(part.trim());
    if (!range) throw new Error("Enter page numbers or ranges, e.g. 1, 3–5 using a hyphen.");
    const start = Number(range[1]);
    const end = Number(range[2] ?? range[1]);
    if (start < 1 || end < start || end > pageCount) throw new Error(`Choose pages between 1 and ${pageCount}.`);
    for (let page = start; page <= end; page++) {
      indices.add(page - 1);
      if (indices.size > maxPages) throw new Error(`Select at most ${maxPages} pages.`);
    }
  }
  return Array.from(indices);
}

async function exportJpgs(file: File, pages: string): Promise<Result[]> {
  const { getDocument, GlobalWorkerOptions } = await import("pdfjs-dist");
  const assetPath = "/tool-assets/pdf";
  GlobalWorkerOptions.workerSrc = `${assetPath}/pdf.worker.min.mjs`;
  const loading = getDocument({
    data: new Uint8Array(await file.arrayBuffer()),
    disableAutoFetch: true,
    cMapUrl: `${assetPath}/cmaps/`,
    standardFontDataUrl: `${assetPath}/standard_fonts/`,
    wasmUrl: `${assetPath}/wasm/`,
    iccUrl: `${assetPath}/iccs/`,
  });
  try {
    const pdf = await loading.promise;
    const indices = pageIndices(pages, pdf.numPages, 10);
    const results: Result[] = [];
    for (const index of indices) {
      const page = await pdf.getPage(index + 1);
      const original = page.getViewport({ scale: 1 });
      const scale = Math.min(2, 2400 / Math.max(original.width, original.height));
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.ceil(viewport.width));
      canvas.height = Math.max(1, Math.ceil(viewport.height));
      try {
        await page.render({ canvas, viewport, background: "#fff" }).promise;
        results.push({ blob: await encodeCanvas(canvas, "image/jpeg", 0.9), name: `page-${index + 1}.jpg` });
      } finally {
        page.cleanup();
        canvas.width = 0;
        canvas.height = 0;
      }
    }
    return results;
  } finally {
    await loading.destroy();
  }
}

async function processPdf(mode: Exclude<Mode, "jpg">, files: File[], pages: string, rotation: number): Promise<Result[]> {
  const { PDFDocument, degrees } = await import("pdf-lib");
  const output = await PDFDocument.create();
  if (mode === "merge") {
    for (const file of files) {
      const pdf = await PDFDocument.load(await file.arrayBuffer());
      const copies = await output.copyPages(pdf, pdf.getPageIndices());
      for (const page of copies) output.addPage(page);
    }
  } else {
    const pdf = await PDFDocument.load(await files[0].arrayBuffer());
    const indices = pageIndices(pages, pdf.getPageCount(), 500);
    if (mode === "rotate") {
      for (const index of indices) {
        const page = pdf.getPage(index);
        page.setRotation(degrees((page.getRotation().angle + rotation) % 360));
      }
      const bytes = await pdf.save();
      return [{ blob: new Blob([Uint8Array.from(bytes)], { type: "application/pdf" }), name: "rotated.pdf" }];
    }
    const copies = await output.copyPages(pdf, indices);
    for (const page of copies) output.addPage(page);
  }
  const bytes = await output.save();
  return [{ blob: new Blob([Uint8Array.from(bytes)], { type: "application/pdf" }), name: mode === "merge" ? "merged.pdf" : "selected-pages.pdf" }];
}

export default function PdfUtility({ mode }: { mode: Mode }) {
  const [files, setFiles] = useState<File[]>([]);
  const [pages, setPages] = useState("1");
  const [angle, setAngle] = useState(90);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const action = { merge: "Merge PDFs", split: "Extract pages", rotate: "Rotate pages", jpg: "Convert pages to JPG" }[mode];

  async function run(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setError("");
    setResults([]);
    setBusy(true);
    try {
      if (files.length < (mode === "merge" ? 2 : 1) || files.length > 10) {
        throw new Error(mode === "merge" ? "Choose 2 to 10 PDFs." : "Choose one PDF.");
      }
      if (files.reduce((sum, file) => sum + file.size, 0) > 50 * 1024 * 1024) throw new Error("Use up to 50 MB of PDF files in total.");
      setResults(mode === "jpg" ? await exportJpgs(files[0], pages) : await processPdf(mode, files, pages, angle));
    } catch (failure) {
      const message = failure instanceof Error ? failure.message : "";
      setError(/^(?:Choose|Enter|Select|Use) /.test(message) ? message : "The PDF could not be processed. Check that the file opens and has no password protection.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={run} className="space-y-4">
        <label className="block font-semibold">
          {mode === "merge" ? "Select 2 to 10 PDF files" : "Select a PDF file"}
          <input type="file" accept=".pdf,application/pdf" multiple={mode === "merge"} disabled={busy} onChange={event => {
            setFiles(Array.from(event.target.files ?? []));
            setResults([]);
            setError("");
          }} className={`mt-1 ${fieldClass}`} />
        </label>
        {mode === "merge" && files.length > 0 && (
          <div>
            <p className="text-sm font-semibold">File order</p>
            <ol className="list-decimal space-y-2 pl-5">
              {files.map((file, index) => (
                <li key={index} className="break-all text-sm">
                  {file.name}{" "}
                  <button type="button" aria-label={`Move ${file.name} up`} className="ml-2 underline disabled:opacity-50" disabled={index === 0 || busy} onClick={() => {
                    setFiles(current => {
                      const reordered = [...current];
                      [reordered[index - 1], reordered[index]] = [reordered[index], reordered[index - 1]];
                      return reordered;
                    });
                    setResults([]);
                  }}>Move up</button>
                </li>
              ))}
            </ol>
          </div>
        )}
        {mode !== "merge" && (
          <label className="block font-semibold">
            Pages (e.g. 1, 3-5)
            <input value={pages} onChange={event => { setPages(event.target.value); setResults([]); }} maxLength={2000} disabled={busy} required className={`mt-1 ${fieldClass}`} />
          </label>
        )}
        {mode === "rotate" && (
          <label className="block font-semibold">
            Clockwise rotation
            <select value={angle} onChange={event => { setAngle(Number(event.target.value)); setResults([]); }} disabled={busy} className={`mt-1 ${fieldClass}`}>
              {[90, 180, 270].map(value => <option key={value} value={value}>{value}°</option>)}
            </select>
          </label>
        )}
        <p className="text-sm">Files stay in your browser. Maximum 50 MB total.{mode === "jpg" && " Convert up to 10 pages at a time."}</p>
        <button disabled={!files.length || busy} className={buttonClass}>{busy ? "Working…" : action}</button>
      </form>
      {error && <p role="alert" className="text-red-700">{error}</p>}
      {results.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {results.map(result => <button key={result.name} type="button" className={buttonClass} onClick={() => downloadFile(result.blob, result.name)}>Download {result.name}</button>)}
        </div>
      )}
    </div>
  );
}
