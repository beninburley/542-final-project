import type { Game } from "../types";
import type {
  SteamStoreSearchResponse,
  SteamAppDetailsResponse,
} from "../types/api";
import { STEAM_STORE_BASE } from "../config/env";
import { steamFetch } from "./steamClient";

/**
 * Search Steam Store by title.
 * Returns an array of candidate games for the user to pick from.
 * Throws on network or API error.
 */
export async function searchGames(term: string): Promise<Game[]> {
  const url = `${STEAM_STORE_BASE}/api/storesearch/?term=${encodeURIComponent(term)}&l=english&cc=US`;
  const result = await steamFetch<SteamStoreSearchResponse>(url);

  if (!result.ok) {
    throw new Error(`Game search failed: ${result.error}`);
  }

  return result.data.items
    .filter((item) => item.type === "game")
    .map((item) => ({
      appId: item.id,
      title: item.name,
      iconUrl: item.tiny_image || undefined,
    }));
}

/**
 * Look up a single game by its Steam App ID.
 * Uses the store appdetails endpoint for richer metadata.
 * Falls back to a minimal Game object if the endpoint fails.
 */
export async function getGameByAppId(appId: number): Promise<Game> {
  const url = `${STEAM_STORE_BASE}/api/appdetails/?appids=${appId}`;
  const result = await steamFetch<SteamAppDetailsResponse>(url);

  if (!result.ok) {
    // Non-fatal fallback — return minimal game info using the ID alone.
    return { appId, title: `App ${appId}` };
  }

  const entry = result.data[String(appId)];
  if (!entry?.success || !entry.data) {
    return { appId, title: `App ${appId}` };
  }

  return {
    appId,
    title: entry.data.name,
    headerImageUrl: entry.data.header_image || undefined,
    description: entry.data.short_description || undefined,
  };
}
