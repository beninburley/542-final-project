// ─── Domain types ─────────────────────────────────────────────────────────────
// Migrated and extended from random.ts in the project root.
// These are the types used throughout the React app (pages, hooks, components).
// Raw Steam API response shapes live in types/api.ts.

/** A Steam game that the user searches for or selects. */
export type Game = {
  appId: number;
  title: string;
  iconUrl?: string;
  headerImageUrl?: string;
  description?: string;
};

/** One news entry returned by the Steam news API for a game. */
export type GameNewsItem = {
  id: string;
  appId: number;
  title: string;
  author?: string;
  url: string;
  contents: string;
  publishedAt: string; // ISO-8601 string
  feedLabel?: string;
};

/**
 * One achievement for a game with its global completion percentage.
 * NOTE: displayName and description require GetSchemaForGame (API key).
 * Without a key, displayName falls back to the raw internal name.
 */
export type Achievement = {
  name: string;
  displayName: string;
  description?: string;
  iconUrl?: string;
  iconGrayUrl?: string;
  percent: number;
  hidden: boolean;
};

/** A Steam user profile returned by GetPlayerSummaries. */
export type SteamProfile = {
  steamId: string;
  personaName: string;
  realName?: string;
  avatarUrl?: string;
  profileUrl?: string;
  countryCode?: string;
  stateCode?: string;
  visibilityState?: number;
  profileState?: number;
  lastLogOff?: string; // ISO-8601
  timeCreated?: string; // ISO-8601
};

/**
 * Discriminated union for the current auth state.
 * Managed by AuthContext; consumed throughout the app.
 */
export type AuthSession =
  | { status: "anonymous" }
  | { status: "authenticated"; username: string }
  | { status: "authError"; message: string };

/** Credentials submitted by the login form. */
export type LoginCredentials = {
  username: string;
  password: string;
};

// ─── Query types ──────────────────────────────────────────────────────────────

/** Input for game title / App ID search, shared by news and achievement pages. */
export type GameSearchQuery = {
  searchText: string;
  selectedAppId?: number;
};

/** Input for Steam profile lookup. */
export type UserSearchQuery = {
  steamId: string;
};

// ─── Result types ─────────────────────────────────────────────────────────────

/** Successful payload for the news search feature. */
export type NewsSearchResult = {
  selectedGame: Game;
  results: GameNewsItem[];
};

/** Successful payload for the achievement search feature. */
export type AchievementSearchResult = {
  selectedGame: Game;
  results: Achievement[];
  sortBy: "name" | "percent";
};

// ─── Async state pattern ──────────────────────────────────────────────────────

/**
 * A discriminated union that models four valid async states.
 * Prevents invalid combinations (e.g. having both data and an error).
 *
 * @template TQuery  The input that triggered the request.
 * @template TResult The shape of a successful response payload.
 */
export type RemoteData<TQuery, TResult> =
  | { status: "idle"; query: TQuery }
  | { status: "loading"; query: TQuery }
  | { status: "success"; query: TQuery; data: TResult }
  | { status: "error"; query: TQuery; message: string };

// ─── Feature-level state aliases ──────────────────────────────────────────────

/** State for the game search phase (returns a list of candidates). */
export type GameSearchState = RemoteData<GameSearchQuery, Game[]>;

/** State for the news search feature. */
export type NewsSearchState = RemoteData<GameSearchQuery, NewsSearchResult>;

/** State for the achievements feature. */
export type AchievementSearchState = RemoteData<
  GameSearchQuery,
  AchievementSearchResult
>;

/** State for the authenticated profile lookup. */
export type UserSearchState = RemoteData<UserSearchQuery, SteamProfile>;
