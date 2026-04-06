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
