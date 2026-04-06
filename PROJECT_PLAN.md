# PROJECT_PLAN.md — Steam Lens (IS 542 Final Project)

> Created before any implementation. Updated as work progresses.

---

## Overall Goal

Build a single-page React + TypeScript application that lets users explore the Steam gaming platform. The app has two functional areas:

- **Public**: search for games by title or App ID, then read news and global achievement data for those games
- **Authenticated**: log in with a hardcoded username/password to unlock a Steam profile lookup feature

The app must satisfy a course router requirement while still feeling like one contiguous shell application.

---

## Major Steps to Accomplish the Goal

1. **Plan** — Write this document before writing a line of code.
2. **Install dependencies** — Add `react-router-dom` (v7).
3. **Configure Vite** — Add a dev-server proxy so browser calls to Steam APIs are not blocked by CORS in development.
4. **Types layer** — Migrate and extend the types from `random.ts` into `src/types/`.
5. **Config layer** — Environment variables, constants, and Steam base-URL helpers.
6. **Service layer** — Typed `fetch` wrappers for each Steam API endpoint.
7. **Hooks** — Shared `useAsyncState` + feature-specific hooks (`useGameSearch`, `useNews`, `useAchievements`, `useProfile`).
8. **Auth context** — React context that holds the `AuthSession` discriminated union; exposes `login` / `logout`.
9. **Reusable components** — Navigation, status views, game search bar, game picker, game header, news card, achievement row, protected-route guard.
10. **Pages** — One page component per route: Home, News, Achievements, Login, Profile.
11. **Router** — `HashRouter` + `Routes` + `Route` wiring and a `ProtectedRoute` guard.
12. **CSS** — Replace boilerplate with a minimal, readable reset + layout.
13. **README** — Explain how to run the project and what requires API-key setup.

---

## Files and Documents Used as Context

| File                      | Role                                                                                |
| ------------------------- | ----------------------------------------------------------------------------------- |
| `random.ts`               | Original type sketches — domain models, `RemoteData<TQuery, TResult>`, auth session |
| Semester requirements PDF | Rubric, router requirement, feature scope                                           |
| Project sketch PDF        | UI flow and feature breakdown                                                       |
| `package.json`            | Existing dependencies (React 19, TypeScript ~6, Vite 8)                             |
| `tsconfig.app.json`       | Compiler flags that affect how code must be written                                 |

---

## Assumptions

- The project runs locally via `npm run dev` during development and grading; production deployment is secondary.
- "Authorized" means the user typed the hardcoded credentials; no real security model is expected.
- Steam public API endpoints (`GetNewsForApp`, `GetGlobalAchievementPercentagesForApp`) are reachable via Vite's dev proxy. In production, a server-side proxy or CORS-proxy service would be required.
- The global achievement percentage endpoint does not require an API key and returns only `name` + `percent` (no display names or icons without using the schema endpoint, which requires a key). Display names will be the raw internal names until an API key enables richer data.
- The app uses `HashRouter` so that GitHub Pages deployment works without server configuration.
- TypeScript compiler flags `noUnusedLocals`, `noUnusedParameters`, and `verbatimModuleSyntax` are active — all code must satisfy these without workarounds.

---

## Open Questions / Ambiguities

| Question                                                              | Resolution taken                                                                                                                                                                                                               |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Should a game auto-select when the search returns exactly one result? | Yes — the requirement only mandates manual choice for _multiple_ matches. One result auto-proceeds. Per-spec, multiple results always show the picker.                                                                         |
| Should game selection persist across pages (news → achievements)?     | Yes — `AuthContext` exists; a shared game context could be added. For the initial scaffold, each page manages its own game selection so it is independently usable. A `TODO` marks where a global game context could be wired. |
| What do achievement display names look like without an API key?       | The internal achievement `name` (e.g., `ACH_WIN_FIRST_GAME`) is used as the display name. A note is shown in the UI.                                                                                                           |
| What hash or username for hardcoded credentials?                      | `username: "steamuser"`, `password: "is542demo"` — defined only in `src/config/constants.ts`, not hidden.                                                                                                                      |
| Does the profile endpoint require a server-side proxy?                | Yes. `GetPlayerSummaries` requires an API key in the URL, which is visible in client code regardless. The README documents this limitation.                                                                                    |

---

## Proposed Folder Structure

