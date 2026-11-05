const TEST_SECRET = "1x0000000000000000000000000000000AA";
const VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

type VerificationResult =
  | { success: true }
  | {
      success: false;
      status: 403 | 503;
      code: string;
      error: string;
    };

interface SiteverifyResponse {
  success?: boolean;
  hostname?: string;
  action?: string;
}

/** Verify a challenge before running an external tool lookup. */
export async function verifyTurnstile(
  token: unknown,
  expectedAction: string
): Promise<VerificationResult> {
  if (
    typeof token !== "string" ||
    !token.trim() ||
    token.length > 2048
  ) {
    return {
      success: false,
      status: 403,
      code: "verification_required",
      error: "Please complete the verification and try again.",
    };
  }

  const production = process.env.NODE_ENV === "production";
  const secret =
    process.env.TURNSTILE_SECRET_KEY?.trim() ||
    (production ? "" : TEST_SECRET);

  const testSecret = /^[123]x0+AA$/.test(secret);

  const allowedHosts = (
    process.env.TURNSTILE_ALLOWED_HOSTNAMES || ""
  )
    .split(",")
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean);

  if (!secret || (production && (testSecret || !allowedHosts.length))) {
    return {
      success: false,
      status: 503,
      code: "verification_unavailable",
      error: "Verification is temporarily unavailable. Please try again later.",
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret,
        response: token,
      }),
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Verification service failed.");
    }

    const data = (await response.json()) as SiteverifyResponse;

    if (data.success !== true) {
      return {
        success: false,
        status: 403,
        code: "verification_failed",
        error: "Verification expired or failed. Please verify again.",
      };
    }

    // Test keys return fixed action and hostname values.
    if (!testSecret) {
      const hostname = data.hostname?.toLowerCase();

      if (
        data.action !== expectedAction ||
        (allowedHosts.length > 0 &&
          (!hostname || !allowedHosts.includes(hostname)))
      ) {
        return {
          success: false,
          status: 403,
          code: "verification_failed",
          error: "Verification failed. Please reload the page and try again.",
        };
      }
    }

    return { success: true };
  } catch {
    return {
      success: false,
      status: 503,
      code: "verification_unavailable",
      error: "Verification is temporarily unavailable. Please try again later.",
    };
  } finally {
    clearTimeout(timeout);
  }
}
