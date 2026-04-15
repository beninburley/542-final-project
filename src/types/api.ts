// ─── Raw Steam API response shapes ───────────────────────────────────────────
// These types model what the Steam endpoints actually return over the wire.
// They are used exclusively inside src/services/ and never exported to pages
// or components. This keeps domain types clean and independent of API quirks.

export type SteamStoreSearchResponse = {
  total: number;
  items: Array<{
    id: number;
    type: string;
    name: string;
    tiny_image: string;
    metascore?: string;
    streamingvideo?: boolean; // true for video/soundtrack items; used to exclude non-games
  }>;
};

export type SteamAppDetailsData = {
  type: string;
  name: string;
  steam_appid: number;
  short_description?: string;
  header_image?: string;
};

/** Response from store.steampowered.com/api/appdetails/?appids=APPID */
export type SteamAppDetailsResponse = Record<
  string,
  { success: boolean; data?: SteamAppDetailsData }
>;

export type SteamNewsResponse = {
  appnews: {
    appid: number;
    newsitems: Array<{
      gid: string;
      title: string;
      url: string;
      is_external_url: boolean;
      author: string;
      contents: string;
      feedlabel: string;
      date: number; // Unix timestamp
      feedname: string;
      feed_type: number;
      appid: number;
    }>;
    count: number;
  };
};

export type SteamAchievementPercentagesResponse = {
  achievementpercentages: {
    achievements: Array<{
      name: string;
      percent: number;
    }>;
  };
};

/**
 * Response from ISteamUserStats/GetSchemaForGame/v2 (requires API key).
 * Provides human-readable display names, descriptions, hidden flag, and icon URLs.
 */
export type SteamSchemaResponse = {
  game: {
    gameName: string;
    gameVersion: string;
    availableGameStats?: {
      achievements?: Array<{
        name: string;         // internal API name — matches percentages endpoint
        defaultvalue: number;
        displayName: string;
        hidden: number;       // 0 = visible, 1 = hidden until earned
        description?: string;
        icon?: string;        // URL of earned-state icon
        icongray?: string;    // URL of un-earned (gray) icon
      }>;
    };
  };
};

export type SteamPlayerSummariesResponse = {
  response: {
    players: Array<{
      steamid: string;
      communityvisibilitystate: number;
      profilestate: number;
      personaname: string;
      profileurl: string;
      avatar: string;
      avatarmedium: string;
      avatarfull: string;
      avatarhash: string;
      lastlogoff: number;
      personastate: number;
      realname?: string;
      loccountrycode?: string;
      locstatecode?: string;
      timecreated?: number;
    }>;
  };
};
