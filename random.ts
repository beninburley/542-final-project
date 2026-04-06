/*
Game
Represents a Steam game that the user searches for or selects.
This object is important because the application needs to map Steam app IDs to readable game titles.
A Game may be related to many news items and many achievements.
This data may be shared across the app, especially in the news and achievement search pages.
*/
type Game = {
  appId: number;
  title: string;
  iconUrl?: string;
  headerImageUrl?: string;
  description?: string;
};

/*
GameNewsItem
Represents one news entry associated with a Steam game.
This object supports the public news search feature of the app.
Each GameNewsItem belongs to one Game, and a Game may have many GameNewsItem objects.
This data is primarily managed by the news search page.
*/
type GameNewsItem = {
  id: string;
  appId: number;
  title: string;
  author?: string;
  url: string;
  contents: string;
  publishedAt: string;
  feedLabel?: string;
};

/*
Achievement
Represents one achievement for a Steam game along with its global completion percentage.
This object supports the public achievement search feature of the app.
Each Achievement belongs to one Game, and a Game may have many Achievement objects.
This data is primarily managed by the achievement search page.
*/
type Achievement = {
  name: string;
  displayName: string;
  description?: string;
  iconUrl?: string;
  iconGrayUrl?: string;
  percent: number;
  hidden: boolean;
};

/*
SteamProfile
Represents a Steam user profile returned from the API.
This object supports the authorized profile search feature of the app.
A successful user search returns one SteamProfile.
Some fields are optional because Steam profile data may be unavailable depending on privacy settings or endpoint behavior.
This data is primarily managed by the user search page.
*/
type SteamProfile = {
  steamId: string;
  personaName: string;
  realName?: string;
  avatarUrl?: string;
  profileUrl?: string;
  countryCode?: string;
  stateCode?: string;
  visibilityState?: number;
  profileState?: number;
  lastLogOff?: string;
  timeCreated?: string;
};

/*
AuthSession
Represents the current authentication state of the application.
This object exists because the app separates public functionality from authorized profile-search functionality.
It is managed at the top level of the app and updated by the login form.
A discriminated union is used so that only valid authentication states can exist.
*/
type AuthSession =
  | { status: "anonymous" }
  | { status: "authenticated"; username: string }
  | { status: "authError"; message: string };

/*
GameSearchQuery
Represents the user input for searching for game-related data.
This query object is used by both the news search and achievement search features.
It is managed by the corresponding search page components.
*/
type GameSearchQuery = {
  searchText: string;
  selectedAppId?: number;
};

/*
UserSearchQuery
Represents the user input for searching for a Steam profile.
This query object is used by the user search feature.
It is managed by the user search page component.
*/
type UserSearchQuery = {
  steamId: string;
};

/*
NewsSearchResult
Represents the successful result of a news search.
It includes the selected game and the list of returned news items.
This object is used by the news search page after a successful search.
*/
type NewsSearchResult = {
  selectedGame: Game;
  results: GameNewsItem[];
};

/*
AchievementSearchResult
Represents the successful result of an achievement search.
It includes the selected game, the list of returned achievements, and the current sort setting.
This object is used by the achievement search page after a successful search.
*/
type AchievementSearchResult = {
  selectedGame: Game;
  results: Achievement[];
  sortBy: "name" | "percent";
};

/*
RemoteData<TQuery, TResult>
Represents a reusable pattern for async page state.
It models four valid states: idle, loading, success, and error.
This discriminated union prevents invalid states such as having both results and an error at the same time.
It is used to define the state of the app’s major search pages.
*/
type RemoteData<TQuery, TResult> =
  | { status: "idle"; query: TQuery }
  | { status: "loading"; query: TQuery }
  | { status: "success"; query: TQuery; data: TResult }
  | { status: "error"; query: TQuery; message: string };

/*
NewsSearchState
Represents the complete UI state for the news search feature.
It uses GameSearchQuery as input and NewsSearchResult as the success payload.
It is managed by the news search page.
*/
type NewsSearchState = RemoteData<GameSearchQuery, NewsSearchResult>;

/*
AchievementSearchState
Represents the complete UI state for the achievement search feature.
It uses GameSearchQuery as input and AchievementSearchResult as the success payload.
It is managed by the achievement search page.
*/
type AchievementSearchState = RemoteData<
  GameSearchQuery,
  AchievementSearchResult
>;

/*
UserSearchState
Represents the complete UI state for the profile search feature.
It uses UserSearchQuery as input and SteamProfile as the success payload.
It is managed by the user search page.
*/
type UserSearchState = RemoteData<UserSearchQuery, SteamProfile>;
