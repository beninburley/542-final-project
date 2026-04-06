import { useCallback } from "react";
import type {
  Game,
  GameSearchQuery,
  AchievementSearchResult,
  AchievementSearchState,
} from "../types";
import { useAsyncState } from "./useAsyncState";
import { getAchievementPercentages } from "../services/achievementService";

/**
 * Manages the achievement fetch lifecycle for a selected game.
 * Call fetchAchievements(game) after the user has chosen a game.
 * The returned state includes a sortBy field defaulting to 'percent'.
 */
export function useAchievements() {
  const initialQuery: GameSearchQuery = { searchText: "" };
  const { state, run, reset } = useAsyncState<
    GameSearchQuery,
    AchievementSearchResult
  >(initialQuery);

  const fetchAchievements = useCallback(
    (game: Game) => {
      const query: GameSearchQuery = {
        searchText: game.title,
        selectedAppId: game.appId,
      };

      run(query, async (q) => {
        const results = await getAchievementPercentages(q.selectedAppId!);
        return { selectedGame: game, results, sortBy: "percent" as const };
      });
    },
    [run],
  );

  return { state: state as AchievementSearchState, fetchAchievements, reset };
}
