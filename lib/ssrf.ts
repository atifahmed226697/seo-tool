import dns from "dns";
import net from "net";
import http from "http";
import https from "https";
import { createBrotliDecompress, createUnzip } from "zlib";

const MAX_RESPONSE_BYTES = 2 * 1024 * 1024;
const DEFAULT_TIMEOUT_MS = 5000;
const MAX_REDIRECTS = 5;
const REDIRECT_CODES = new Set([301, 302, 303, 307, 308]);

const RESTRICTED_MESSAGE =
  "Target destination is restricted for security reasons.";

const blockedIPv4 = new net.BlockList();

const blockedIPv4Ranges: [string, number][] = [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.0.2.0", 24],
  ["192.88.99.0", 24],
  ["192.168.0.0", 16],
  ["198.18.0.0", 15],
  ["198.51.100.0", 24],
  ["203.0.113.0", 24],
  ["224.0.0.0", 4],
  ["240.0.0.0", 4],
];

for (const [address, prefix] of blockedIPv4Ranges) {
  blockedIPv4.addSubnet(address, prefix, "ipv4");
}

const publicIPv6 = new net.BlockList();
publicIPv6.addSubnet("2000::", 3, "ipv6");

const mappedIPv6 = new net.BlockList();
mappedIPv6.addSubnet("::ffff:0:0", 96, "ipv6");

const blockedIPv6 = new net.BlockList();
blockedIPv6.addSubnet("2001::", 23, "ipv6");
blockedIPv6.addSubnet("2001:db8::", 32, "ipv6");
blockedIPv6.addSubnet("2002::", 16, "ipv6");
blockedIPv6.addSubnet("3fff::", 20, "ipv6");

export function isPrivateIPv4(ip: string): boolean {
  return !net.isIPv4(ip) || blockedIPv4.check(ip, "ipv4");
}

export function isPrivateIPv6(ip: string): boolean {
  if (!net.isIPv6(ip)) {
    return true;
  }

  if (mappedIPv6.check(ip, "ipv6")) {
    return blockedIPv4.check(ip, "ipv6");
  }

  return (
    !publicIPv6.check(ip, "ipv6") ||
    blockedIPv6.check(ip, "ipv6")
  );
}

export function isPrivateOrInternalIp(ip: string): boolean {
  if (net.isIPv4(ip)) {
    return isPrivateIPv4(ip);
  }

  if (net.isIPv6(ip)) {
    return isPrivateIPv6(ip);
  }

  return true;
}

function parseTarget(rawUrl: string): URL {
  let url: URL;

  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error("Invalid URL format.");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Only HTTP and HTTPS protocols are allowed.");
  }

  if (url.username || url.password) {
    throw new Error(RESTRICTED_MESSAGE);
  }

  const hostname = url.hostname
    .replace(/^\[|\]$/g, "")
    .toLowerCase()
    .replace(/\.$/, "");

  if (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal") ||
    (!net.isIP(hostname) && !hostname.includes("."))
  ) {
    throw new Error(RESTRICTED_MESSAGE);
  }

  return url;
}

async function resolveTarget(
  rawUrl: string,
  signal: AbortSignal
) {
  const url = parseTarget(rawUrl);
  const hostname = url.hostname.replace(/^\[|\]$/g, "");

  signal.throwIfAborted();

  let addresses: dns.LookupAddress[];

  if (net.isIP(hostname)) {
    addresses = [
      {
        address: hostname,
        family: net.isIP(hostname),
      },
    ];
  } else {
    addresses = await new Promise<dns.LookupAddress[]>(
      (resolve, reject) => {
        const onAbort = () => {
          reject(new Error("Request timed out."));
        };

        signal.addEventListener("abort", onAbort, { once: true });

        dns.promises.lookup(hostname, { all: true }).then(
          (records) => {
            signal.removeEventListener("abort", onAbort);
            resolve(records);
          },
          () => {
            signal.removeEventListener("abort", onAbort);
            reject(new Error("Failed to resolve target domain DNS."));
          }
        );
      }
    );
  }

  signal.throwIfAborted();

  if (
    addresses.length === 0 ||
    addresses.some((record) =>
      isPrivateOrInternalIp(record.address)
    )
  ) {
    throw new Error(RESTRICTED_MESSAGE);
  }

  // Prefer IPv4 when outbound IPv6 connectivity is unavailable.
  const address =
    addresses.find((record) => record.family === 4) ||
    addresses[0];

  return { url, hostname, address };
}

export async function validateUrlForSsrf(
  rawUrl: string
): Promise<URL> {
  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(),
    DEFAULT_TIMEOUT_MS
  );

  try {
    return (await resolveTarget(rawUrl, controller.signal)).url;
  } finally {
    clearTimeout(timer);
  }
}

interface TargetResponse {
  status: number;
  location?: string;
  html: string;
}

