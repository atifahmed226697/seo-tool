import dns from "dns";
import net from "net";

const MAX_RESPONSE_BYTES = 2 * 1024 * 1024; // 2 Megabytes
const DEFAULT_TIMEOUT_MS = 5000; // 5 Seconds

/**
 * Checks whether an IPv4 address belongs to a private, loopback, link-local, or reserved subnet.
 */
export function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split(".").map((n) => parseInt(n, 10));
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
    return true; // Malformed is treated as unsafe
  }

  const [a, b] = parts;

  // 0.0.0.0/8 (Broadcast/Default)
  if (a === 0) return true;

  // 10.0.0.0/8 (Private network)
  if (a === 10) return true;

  // 127.0.0.0/8 (Loopback / localhost)
  if (a === 127) return true;

  // 169.254.0.0/16 (Link-local / Cloud metadata e.g. AWS/GCP 169.254.169.254)
  if (a === 169 && b === 254) return true;

  // 172.16.0.0/12 (Private network: 172.16.0.0 – 172.31.255.255)
  if (a === 172 && b >= 16 && b <= 31) return true;

  // 192.168.0.0/16 (Private network)
  if (a === 192 && b === 168) return true;

  // 100.64.0.0/10 (Shared Address Space / CGNAT)
  if (a === 100 && b >= 64 && b <= 127) return true;

  // 255.255.255.255 (Broadcast)
  if (a === 255 && b === 255) return true;

  return false;
}

/**
 * Checks whether an IPv6 address belongs to loopback, link-local, unique-local, or IPv4-mapped private.
 */
export function isPrivateIPv6(ip: string): boolean {
  const normalized = ip.toLowerCase();

  // ::1 Loopback
  if (normalized === "::1" || normalized === "0:0:0:0:0:0:0:1") return true;

  // :: Unspecified
  if (normalized === "::" || normalized === "0:0:0:0:0:0:0:0") return true;

  // IPv4-mapped IPv6 (e.g. ::ffff:127.0.0.1 or ::ffff:7f00:1)
  if (normalized.startsWith("::ffff:")) {
    const v4Part = normalized.replace("::ffff:", "");
    if (net.isIPv4(v4Part)) {
      return isPrivateIPv4(v4Part);
    }
  }

  // fe80::/10 (Link-Local)
  if (normalized.startsWith("fe8") || normalized.startsWith("fe9") || normalized.startsWith("fea") || normalized.startsWith("feb")) {
    return true;
  }

  // fc00::/7 (Unique Local Address - private)
  if (normalized.startsWith("fc") || normalized.startsWith("fd")) {
    return true;
  }

  return false;
}

/**
 * Verifies that an IP string is public and safe to request.
 */
export function isPrivateOrInternalIp(ip: string): boolean {
  if (net.isIPv4(ip)) {
    return isPrivateIPv4(ip);
  }
  if (net.isIPv6(ip)) {
    return isPrivateIPv6(ip);
  }
  return true; // If not valid IPv4/IPv6, block
}

/**
 * Validates a target URL against SSRF vulnerabilities:
 * 1. Requires http or https protocol.
 * 2. Blocks localhost, 0.0.0.0, internal hostnames.
 * 3. Resolves DNS records and verifies ALL resolved IPs are public.
 */
export async function validateUrlForSsrf(rawUrl: string): Promise<URL> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error("Invalid URL format.");
  }

  // Protocol check
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Only HTTP and HTTPS protocols are allowed.");
  }

  const hostname = parsed.hostname.toLowerCase();

  // Hostname string checks
  if (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal") ||
    hostname === "0.0.0.0" ||
    hostname === "127.0.0.1" ||
    hostname === "::1"
  ) {
    throw new Error("Target destination is restricted for security reasons.");
  }

  // If hostname is directly an IP address
  if (net.isIP(hostname)) {
    if (isPrivateOrInternalIp(hostname)) {
      throw new Error("Target destination is restricted for security reasons.");
    }
    return parsed;
  }

  // Resolve DNS to verify all destination IPs
  try {
    const addresses = await dns.promises.lookup(hostname, { all: true });
    if (!addresses || addresses.length === 0) {
      throw new Error("Unable to resolve destination domain.");
    }

    for (const record of addresses) {
      if (isPrivateOrInternalIp(record.address)) {
        throw new Error("Target destination resolves to a restricted internal network.");
      }
    }
  } catch (err: any) {
    if (err.message && err.message.includes("restricted")) {
      throw err;
    }
    throw new Error("Failed to resolve target domain DNS.");
  }

  return parsed;
}

/**
 * Safely fetches an external URL with:
 * - Strict SSRF DNS validation
 * - 5-second timeout
 * - 2MB max response buffer
 * - Generic error masking
 */
export async function safeFetchHtml(
  rawUrl: string,
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
  maxBytes: number = MAX_RESPONSE_BYTES
): Promise<string> {
  // 1. SSRF check
  const validatedUrl = await validateUrlForSsrf(rawUrl);

  // 2. Fetch with AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(validatedUrl.toString(), {
      method: "GET",
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 (SEOToolkit/1.0)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
    });

    if (!response.ok) {
      throw new Error(`Target returned HTTP status ${response.status}`);
    }

    // Check Content-Length header if provided
    const contentLength = response.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > maxBytes) {
      throw new Error("Page response size exceeds the 2MB safety limit.");
    }

    // Read response body as stream to enforce 2MB limit
    if (!response.body) {
      return await response.text();
    }

    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let receivedBytes = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      if (value) {
        receivedBytes += value.length;
        if (receivedBytes > maxBytes) {
          controller.abort();
          throw new Error("Page response size exceeds the 2MB safety limit.");
        }
        chunks.push(value);
      }
    }

    // Concatenate chunks and decode as UTF-8
    const totalBuffer = new Uint8Array(receivedBytes);
    let offset = 0;
    for (const chunk of chunks) {
      totalBuffer.set(chunk, offset);
      offset += chunk.length;
    }

    return new TextDecoder("utf-8").decode(totalBuffer);
  } catch (err: any) {
    if (err.name === "AbortError") {
      throw new Error("Target server took too long to respond (timeout after 5 seconds).");
    }
    // Retain clean, generic message without leaking internals
    throw new Error(err.message || "Failed to fetch webpage content.");
  } finally {
    clearTimeout(timeoutId);
  }
}
