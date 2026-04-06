import type { GameNewsItem } from "../types";
import type { SteamNewsResponse } from "../types/api";
import { STEAM_API_BASE } from "../config/env";
import { NEWS_COUNT } from "../config/constants";
import { steamFetch } from "./steamClient";

/**
 * Fetch recent news for a Steam game by App ID.
 * Endpoint: ISteamNews/GetNewsForApp/v0002 (public, no API key required).
 * Throws on network or API error.
 */
export async function getGameNews(appId: number): Promise<GameNewsItem[]> {
  const url =
    `${STEAM_API_BASE}/ISteamNews/GetNewsForApp/v0002/?appid=${appId}` +
    `&count=${NEWS_COUNT}&maxlength=500&format=json`;

  const result = await steamFetch<SteamNewsResponse>(url);

  if (!result.ok) {
    throw new Error(`News request failed: ${result.error}`);
  }

  return result.data.appnews.newsitems.map((item) => ({
    id: item.gid,
    appId: item.appid,
    title: item.title,
    author: item.author || undefined,
    url: item.url,
    contents: item.contents,
    publishedAt: new Date(item.date * 1000).toISOString(),
    feedLabel: item.feedlabel || undefined,
  }));
}