```
src/
├── config/           # Env variable access + app constants
│   ├── constants.ts
│   └── env.ts
├── types/            # All TypeScript domain types + raw API shapes
│   ├── steam.ts      # Domain types (from random.ts, extended)
│   ├── api.ts        # Raw Steam API response shapes (internal)
│   └── index.ts      # Re-exports
├── services/         # Fetch wrappers — one file per Steam endpoint group
│   ├── steamClient.ts
│   ├── gameService.ts
│   ├── newsService.ts
│   ├── achievementService.ts
│   └── profileService.ts
├── utils/            # Pure helpers (date formatting, Steam URL builders)
│   └── steamHelpers.ts
├── hooks/            # Custom React hooks — async state + data fetching
│   ├── useAsyncState.ts
│   ├── useGameSearch.ts
│   ├── useNews.ts
│   ├── useAchievements.ts
│   └── useProfile.ts
├── app/              # Providers — contexts that wrap the whole app
│   └── AuthContext.tsx
├── components/       # Reusable presentational + smart components
│   ├── Navigation.tsx
│   ├── GameSearchBar.tsx
│   ├── GamePickerList.tsx
│   ├── GameHeader.tsx
│   ├── NewsCard.tsx
│   ├── AchievementRow.tsx
│   ├── StatusView.tsx
│   └── ProtectedRoute.tsx
├── pages/            # One component per route
│   ├── HomePage.tsx
│   ├── NewsPage.tsx
│   ├── AchievementsPage.tsx
│   ├── LoginPage.tsx
│   └── ProfilePage.tsx
├── router/           # Route configuration
│   └── index.tsx
├── App.tsx           # Root shell — providers + navigation + router outlet
├── App.css           # Minimal layout styles
├── index.css         # Global reset + design tokens
└── main.tsx          # ReactDOM entry point (unchanged)
```

**Why this structure over alternatives:**

- `app/` separates React providers (which are infrastructure) from `components/` (which are UI).
- `services/` isolates all network I/O, making it easy to mock in tests.
- `hooks/` keeps state logic out of page components.
- `types/api.ts` isolates raw API shapes so the rest of the app only touches domain types.

---

## Build Order / Feature Priority

1. **Config + Types + Services** — Foundation. No UI work until these compile.
2. **`useAsyncState` hook** — The shared async pattern everything else depends on.
3. **Auth context + `useGameSearch`** — Core shared state.
4. **Reusable components** — `StatusView`, `GameSearchBar`, `GamePickerList`, `GameHeader`.
5. **News page end-to-end** — First full vertical slice (game search → news fetch → display).
6. **Achievements page** — Second full vertical slice (reuses game search components).
7. **Login page** — Wires auth context.
8. **Profile page** — Protected; scaffolded to fire the profile API and handle API-key-missing state.
9. **Home page** — Landing page; links to features; shows value proposition.
10. **Router wiring + Navigation** — Ties all pages into a single shell.
11. **CSS** — Minimal functional styles last.
12. **README** — Document after everything else is wired.

---

## CORS and Steam API Strategy

Steam's `api.steampowered.com` and `store.steampowered.com` endpoints block direct browser requests in many environments. Strategy:

**Development (Vite dev server)**

- Requests go to `/steam-api/...` and `/steam-store/...`
- Vite's `server.proxy` rewrites and forwards them to the real Steam hosts
- No CORS headers required because the request never leaves the local machine at browser level

**Production / GitHub Pages**

- Set `VITE_USE_CORS_PROXY=true` and `VITE_CORS_PROXY_URL=<proxy-url>` in environment
- The service layer detects this and builds full `https://api.steampowered.com/...` URLs wrapped by the proxy
- Default proxy: `https://corsproxy.io/?` (free tier, not for high traffic)
- Alternative: deploy a small Cloudflare Worker or Hono proxy
- Document in README: **do not commit a real API key to git**

---

## Risks and Implementation Notes

| Risk                                                                | Mitigation                                                                        |
| ------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Steam store search returns zero or unexpected results               | Always show the picker UI with a "no results" state; never throw on empty         |
| Achievement endpoint returns 403 for games with no public stats     | Catch HTTP errors in `steamClient`; show a specific "no achievement data" message |
| `noUnusedLocals` / `noUnusedParameters` break builds                | Every import and every parameter is reviewed before commit                        |
| `verbatimModuleSyntax` requires `import type` for type-only imports | Enforced throughout — linter will catch violations                                |
| React 19 + TypeScript 6 edge cases                                  | Keep to standard hook + JSX patterns; avoid experimental APIs                     |
| API key visible in client-side requests                             | Documented limitation for frontend-only projects; acceptable per project spec     |
| GitHub Pages 404 on direct URL access                               | Using `HashRouter` eliminates this — all routing is hash-based                    |
