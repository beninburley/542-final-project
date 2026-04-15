import type { Achievement } from "../types";
import type { SteamSchemaResponse } from "../types/api";
import { STEAM_API_BASE, ENV } from "../config/env";
import { steamFetch } from "./steamClient";
import { parseAchievementPercentages, parseSchemaResponse } from "./dto";

/**
 * Fetch global achievement completion percentages for a game, enriched with
 * human-readable display names when a Steam API key is available.
 *
 * Always calls (public, no key required):
 *   ISteamUserStats/GetGlobalAchievementPercentagesForApp/v0002
 *   → returns internal achievement names + global completion percentages
 *
 * Also calls when VITE_STEAM_API_KEY is set (no login required):
 *   ISteamUserStats/GetSchemaForGame/v2
 *   → enriches results with displayName, description, hidden flag, and icon URLs
 *
 * If no key is configured the display name falls back to the raw internal name.
 * Throws on network or API error from the primary percentages endpoint.
 */
export async function getAchievementPercentages(
  appId: number,
): Promise<Achievement[]> {
  const percentUrl =
    `${STEAM_API_BASE}/ISteamUserStats/GetGlobalAchievementPercentagesForApp/v0002/` +
    `?gameid=${appId}&format=json`;

  // Run both requests in parallel when a key is available; schema fetch is
  // best-effort — a failure there will not block the percentages from showing.
  const schemaPromise: Promise<SteamSchemaResponse | null> = ENV.steamApiKey
    ? steamFetch(
        `${STEAM_API_BASE}/ISteamUserStats/GetSchemaForGame/v2/` +
          `?appid=${appId}&key=${ENV.steamApiKey}&l=english&format=json`,
      ).then((r) => {
        if (!r.ok) return null;
        const parsed = parseSchemaResponse(r.data);
        return parsed.ok ? parsed.data : null;
      })
    : Promise.resolve(null);

  const [percentResult, schemaData] = await Promise.all([
    steamFetch(percentUrl),
    schemaPromise,
  ]);

  if (!percentResult.ok) {
    throw new Error(`Achievements request failed: ${percentResult.error}`);
  }

  const parsedPercents = parseAchievementPercentages(percentResult.data);
  if (!parsedPercents.ok) {
    throw new Error(`Achievements response invalid: ${parsedPercents.error}`);
  }

  // Build a lookup map from internal name → schema metadata for O(1) merging.
  type SchemaEntry = NonNullable<
    NonNullable<
      SteamSchemaResponse["game"]["availableGameStats"]
    >["achievements"]
  >[number];
  const schemaMap = new Map<string, SchemaEntry>();
  schemaData?.game.availableGameStats?.achievements?.forEach((a) =>
    schemaMap.set(a.name, a),
  );

  return parsedPercents.data.achievementpercentages.achievements.map((item) => {
    const schema = schemaMap.get(item.name);
    return {
      name: item.name,
      displayName: schema?.displayName ?? item.name, // friendly name, falls back to internal name
      description: schema?.description,
      iconUrl: schema?.icon,
      iconGrayUrl: schema?.icongray,
      percent: Number(item.percent), // Steam API sometimes returns a string
      hidden: schema ? schema.hidden === 1 : false,
    };
  });
}
