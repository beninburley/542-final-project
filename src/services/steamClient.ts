import { ENV } from "../config/env";

/**
 * Result of a raw HTTP fetch.
 * On success, `data` is `unknown` — callers must pass it through a DTO parser
 * (see dto.ts) before treating it as a known type.
 */
export type FetchResult =
  | { ok: true; data: unknown }
  | { ok: false; error: string };

/**
 * Core fetch helper for all Steam API calls.
 * - Handles JSON parsing and HTTP error codes.
 * - Wraps with a CORS proxy URL when VITE_USE_CORS_PROXY=true.
 * - Never throws — always returns a discriminated union result.
 * - Returns `data: unknown` intentionally; use a DTO parser to narrow the type.
 */
export async function steamFetch(url: string): Promise<FetchResult> {
  try {
    const requestUrl = ENV.useCorsProxy
      ? `${ENV.corsProxyUrl}${encodeURIComponent(url)}`
      : url;

    const response = await fetch(requestUrl);

    if (!response.ok) {
      return {
        ok: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    // Intentionally typed as unknown — DTO parsers in dto.ts validate the shape.
    const data: unknown = await response.json();
    return { ok: true, data };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Network error";
    return { ok: false, error: message };
  }
}
