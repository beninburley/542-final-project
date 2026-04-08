import type { Achievement } from "../types";
import type { SteamAchievementPercentagesResponse } from "../types/api";
import { STEAM_API_BASE } from "../config/env";
import { steamFetch } from "./steamClient";

/**
 * Fetch global achievement completion percentages for a game.
 * Endpoint: ISteamUserStats/GetGlobalAchievementPercentagesForApp/v0002
 *           (public, no API key required).
 *
 * NOTE: This endpoint only returns internal achievement names and percentages.
 * Human-readable display names require GetSchemaForGame, which needs an API key.
 * Until a key is configured, displayName will equal the raw internal name.
 *
 * Throws on network or API error.
 */
export async function getAchievementPercentages(
  appId: number,
): Promise<Achievement[]> {
  const url =
    `${STEAM_API_BASE}/ISteamUserStats/GetGlobalAchievementPercentagesForApp/v0002/` +
    `?gameid=${appId}&format=json`;

  const result = await steamFetch<SteamAchievementPercentagesResponse>(url);

  if (!result.ok) {
    throw new Error(`Achievements request failed: ${result.error}`);
  }

  return result.data.achievementpercentages.achievements.map((item) => ({
    name: item.name,
    displayName: item.name, // raw internal name — display name requires API key
    percent: Number(item.percent), // Steam API sometimes returns a string
    hidden: false, // not available from this public endpoint
  }));
}
