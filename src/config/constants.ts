// ─── Hardcoded auth credentials ───────────────────────────────────────────────
// Per the project spec, there is no real security requirement.
// These are defined in one place so they are easy to find and change.
export const HARDCODED_CREDENTIALS = {
  username: "steamuser",
  password: "is542demo",
} as const;

// ─── Steam API parameters ─────────────────────────────────────────────────────
/** Number of news items to retrieve per request. */
export const NEWS_COUNT = 10;

/** Maximum number of achievements to display. */
export const MAX_ACHIEVEMENTS = 200;
