"use client";

import { useState } from "react";
import { buttonClass, fieldClass, TextResult } from "./UtilityControls";

const sitemapNamespace = "http://www.sitemaps.org/schemas/sitemap/0.9";

function publicHttpUrl(input: string) {
  const url = new URL(input);
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || url.hash) {
    throw new Error("Enter a full HTTP or HTTPS URL without credentials or a fragment.");
  }
  return url;
}

function xmlEscape(text: string) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

function robots(rules: string, sitemap: string) {
  let hasAgent = false;
  const lines = rules.trim().split(/\r?\n/);
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    const value = line.split("#", 1)[0].trim();
    if (!value) continue;
    if (/^User-agent:\s*(?:\*|[\w-]+)$/i.test(value)) {
      hasAgent = true;
    } else if (!(hasAgent && /^(?:Allow|Disallow):\s*(?:\/\S*)?$/i.test(value))) {
      throw new Error(`Check line ${index + 1}. Use a User-agent group followed by Allow or Disallow paths.`);
    }
  }
  if (!hasAgent) throw new Error("Add at least one User-agent group.");
  return `${lines.join("\n")}${sitemap ? `\n\nSitemap: ${publicHttpUrl(sitemap).href}` : ""}\n`;
}

function sitemapXml(input: string) {
  const entries = input.trim().split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  if (!entries.length || entries.length > 5000) throw new Error("Enter between 1 and 5,000 URLs.");
  const urls = entries.map((entry, index) => {
    try {
      const url = publicHttpUrl(entry);
      if (url.href.length >= 2048) throw new Error("URL too long");
      return url;
    } catch {
      throw new Error(`Line ${index + 1} must contain a full HTTP or HTTPS URL under 2,048 characters, without a fragment.`);
    }
  });
  if (urls.some(url => url.origin !== urls[0].origin)) {
    throw new Error("All URLs must use the same protocol, hostname and port.");
  }
  const locations = Array.from(new Set(urls.map(url => url.href)));
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="${sitemapNamespace}">\n${locations.map(url => `  <url><loc>${xmlEscape(url)}</loc></url>`).join("\n")}\n</urlset>\n`;
}

export default function TextUtility({ mode }: { mode: "robots" | "sitemap" | "json" | "html" }) {
  const [input, setInput] = useState(mode === "robots" ? "User-agent: *\nDisallow:" : "");
  const [sitemap, setSitemap] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const label = { robots: "Crawler rules", sitemap: "Page URLs (one per line)", json: "JSON input", html: "HTML source" }[mode];
  const filename = { robots: "robots.txt", sitemap: "sitemap.xml", json: "formatted.json", html: "" }[mode];

  function generate() {
    setResult("");
    setError("");
    try {
      if (!input.trim()) throw new Error("Enter something to process.");
      if (input.length > 1_000_000) throw new Error("Input is too large for this tool.");
      if (mode === "robots") setResult(robots(input, sitemap.trim()));
      else if (mode === "sitemap") setResult(sitemapXml(input));
      else if (mode === "json") {
        JSON.parse(input);
        setResult(formatJson(input));
      } else setResult(safePreview(input));
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "The input could not be processed.");
    }
  }

  return (
    <div className="space-y-4">
      <form className="space-y-4" onSubmit={event => { event.preventDefault(); generate(); }}>
        <label className="block font-semibold">
          {label}
          <textarea rows={8} value={input} onChange={event => setInput(event.target.value)} spellCheck={false} className={`mt-1 font-mono text-sm ${fieldClass}`} />
        </label>
        {mode === "robots" && (
          <label className="block font-semibold">
            Sitemap URL (optional)
            <input type="url" value={sitemap} onChange={event => setSitemap(event.target.value)} placeholder="https://example.com/sitemap.xml" className={`mt-1 ${fieldClass}`} />
          </label>
        )}
        <button className={buttonClass}>{mode === "html" ? "Preview HTML" : mode === "json" ? "Format JSON" : "Generate"}</button>
      </form>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      {result && (mode === "html" ? (
        <div>
          <p className="mb-2 text-sm">Scripts, forms and external resources are disabled in this preview.</p>
          <iframe
            title="HTML preview"
            sandbox=""
            referrerPolicy="no-referrer"
            srcDoc={`<!doctype html><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'">${result}`}
            className="h-96 w-full rounded-lg border border-slate-300 bg-white"
          />
        </div>
      ) : (
        <>
          <TextResult key={result} text={result} filename={filename} />
          {mode === "json" && result.length <= 20_000 && (
            <div className="overflow-auto rounded-lg border border-slate-300 bg-white p-3 font-mono text-sm text-brand-ink">
              <JsonBranch node={jsonTree(result)} />
            </div>
          )}
        </>
      ))}
    </div>
  );
}

