"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

interface TurnstileApi {
  render(
    container: HTMLElement,
    options: {
      sitekey: string;
      action: string;
      theme: "light";
      size: "flexible";
      callback: (token: string) => void;
      "expired-callback": () => void;
      "error-callback": () => void;
      "timeout-callback": () => void;
    }
  ): string | undefined;
  remove(widgetId: string): void;
}

interface TurnstileWidgetProps {
  action: string;
  onToken: (token: string) => void;
  resetKey: number;
}

function getTurnstile(): TurnstileApi | undefined {
  return (
    window as Window & {
      turnstile?: TurnstileApi;
    }
  ).turnstile;
}

const siteKey =
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ||
  (process.env.NODE_ENV === "development"
    ? "1x00000000000000000000AA"
    : "");

export function TurnstileWidget({
  action,
  onToken,
  resetKey,
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const callbackRef = useRef(onToken);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    callbackRef.current = onToken;
  }, [onToken]);

  useEffect(() => {
    if (!ready || !siteKey || !containerRef.current) {
      return;
    }

    const api = getTurnstile();

    if (!api) {
      setError("Verification could not load. Please reload the page.");
      return;
    }

    let active = true;
    callbackRef.current("");
    setError("");

    function invalidate(message: string) {
      if (!active) return;
      callbackRef.current("");
      setError(message);
    }

    const widgetId = api.render(containerRef.current, {
      sitekey: siteKey,
      action,
      theme: "light",
      size: "flexible",
      callback: (token) => {
        if (!active) return;
        setError("");
        callbackRef.current(token);
      },
      "expired-callback": () => {
        invalidate("Verification expired. Please retry verification.");
      },
      "error-callback": () => {
        invalidate("Verification failed. Please retry verification.");
      },
      "timeout-callback": () => {
        invalidate("Verification timed out. Please retry verification.");
      },
    });

    return () => {
      active = false;

      if (widgetId !== undefined) {
        api.remove(widgetId);
      }
    };
  }, [ready, action, resetKey, retry]);

  if (!siteKey) {
    return (
      <p role="alert" className="mt-4 text-sm text-red-700">
        Verification is temporarily unavailable. Please try again later.
      </p>
    );
  }

  return (
    <div className="mt-4">
      <Script
        id="cloudflare-turnstile"
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={() => setReady(true)}
        onError={() => {
          callbackRef.current("");
          setError("Verification could not load. Please reload the page.");
        }}
      />

      <div ref={containerRef} className="w-full max-w-sm" />

      {!ready && !error && (
        <p role="status" className="text-sm text-slate-600">
          Loading verification...
        </p>
      )}

      {error && (
        <div role="alert" className="mt-2 text-sm text-red-700">
          <p>{error}</p>
          {ready && (
            <button
              type="button"
              onClick={() => setRetry((value) => value + 1)}
              className="mt-2 font-semibold underline underline-offset-4"
            >
              Retry verification
            </button>
          )}
        </div>
      )}
    </div>
  );
}
