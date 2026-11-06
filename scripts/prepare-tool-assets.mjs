import { cp, mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const pdf = dirname(require.resolve("pdfjs-dist/package.json"));
const ocr = dirname(require.resolve("tesseract.js/package.json"));
const core = dirname(require.resolve("tesseract.js-core/package.json", { paths: [ocr] }));
const english = dirname(require.resolve("@tesseract.js-data/eng/package.json"));

const assets = [
  ["pdf/pdf.worker.min.mjs", join(pdf, "build/pdf.worker.min.mjs")],
  ["pdf/wasm", join(pdf, "wasm")],
  ["pdf/cmaps", join(pdf, "cmaps")],
  ["pdf/standard_fonts", join(pdf, "standard_fonts")],
  ["pdf/iccs", join(pdf, "iccs")],
  ["pdf/LICENSE", join(pdf, "LICENSE")],
  ["ocr/worker.min.js", join(ocr, "dist/worker.min.js")],
  ["ocr/tesseract-core-lstm.wasm.js", join(core, "tesseract-core-lstm.wasm.js")],
  ["ocr/eng.traineddata.gz", join(english, "4.0.0_best_int/eng.traineddata.gz")],
  ["ocr/LICENSE", join(ocr, "LICENSE.md")],
];

await Promise.all(assets.map(async ([target, source]) => {
  const destination = join("public/tool-assets", target);
  await mkdir(dirname(destination), { recursive: true });
  await cp(source, destination, { recursive: true });
}));
