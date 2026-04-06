import { useCallback } from "react";
import type { Game, GameSearchQuery, GameSearchState } from "../types";
import { useAsyncState } from "./useAsyncState";
import { searchGames, getGameByAppId } from "../services/gameService";
import { parseAppId } from "../utils/steamHelpers";

/**
 * Manages the game search lifecycle (idle → loading → success | error).
 *
 * If the search text looks like a bare integer, resolves it directly via
 * getGameByAppId; otherwise runs a title search via the Steam Store API.
 *
 * The caller is responsible for rendering a picker when success data has
 * more than one result. Do not auto-select on multiple matches.
 */
export function useGameSearch() {
  const initialQuery: GameSearchQuery = { searchText: "" };
  const { state, run, reset } = useAsyncState<GameSearchQuery, Game[]>(
    initialQuery,
  );

  const search = useCallback(
    (searchText: string) => {
      const trimmed = searchText.trim();
      if (!trimmed) return;

      const query: GameSearchQuery = { searchText: trimmed };

      run(query, async (q) => {
        const appId = parseAppId(q.searchText);
        if (appId !== null) {
          const game = await getGameByAppId(appId);
          return [game];
        }
        return searchGames(q.searchText);
      });
    },
    [run],
  );

  return { state: state as GameSearchState, search, reset };
}
