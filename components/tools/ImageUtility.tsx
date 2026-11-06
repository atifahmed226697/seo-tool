"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { buttonClass, downloadFile, encodeCanvas, fieldClass, TextResult } from "./UtilityControls";

type Mode = "favicon" | "compress" | "convert" | "ocr";
type Format = "image/png" | "image/jpeg" | "image/webp";
type Result = { blob: Blob; name: string; width: number; height: number };

function makeCanvas(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Your browser could not create an image canvas.");
  return { canvas, context };
}

async function makeIcon(image: ImageBitmap) {
  const sizes = [16, 32, 48];
  const images = await Promise.all(sizes.map(size => {
    const { canvas, context } = makeCanvas(size, size);
    const scale = Math.min(size / image.width, size / image.height);
    const width = image.width * scale;
    const height = image.height * scale;
    context.drawImage(image, (size - width) / 2, (size - height) / 2, width, height);
    return encodeCanvas(canvas, "image/png");
  }));
  const header = new ArrayBuffer(6 + 16 * sizes.length);
  const view = new DataView(header);
  view.setUint16(2, 1, true);
  view.setUint16(4, sizes.length, true);
  let offset = header.byteLength;
  for (let index = 0; index < sizes.length; index++) {
    const size = sizes[index];
    const start = 6 + 16 * index;
    view.setUint8(start, size);
    view.setUint8(start + 1, size);
    view.setUint16(start + 4, 1, true);
    view.setUint16(start + 6, 32, true);
    view.setUint32(start + 8, images[index].size, true);
    view.setUint32(start + 12, offset, true);
    offset += images[index].size;
  }
  return { blob: new Blob([header, ...images], { type: "image/x-icon" }), name: "favicon.ico", width: 48, height: 48 };
}

async function convertImage(image: ImageBitmap, format: Format, quality: number, target: number) {
  let scale = 1;
  for (let pass = 0; pass < 6; pass++) {
    const width = Math.max(1, Math.floor(image.width * scale));
    const height = Math.max(1, Math.floor(image.height * scale));
    const { canvas, context } = makeCanvas(width, height);
    if (format === "image/jpeg") {
      context.fillStyle = "#fff";
      context.fillRect(0, 0, width, height);
    }
    context.drawImage(image, 0, 0, width, height);
    let blob = await encodeCanvas(canvas, format, quality);
    if (!target || blob.size <= target) return { blob, width, height };
    blob = await encodeCanvas(canvas, format, 0.35);
    if (blob.size <= target) {
      let low = 0.35;
      let high = quality;
      for (let step = 0; step < 6; step++) {
        const next = (low + high) / 2;
        const candidate = await encodeCanvas(canvas, format, next);
        if (candidate.size <= target) {
          blob = candidate;
          low = next;
        } else high = next;
      }
      return { blob, width, height };
    }
    scale *= Math.max(0.35, Math.min(0.85, Math.sqrt(target / blob.size) * 0.9));
  }
  throw new Error("The image could not fit the selected file size. Choose a larger target.");
}

export default function ImageUtility({ mode }: { mode: Mode }) {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<Format>(mode === "compress" ? "image/webp" : "image/png");
  const [target, setTarget] = useState("100");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [text, setText] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [preview, setPreview] = useState("");

  useEffect(() => {
    if (!result) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(result.blob);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [result]);

  async function run(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file || busy) return;
    setBusy(true);
    setError("");
    setResult(null);
    setText("");
    try {
      if (!["image/png", "image/jpeg", "image/webp"].includes(file.type) || file.size > 20 * 1024 * 1024) {
        throw new Error("Choose a JPG, PNG or WebP image up to 20 MB.");
      }
      const image = await createImageBitmap(file);
      try {
        if (image.width * image.height > 20_000_000) throw new Error("Choose an image under 20 megapixels.");
        if (mode === "ocr") {
          setProgress("Loading the English OCR model…");
          const { createWorker } = await import("tesseract.js");
          const { canvas, context } = makeCanvas(image.width, image.height);
          context.drawImage(image, 0, 0);
          const worker = await createWorker("eng", 1, {
            workerPath: "/tool-assets/ocr/worker.min.js",
            corePath: `${window.location.origin}/tool-assets/ocr/tesseract-core-lstm.wasm.js`,
            langPath: `${window.location.origin}/tool-assets/ocr`,
            workerBlobURL: false,
            logger: message => {
              if (message.status === "recognizing text") setProgress(`Recognizing text… ${Math.round(message.progress * 100)}%`);
            },
          });
          try {
            const recognized = (await worker.recognize(canvas)).data.text.trim();
            if (!recognized) throw new Error("No text was detected. Try a sharper image with larger text.");
            setText(recognized);
          } finally {
            await worker.terminate();
          }
        } else if (mode === "favicon") setResult(await makeIcon(image));
        else {
          const output = await convertImage(image, format, 0.9, mode === "compress" ? Number(target) * 1000 : 0);
          const extension = format === "image/jpeg" ? "jpg" : format.slice(6);
          setResult({ ...output, name: `${file.name.replace(/\.[^.]+$/, "")}-${mode === "compress" ? "compressed" : "converted"}.${extension}` });
        }
      } finally {
        image.close();
      }
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "The image could not be processed.");
    } finally {
      setBusy(false);
      setProgress("");
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={run} className="space-y-4">
        <label className="block font-semibold">
          Choose a JPG, PNG or WebP image
          <input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={event => {
            setFile(event.target.files?.[0] ?? null);
            setResult(null);
            setError("");
            setText("");
          }} className={`mt-1 ${fieldClass}`} />
        </label>
        {(mode === "compress" || mode === "convert") && (
          <label className="block font-semibold">
            Output format
            <select value={format} onChange={event => { setFormat(event.target.value as Format); setResult(null); }} disabled={busy} className={`mt-1 ${fieldClass}`}>
              {mode === "convert" && <option value="image/png">PNG</option>}
              <option value="image/webp">WebP</option>
              <option value="image/jpeg">JPG (white background)</option>
            </select>
          </label>
        )}
        {mode === "compress" && (
          <label className="block font-semibold">
            Maximum file size
            <select value={target} onChange={event => { setTarget(event.target.value); setResult(null); }} disabled={busy} className={`mt-1 ${fieldClass}`}>
              {[50, 100, 200, 500, 1000].map(kb => <option key={kb} value={kb}>{kb} KB</option>)}
            </select>
          </label>
        )}
        {mode === "ocr" && <p className="text-sm">English OCR. The first run downloads the recognition model. Your image is processed in your browser.</p>}
        <button disabled={!file || busy} className={buttonClass}>{busy ? "Working…" : { favicon: "Generate favicon", compress: "Compress image", convert: "Convert image", ocr: "Extract text" }[mode]}</button>
      </form>
      {progress && <p role="status">{progress}</p>}
      {error && <p role="alert" className="text-red-700">{error}</p>}
      {text && <TextResult key={text} text={text} filename="extracted-text.txt" />}
      {result && (
        <div className="space-y-3">
          {preview && <img src={preview} alt="Processed image preview" className="max-h-48 max-w-full rounded bg-white object-contain" />}
          <p role="status" className="text-sm">{((file?.size ?? 0) / 1000).toFixed(1)} KB → {(result.blob.size / 1000).toFixed(1)} KB · {mode === "favicon" ? "16, 32 and 48 px" : `${result.width} × ${result.height} px`}</p>
          <button type="button" className={buttonClass} onClick={() => downloadFile(result.blob, result.name)}>Download {result.name}</button>
        </div>
      )}
    </div>
  );
}