async function requestTarget(
  rawUrl: string,
  method: "GET" | "HEAD",
  readBody: boolean,
  maxBytes: number,
  signal: AbortSignal
): Promise<TargetResponse> {
  const { url, hostname, address } = await resolveTarget(
    rawUrl,
    signal
  );

  const request =
    url.protocol === "https:" ? https.request : http.request;

  return new Promise((resolve, reject) => {
    const req = request(
      {
        protocol: url.protocol,
        hostname: address.address,
        family: address.family,
        port: url.port || undefined,
        path: url.pathname + url.search,
        method,
        agent: false,
        servername: net.isIP(hostname) ? undefined : hostname,
        signal,
        headers: {
          Host: url.host,
          "User-Agent":
            "Mozilla/5.0 (compatible; SEOToolkit/1.0)",
          Accept: "text/html,application/xhtml+xml,*/*;q=0.8",
          "Accept-Encoding": "gzip, deflate, br",
          "Accept-Language": "en-US,en;q=0.5",
        },
      },
      (res) => {
        const status = res.statusCode || 0;
        const location = res.headers.location;

        res.once("error", reject);

        if (
          !readBody ||
          REDIRECT_CODES.has(status) ||
          status < 200 ||
          status >= 300
        ) {
          resolve({ status, location, html: "" });
          res.destroy();
          return;
        }

        const tooLarge = () => {
          reject(
            new Error(
              "Page response exceeds the configured size limit."
            )
          );
          res.destroy();
          req.destroy();
        };

        if (Number(res.headers["content-length"]) > maxBytes) {
          tooLarge();
          return;
        }

        const encoding = String(
          res.headers["content-encoding"] || "identity"
        ).toLowerCase();

        if (
          !["identity", "gzip", "deflate", "br"].includes(encoding)
        ) {
          reject(
            new Error(
              "The page uses an unsupported content encoding."
            )
          );
          res.destroy();
          return;
        }

        let decoder = null;

        if (encoding === "br") {
          decoder = createBrotliDecompress();
        } else if (encoding === "gzip" || encoding === "deflate") {
          decoder = createUnzip();
        }

        const stream = decoder ? res.pipe(decoder) : res;

        res.once("aborted", () => {
          decoder?.destroy();
          reject(new Error("The page response was interrupted."));
        });

        stream.once("error", reject);

        let wireBytes = 0;

        res.on("data", (chunk: Buffer) => {
          wireBytes += chunk.length;

          if (wireBytes > maxBytes) {
            tooLarge();
          }
        });

        const chunks: Buffer[] = [];
        let bytes = 0;

        stream.on("data", (chunk: Buffer) => {
          bytes += chunk.length;

          if (bytes > maxBytes) {
            tooLarge();
            decoder?.destroy();
            return;
          }

          chunks.push(chunk);
        });

        stream.once("end", () => {
          resolve({
            status,
            html: Buffer.concat(chunks, bytes).toString("utf8"),
          });
        });
      }
    );

    req.once("error", reject);
    req.end();
  });
}

async function followTarget(
  rawUrl: string,
  method: "GET" | "HEAD",
  readBody: boolean,
  maxBytes: number,
  signal: AbortSignal
): Promise<TargetResponse> {
  let current = rawUrl;

  for (
    let redirects = 0;
    redirects <= MAX_REDIRECTS;
    redirects += 1
  ) {
    const result = await requestTarget(
      current,
      method,
      readBody,
      maxBytes,
      signal
    );

    if (
      !REDIRECT_CODES.has(result.status) ||
      !result.location
    ) {
      return result;
    }

    if (redirects === MAX_REDIRECTS) {
      throw new Error("Too many page redirects.");
    }

    current = new URL(result.location, current).href;
  }

  throw new Error("Too many page redirects.");
}

export async function safeFetchHtml(
  rawUrl: string,
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
  maxBytes: number = MAX_RESPONSE_BYTES
): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const result = await followTarget(
      rawUrl,
      "GET",
      true,
      maxBytes,
      controller.signal
    );

    if (result.status < 200 || result.status >= 300) {
      throw new Error(
        `Target returned HTTP status ${result.status}`
      );
    }

    return result.html;
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error("Target server took too long to respond.");
    }

    throw error instanceof Error
      ? error
      : new Error("Failed to fetch webpage content.");
  } finally {
    clearTimeout(timer);
  }
}

/** Check a link through validated connections and redirects. */
export async function safeCheckLink(
  rawUrl: string,
  timeoutMs = 4000
): Promise<number> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    let result = await followTarget(
      rawUrl,
      "HEAD",
      false,
      0,
      controller.signal
    );

    if (result.status === 405 || result.status === 403) {
      result = await followTarget(
        rawUrl,
        "GET",
        false,
        0,
        controller.signal
      );
    }

    return result.status;
  } catch {
    return 0;
  } finally {
    clearTimeout(timer);
  }
}