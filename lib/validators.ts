/**
 * Shared validation and normalization helpers for domains and URLs.
 */

/**
 * Normalizes a raw user input into a clean root domain or subdomain.
 * Strips http/https protocols, www prefix, path segments, ports, and query parameters.
 * Example: "https://www.example.com:8080/path/test?q=1" -> "example.com"
 */
export function cleanDomain(input: string): string {
  if (!input) return "";

  let cleaned = input.trim().toLowerCase();

  // Strip leading protocol if present
  cleaned = cleaned.replace(/^[a-zA-Z]+:\/\//, "");

  // Strip leading www.
  cleaned = cleaned.replace(/^www\./, "");

  // Remove paths, query strings, and fragments
  cleaned = cleaned.split("/")[0];
  cleaned = cleaned.split("?")[0];
  cleaned = cleaned.split("#")[0];

  // Remove port numbers if present (e.g., example.com:3000)
  cleaned = cleaned.split(":")[0];

  return cleaned.trim();
}

/**
 * Validates domain name syntax against RFC standards.
 * Ensures valid label lengths, permissible characters, and a valid TLD.
 */
export function isValidDomain(domain: string): boolean {
  if (!domain || domain.length > 253) return false;

  // Domain regex: labels 1-63 chars, letters/numbers/hyphens, valid TLD of at least 2 chars
  const domainRegex =
    /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,63}$/;

  return domainRegex.test(domain);
}

/**
 * Validates whether an input is a well-formed HTTP or HTTPS URL.
 */
export function isValidHttpUrl(input: string): boolean {
  if (!input) return false;
  try {
    const parsed = new URL(input.trim());
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Normalizes a URL input, automatically adding https:// if the user omitted a protocol.
 */
export function normalizeHttpUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}
