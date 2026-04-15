/**
 * DTO (Data Transfer Object) parsers — runtime validation for Steam API responses.
 *
 * Every parser accepts `unknown` (the raw JSON.parse output) and returns a
 * ParseResult discriminated union.  On success, `data` is the narrowed,
 * fully-typed value.  On failure, `error` describes what was wrong.
 *
 * This decouples the app from silent assumptions about API response shapes:
 *   - Malformed responses produce a clear error instead of a runtime crash.
 *   - TypeScript types downstream are grounded in runtime-verified data.
 *
 * Strategy for array items: filter out invalid elements rather than failing
 * the entire parse.  This keeps the page functional if one entry is malformed.
 */

import type {
  SteamStoreSearchResponse,
  SteamAppDetailsResponse,
  SteamNewsResponse,
  SteamAchievementPercentagesResponse,
  SteamSchemaResponse,
  SteamPlayerSummariesResponse,
} from "../types/api";

/** Success or failure result of parsing an unknown API payload. */
export type ParseResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

// ─── Primitive guards ──────────────────────────────────────────────────────

function isObj(val: unknown): val is Record<string, unknown> {
  return typeof val === "object" && val !== null && !Array.isArray(val);
}

function isArr(val: unknown): val is unknown[] {
  return Array.isArray(val);
}

// ─── Steam Store: /api/storesearch ────────────────────────────────────────

/**
 * Parses the response from store.steampowered.com/api/storesearch.
 * Requires top-level `items` array; filters out any element missing `id` or `name`.
 */
export function parseStoreSearch(
  raw: unknown,
): ParseResult<SteamStoreSearchResponse> {
  if (!isObj(raw) || !isArr(raw.items)) {
    return {
      ok: false,
      error: "Missing or invalid `items` array in store search response",
    };
  }

  const items = raw.items.flatMap((item) => {
    if (
      !isObj(item) ||
      typeof item.id !== "number" ||
      typeof item.name !== "string"
    ) {
      return [];
    }
    return [
      {
        id: item.id,
        type: typeof item.type === "string" ? item.type : "",
        name: item.name,
        tiny_image: typeof item.tiny_image === "string" ? item.tiny_image : "",
        streamingvideo:
          typeof item.streamingvideo === "boolean"
            ? item.streamingvideo
            : undefined,
      },
    ];
  });

  return {
    ok: true,
    data: {
      total: typeof raw.total === "number" ? raw.total : items.length,
      items,
    },
  };
}

// ─── Steam Store: /api/appdetails ─────────────────────────────────────────

/**
 * Parses the response from store.steampowered.com/api/appdetails.
 * The API returns a Record keyed by App ID; each entry has a `success` flag.
 */
export function parseAppDetails(
  raw: unknown,
): ParseResult<SteamAppDetailsResponse> {
  if (!isObj(raw)) {
    return { ok: false, error: "Expected an object from appdetails response" };
  }

  const result: SteamAppDetailsResponse = {};

  for (const [key, entry] of Object.entries(raw)) {
    if (!isObj(entry) || typeof entry.success !== "boolean") continue;

    if (!entry.success || !isObj(entry.data)) {
      result[key] = { success: entry.success };
      continue;
    }

    const d = entry.data;
    result[key] = {
      success: true,
      data: {
        type: typeof d.type === "string" ? d.type : "",
        name: typeof d.name === "string" ? d.name : "",
        steam_appid: typeof d.steam_appid === "number" ? d.steam_appid : 0,
        short_description:
          typeof d.short_description === "string"
            ? d.short_description
            : undefined,
        header_image:
          typeof d.header_image === "string" ? d.header_image : undefined,
      },
    };
  }

  return { ok: true, data: result };
}

// ─── Steam Web API: ISteamNews/GetNewsForApp ───────────────────────────────

/**
 * Parses the response from ISteamNews/GetNewsForApp/v0002.
 * Fails if `appnews.newsitems` is missing; filters items without `gid` or `title`.
 */
export function parseNewsResponse(
  raw: unknown,
): ParseResult<SteamNewsResponse> {
  if (!isObj(raw) || !isObj(raw.appnews) || !isArr(raw.appnews.newsitems)) {
    return {
      ok: false,
      error: "Missing `appnews.newsitems` array in news response",
    };
  }

  const appnews = raw.appnews;
  // Capture newsitems via the narrowed path before TypeScript loses track
  // of the isArr() narrowing through the cached `appnews` variable.
  const rawNewsitems = raw.appnews.newsitems;

  const newsitems = rawNewsitems.flatMap((item) => {
    if (
      !isObj(item) ||
      typeof item.gid !== "string" ||
      typeof item.title !== "string"
    ) {
      return [];
    }
    return [
      {
        gid: item.gid,
        title: item.title,
        url: typeof item.url === "string" ? item.url : "",
        is_external_url:
          typeof item.is_external_url === "boolean"
            ? item.is_external_url
            : false,
        author: typeof item.author === "string" ? item.author : "",
        contents: typeof item.contents === "string" ? item.contents : "",
        feedlabel: typeof item.feedlabel === "string" ? item.feedlabel : "",
        date: typeof item.date === "number" ? item.date : 0,
        feedname: typeof item.feedname === "string" ? item.feedname : "",
        feed_type: typeof item.feed_type === "number" ? item.feed_type : 0,
        appid: typeof item.appid === "number" ? item.appid : 0,
      },
    ];
  });

  return {
    ok: true,
    data: {
      appnews: {
        appid: typeof appnews.appid === "number" ? appnews.appid : 0,
        newsitems,
        count:
          typeof appnews.count === "number" ? appnews.count : newsitems.length,
      },
    },
  };
}

