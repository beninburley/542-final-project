import type { SteamProfile } from "../types";
import type { SteamPlayerSummariesResponse } from "../types/api";
import { STEAM_API_BASE } from "../config/env";
import { ENV } from "../config/env";
import { steamFetch } from "./steamClient";

/**
 * Marker prefix used to identify "API key missing" errors in the UI.
 * ProfilePage checks for this to show a configuration-specific message.
 */
export const API_KEY_MISSING_PREFIX = "API_KEY_MISSING:";

/**
 * Fetch a Steam player's public profile by their 64-bit Steam ID.
 * Endpoint: ISteamUser/GetPlayerSummaries/v0002 (requires VITE_STEAM_API_KEY).
 *
 * Throws with API_KEY_MISSING_PREFIX if the key is not configured.
 * Throws on network error or empty response.
 *
 * NOTE: The API key is included in the request URL, which means it is visible
 * in browser dev-tools. This is a known limitation of frontend-only projects.
 * Do not commit a real API key to version control.
 */
export async function getPlayerSummary(steamId: string): Promise<SteamProfile> {
  if (!ENV.steamApiKey) {
    throw new Error(
      `${API_KEY_MISSING_PREFIX} No Steam API key is configured. ` +
        "Add VITE_STEAM_API_KEY to your .env file to enable profile lookups. " +
        "See README for details.",
    );
  }

  const url =
    `${STEAM_API_BASE}/ISteamUser/GetPlayerSummaries/v0002/` +
    `?key=${ENV.steamApiKey}&steamids=${encodeURIComponent(steamId)}&format=json`;

  const result = await steamFetch<SteamPlayerSummariesResponse>(url);

  if (!result.ok) {
    throw new Error(`Profile request failed: ${result.error}`);
  }

  const players = result.data.response.players;
  if (players.length === 0) {
    throw new Error(
      "No profile found for that Steam ID. " +
        "Verify the ID is correct and that the profile is public.",
    );
  }

  const p = players[0];
  return {
    steamId: p.steamid,
    personaName: p.personaname,
    realName: p.realname || undefined,
    avatarUrl: p.avatarfull || undefined,
    profileUrl: p.profileurl || undefined,
    countryCode: p.loccountrycode || undefined,
    stateCode: p.locstatecode || undefined,
    visibilityState: p.communityvisibilitystate,
    profileState: p.profilestate,
    lastLogOff: p.lastlogoff
      ? new Date(p.lastlogoff * 1000).toISOString()
      : undefined,
    timeCreated: p.timecreated
      ? new Date(p.timecreated * 1000).toISOString()
      : undefined,
  };
}