function safePreview(input: string) {
  const markup = document.createElement("template");
  markup.innerHTML = input;
  markup.content.querySelectorAll("meta, base, link, script, iframe, object, embed, form, svg, math, template")
    .forEach(element => element.remove());
  markup.content.querySelectorAll("a, area").forEach(element => element.removeAttribute("href"));
  return markup.innerHTML || "<p>No displayable HTML was found.</p>";
}

interface JsonNode {
  label: string;
  value?: string;
  children?: JsonNode[];
}

function jsonTokens(input: string) {
  return input.match(/"(?:[^"\\]|\\.)*"|[{}\[\],:]|[^\s{}\[\],:]+/g) ?? [];
}

function jsonTree(input: string): JsonNode {
  const tokens = jsonTokens(input);
  let index = 0;

  function read(label: string): JsonNode {
    const token = tokens[index++];
    if (token !== "{" && token !== "[") return { label, value: token };
    const children: JsonNode[] = [];
    const closing = token === "{" ? "}" : "]";
    while (tokens[index] !== closing && index < tokens.length) {
      const key = token === "{" ? tokens[index] : String(children.length);
      if (token === "{") index += 2;
      children.push(read(key));
      if (tokens[index] === ",") index++;
    }
    index++;
    return { label, children };
  }

  return read("JSON tree");
}

function JsonBranch({ node }: { node: JsonNode }) {
  if (!node.children) return <span>{node.label}: {node.value}</span>;
  return (
    <details>
      <summary className="cursor-pointer">{node.label} ({node.children.length})</summary>
      <ul className="border-l border-slate-200 pl-3">
        {node.children.map((child, index) => <li key={index}><JsonBranch node={child} /></li>)}
      </ul>
    </details>
  );
}

// JSON.parse validates syntax. Keep the original tokens to preserve large integers and duplicate keys.
function formatJson(input: string) {
  const tokens = jsonTokens(input);
  const output: string[] = [];
  let depth = 0;
  let indentation = 0;
  const newline = () => {
    indentation += 1 + 2 * depth;
    if (indentation > 4_000_000) throw new Error("The formatted result is too large.");
    return "\n" + "  ".repeat(depth);
  };
  for (let index = 0; index < tokens.length; index++) {
    const token = tokens[index];
    const previous = tokens[index - 1];
    if (token === "}" || token === "]") {
      depth--;
      if (previous !== "{" && previous !== "[") output.push(newline());
      output.push(token);
    } else {
      output.push(token === ":" ? ": " : token);
      if (token === "{" || token === "[") {
        depth++;
        if (depth > 100) throw new Error("JSON is nested more than 100 levels deep.");
        if (tokens[index + 1] !== "}" && tokens[index + 1] !== "]") output.push(newline());
      } else if (token === ",") {
        output.push(newline());
      }
    }
  }
  const formatted = output.join("");
  if (formatted.length > 5_000_000) throw new Error("The formatted result is too large.");
  return formatted + "\n";
}
