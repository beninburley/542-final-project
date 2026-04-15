# SteamLens — IS 542 Final Project

A single-page React + TypeScript application that lets you explore the Steam platform:
browse game news, view global achievement percentages with a difficulty-distribution chart, and (with an API key) look up Steam player profiles.

**Live demo:** https://beninburley.github.io/542-final-project/

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

---

## Additional Features Implemented

### Persistent Authentication (localStorage)

The login session survives page refresh. On successful login, `AuthContext` writes the
authenticated session to `localStorage`. On app load, the stored session is validated
(checks that `status === "authenticated"` and `username` is a string) before being
restored — malformed or missing data falls back to anonymous silently.

### Achievement Difficulty Chart (recharts)

The Achievements page displays a bar chart above the achievement list, powered by the
[recharts](https://recharts.org/) third-party library. Charts show how the game's
achievements are distributed across five difficulty tiers:

| Tier | Completion rate | Bar color |
| --------- | --------------- | --------- |
| Common    | ≥ 60%           | Green     |
| Moderate  | 40–60%          | Light green |
| Uncommon  | 20–40%          | Orange    |
| Rare      | 10–20%          | Red       |
| Very Rare | < 10%           | Purple    |

A custom tooltip displays the exact count on bar hover. The chart uses
`ResponsiveContainer` so it scales correctly on all screen widths.

### Responsive Design

- Three CSS breakpoints: 768 px (tablet), 640 px (phone), 400 px (very small phone)
- Hamburger navigation menu on mobile with accessible `aria-expanded` state
- 44 px minimum touch targets on interactive mobile elements
- CSS animations respect `prefers-reduced-motion`

### Achievement Display Names

When an API key is configured, the achievements page enriches raw internal identifiers
(e.g. `ACH_WIN_100_GAMES`) with human-readable display names, descriptions, and icons
from `GetSchemaForGame`. Both API calls run in parallel via `Promise.all`; schema
enrichment is best-effort and never blocks the percentages from loading.

### CSS Entrance Animations

Every page fades up on mount (`@keyframes fadeUp`). News cards and achievement rows
stagger their animations so items cascade in rather than appearing all at once.
