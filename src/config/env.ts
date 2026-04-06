// ─── Environment variable access ─────────────────────────────────────────────
// All import.meta.env reads are centralised here so the rest of the app
// never touches import.meta.env directly.

export const ENV = {
  /** Steam Web API key — required for authenticated profile lookups only. */
  steamApiKey: import.meta.env.VITE_STEAM_API_KEY as string | undefined,

  /**
   * When true the service layer wraps Steam API URLs with a CORS proxy.
   * Needed for production / GitHub Pages builds.
   * In development the Vite proxy handles CORS instead.
   */
  useCorsProxy: import.meta.env.VITE_USE_CORS_PROXY === "true",

  /** Base URL of the CORS proxy to prepend, e.g. "https://corsproxy.io/?" */
  corsProxyUrl:
    (import.meta.env.VITE_CORS_PROXY_URL as string | undefined) ??
    "https://corsproxy.io/?",
} as const;

// ─── Steam API base paths ─────────────────────────────────────────────────────
// In development: relative paths (/steam-api/...) are handled by Vite proxy.
// In production with CORS proxy: full https URLs are used and then wrapped.

export const STEAM_API_BASE: string = ENV.useCorsProxy
  ? "https://api.steampowered.com"
  : "/steam-api";

export const STEAM_STORE_BASE: string = ENV.useCorsProxy
  ? "https://store.steampowered.com"
  : "/steam-store";
