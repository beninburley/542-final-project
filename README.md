# SteamLens — IS 542 Final Project

**Live demo:** https://beninburley.github.io/542-final-project/

---

## Project Description

SteamLens is a single-page React + TypeScript app for exploring the Steam gaming platform. Users can search for any Steam game and read its latest news, browse global achievement completion percentages with a difficulty-distribution chart, and (with an API key) look up any Steam player's public profile. Login is required to access the profile page.

---

## How to Run

```bash
npm install
npm run dev
```

Open `http://localhost:5173`. No API key is needed for the News and Achievements pages.

To enable the Profile page, create a `.env` file in the project root:

```
VITE_STEAM_API_KEY=your_key_here
```

Get a free key at https://steamcommunity.com/dev/apikey. **Do not commit this file.**

**Login credentials:**

```
Username:  steamuser
Password:  is542demo
```

---

## APIs Used and How Data Is Handled

### Endpoints

| API             | Endpoint                                                      | Key required | Used for                                       |
| --------------- | ------------------------------------------------------------- | ------------ | ---------------------------------------------- |
| Steam Web API   | `ISteamNews/GetNewsForApp/v0002`                              | No           | Recent news articles for a game                |
| Steam Web API   | `ISteamUserStats/GetGlobalAchievementPercentagesForApp/v0002` | No           | Global achievement unlock percentages          |
| Steam Web API   | `ISteamUserStats/GetSchemaForGame/v2`                         | Yes          | Achievement display names, descriptions, icons |
| Steam Web API   | `ISteamUser/GetPlayerSummaries/v0002`                         | Yes          | Steam player profile by 64-bit Steam ID        |
| Steam Store API | `api/storesearch`                                             | No           | Full-text game title search                    |
| Steam Store API | `api/appdetails`                                              | No           | Game header image and description              |

### Data Pipeline

Every API response travels through three layers before the UI sees it:

1. **Fetch** — `steamFetch(url)` in `src/services/steamClient.ts` returns `{ ok: true, data: unknown } | { ok: false, error: string }`. The data is typed as `unknown` and requires narrowing.

2. **Parse & validate** — `src/services/dto.ts` contains one parser per endpoint (e.g. `parseNewsResponse`, `parseAchievementPercentages`). Each parser accepts `unknown`, checks that required fields exist with the correct types at runtime, and returns a `ParseResult<T>`. Array fields filter out malformed items rather than failing the whole response.

3. **Map to domain types** — Service functions (`getGameNews`, `getAchievementPercentages`, etc.) receive the validated data from the parser and map it to clean domain types (`Game`, `GameNewsItem`, `Achievement`, `SteamProfile`) defined in `src/types/steam.ts`. These are the only types used by hooks, components, and pages.

---

## Additional Features

### Recharts — Achievement Difficulty Chart

The Achievements page uses the [recharts](https://recharts.org/) library to render a bar chart showing how a game's achievements are distributed across five difficulty tiers (Common >= 60%, Moderate 40-60%, Uncommon 20-40%, Rare 10-20%, Very Rare < 10%). Each bar is color-coded and includes a custom hover tooltip with the exact count.

### Authentication with localStorage Persistence

A login system gates access to the Profile page via a `ProtectedRoute`. On successful login, `AuthContext` writes the session to `localStorage` so the logged-in state survives page refresh. On load, the stored value is validated before being restored; anything malformed falls back to anonymous.

### Responsive Design

Three CSS breakpoints (768 px, 640 px, 400 px) with a hamburger navigation menu on mobile, 44 px minimum touch targets, and entrance animations that respect `prefers-reduced-motion`.