// ─── Steam Web API: ISteamUserStats/GetGlobalAchievementPercentagesForApp ──

/**
 * Parses the response from GetGlobalAchievementPercentagesForApp/v0002.
 * Fails if the `achievementpercentages.achievements` array is missing.
 * Coerces `percent` to a number in case the API returns a string.
 */
export function parseAchievementPercentages(
  raw: unknown,
): ParseResult<SteamAchievementPercentagesResponse> {
  if (
    !isObj(raw) ||
    !isObj(raw.achievementpercentages) ||
    !isArr(raw.achievementpercentages.achievements)
  ) {
    return {
      ok: false,
      error: "Missing `achievementpercentages.achievements` in response",
    };
  }

  const achievements = raw.achievementpercentages.achievements.flatMap(
    (item) => {
      if (!isObj(item) || typeof item.name !== "string") return [];
      return [
        {
          name: item.name,
          // API sometimes returns percent as a string — coerce to number
          percent:
            typeof item.percent === "number"
              ? item.percent
              : Number(item.percent) || 0,
        },
      ];
    },
  );

  return {
    ok: true,
    data: { achievementpercentages: { achievements } },
  };
}

// ─── Steam Web API: ISteamUserStats/GetSchemaForGame ──────────────────────

/**
 * Parses the response from GetSchemaForGame/v2.
 * The `availableGameStats.achievements` array is optional in the API —
 * some games return no schema data.  Filters items missing `name` or `displayName`.
 */
export function parseSchemaResponse(
  raw: unknown,
): ParseResult<SteamSchemaResponse> {
  if (!isObj(raw) || !isObj(raw.game)) {
    return { ok: false, error: "Missing `game` object in schema response" };
  }

  const game = raw.game;
  const statsBlock = isObj(game.availableGameStats)
    ? game.availableGameStats
    : undefined;

  const achievements = isArr(statsBlock?.achievements)
    ? statsBlock.achievements.flatMap((item) => {
        if (
          !isObj(item) ||
          typeof item.name !== "string" ||
          typeof item.displayName !== "string"
        ) {
          return [];
        }
        return [
          {
            name: item.name,
            defaultvalue:
              typeof item.defaultvalue === "number" ? item.defaultvalue : 0,
            displayName: item.displayName,
            hidden: typeof item.hidden === "number" ? item.hidden : 0,
            description:
              typeof item.description === "string"
                ? item.description
                : undefined,
            icon: typeof item.icon === "string" ? item.icon : undefined,
            icongray:
              typeof item.icongray === "string" ? item.icongray : undefined,
          },
        ];
      })
    : undefined;

  return {
    ok: true,
    data: {
      game: {
        gameName: typeof game.gameName === "string" ? game.gameName : "",
        gameVersion:
          typeof game.gameVersion === "string" ? game.gameVersion : "",
        availableGameStats:
          achievements !== undefined ? { achievements } : undefined,
      },
    },
  };
}

// ─── Steam Web API: ISteamUser/GetPlayerSummaries ─────────────────────────

/**
 * Parses the response from GetPlayerSummaries/v0002.
 * Fails if `response.players` array is missing.
 * Filters players without a `steamid` or `personaname`.
 */
export function parsePlayerSummaries(
  raw: unknown,
): ParseResult<SteamPlayerSummariesResponse> {
  if (!isObj(raw) || !isObj(raw.response) || !isArr(raw.response.players)) {
    return {
      ok: false,
      error: "Missing `response.players` array in player summaries response",
    };
  }

  const players = raw.response.players.flatMap((item) => {
    if (
      !isObj(item) ||
      typeof item.steamid !== "string" ||
      typeof item.personaname !== "string"
    ) {
      return [];
    }
    return [
      {
        steamid: item.steamid,
        communityvisibilitystate:
          typeof item.communityvisibilitystate === "number"
            ? item.communityvisibilitystate
            : 0,
        profilestate:
          typeof item.profilestate === "number" ? item.profilestate : 0,
        personaname: item.personaname,
        profileurl: typeof item.profileurl === "string" ? item.profileurl : "",
        avatar: typeof item.avatar === "string" ? item.avatar : "",
        avatarmedium:
          typeof item.avatarmedium === "string" ? item.avatarmedium : "",
        avatarfull: typeof item.avatarfull === "string" ? item.avatarfull : "",
        avatarhash: typeof item.avatarhash === "string" ? item.avatarhash : "",
        lastlogoff: typeof item.lastlogoff === "number" ? item.lastlogoff : 0,
        personastate:
          typeof item.personastate === "number" ? item.personastate : 0,
        realname: typeof item.realname === "string" ? item.realname : undefined,
        loccountrycode:
          typeof item.loccountrycode === "string"
            ? item.loccountrycode
            : undefined,
        locstatecode:
          typeof item.locstatecode === "string" ? item.locstatecode : undefined,
        timecreated:
          typeof item.timecreated === "number" ? item.timecreated : undefined,
      },
    ];
  });

  return { ok: true, data: { response: { players } } };
}
