# SteamLens — IS 542 Final Project

A single-page React + TypeScript application that lets you explore the Steam platform:
browse game news, view global achievement percentages, and (with an API key) look up Steam player profiles.

---

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Available Scripts

| Command           | Purpose                                                 |
| ----------------- | ------------------------------------------------------- |
| `npm run dev`     | Start the Vite dev server with Steam API proxies active |
| `npm run build`   | Type-check and bundle for production                    |
| `npm run preview` | Serve the production build locally                      |
| `npm run lint`    | Run ESLint                                              |

---

## What Works Right Now (No API Key Required)

- **Home page** — Landing page with feature overview and navigation
- **News page** — Search any Steam game by title or App ID, then fetch recent news
- **Achievements page** — Fetch global achievement completion percentages for any game
- **Login** — Sign in with the hardcoded credentials (see below)
- **Routing** — Hash-based navigation between all pages (`/#/`, `/#/news`, etc.)

### Hardcoded Login Credentials

```
Username:  steamuser
Password:  is542demo
```

These are defined in `src/config/constants.ts` and carry no real security requirement per the project spec.

---

## What Requires API Key Setup

**Player Profile lookup** (`/#/profile`) — requires a Steam Web API key.

### Setup Steps

1. Get a free key at <https://steamcommunity.com/dev/apikey>

2. Copy `.env.example` to `.env` in the project root.

3. Fill in your key:

   ```
   VITE_STEAM_API_KEY=your_key_here
   ```

4. Restart the dev server (`npm run dev`).

> **Security note:** Because this is a frontend-only project the API key ends up in the
> built JavaScript and is visible in browser network requests. This is a known limitation.
> **Never commit your `.env` file to version control.**

---

## How Data Flows Through the App

```
User types a search query
        │
        ▼
GameSearchBar component
        │
        ▼
useGameSearch hook
    ├── if input looks like an integer  →  getGameByAppId()
    └── otherwise                       →  searchGames() (Steam Store search)
              │
              ▼
        GameSearchState  (RemoteData<GameSearchQuery, Game[]>)
              │
              ▼
        GamePickerList — user picks the correct game
              │
     ┌────────┴────────┐
     ▼                 ▼
useNews()         useAchievements()
     │                 │
     ▼                 ▼
newsService     achievementService
     │                 │
     └────────┬────────┘
              ▼
     RemoteData<TQuery, TResult>
     (idle | loading | success | error)
              │
              ▼
     StatusView / NewsCard / AchievementRow
```

### Key Architectural Patterns

| Pattern                                            | Location                                                 |
| -------------------------------------------------- | -------------------------------------------------------- |
| `RemoteData<TQuery, TResult>` discriminated union  | `src/types/steam.ts`                                     |
| `useAsyncState<TQ, TR>` generic async hook         | `src/hooks/useAsyncState.ts`                             |
| `AuthSession` discriminated union + React context  | `src/app/AuthContext.tsx`                                |
| Per-feature state hooks                            | `src/hooks/use{News,Achievements,GameSearch,Profile}.ts` |
| All network I/O isolated in service layer          | `src/services/`                                          |
| Raw API response shapes separate from domain types | `src/types/api.ts` vs `src/types/steam.ts`               |

---

## Folder Structure

```
src/
├── config/           env variable access + app constants
├── types/            all TypeScript types (domain + raw API shapes)
├── services/         Steam API fetch wrappers (one file per endpoint group)
├── utils/            pure helper functions
├── hooks/            custom React hooks
├── app/              React context providers (Auth)
├── components/       reusable UI components
├── pages/            one component per route
└── router/           route configuration
```

---

## Achievement Display Names

The public `GetGlobalAchievementPercentagesForApp` endpoint only returns internal
achievement identifiers (e.g. `ACH_WIN_100_GAMES`) and completion percentages — not
human-readable display names. Readable names require `GetSchemaForGame`, which needs an
API key. Until a key is configured the achievements page shows the raw internal names.

---

## Deployment to GitHub Pages

The app uses `HashRouter` so it works on static hosts without server-side redirect config.

1. Add `base: '/your-repo-name/',` to `vite.config.ts`
2. Run `npm run build`
3. Deploy the `dist/` folder (use `gh-pages` or a GitHub Actions workflow)
4. For Steam API calls in production you need a CORS proxy:
   ```
   VITE_USE_CORS_PROXY=true
   VITE_CORS_PROXY_URL=https://corsproxy.io/?
   ```

---

## Running into CORS Errors?

Run the app with `npm run dev`, not by opening `index.html` directly. The Vite dev
server proxies all `/steam-api/` and `/steam-store/` requests, which is what prevents
CORS errors during development.
