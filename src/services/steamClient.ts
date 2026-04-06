import { ENV } from "../config/env";

/** A typed wrapper around a successful or failed fetch result. */
type FetchResult<T> = { ok: true; data: T } | { ok: false; error: string };

/**
 * Core fetch helper for all Steam API calls.
 * - Handles JSON parsing and HTTP error codes.
 * - Wraps with a CORS proxy URL when VITE_USE_CORS_PROXY=true.
 * - Never throws — always returns a discriminated union result.
 */
export async function steamFetch<T>(url: string): Promise<FetchResult<T>> {
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

    const data = (await response.json()) as T;
    return { ok: true, data };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Network error";
    return { ok: false, error: message };
  }
}
