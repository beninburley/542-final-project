import { useCallback } from "react";
import type {
  Game,
  GameSearchQuery,
  NewsSearchResult,
  NewsSearchState,
} from "../types";
import { useAsyncState } from "./useAsyncState";
import { getGameNews } from "../services/newsService";

/**
 * Manages the news fetch lifecycle for a selected game.
 * Call fetchNews(game) after the user has chosen a game from search results.
 */
export function useNews() {
  const initialQuery: GameSearchQuery = { searchText: "" };
  const { state, run, reset } = useAsyncState<
    GameSearchQuery,
    NewsSearchResult
  >(initialQuery);

  const fetchNews = useCallback(
    (game: Game) => {
      const query: GameSearchQuery = {
        searchText: game.title,
        selectedAppId: game.appId,
      };

      run(query, async (q) => {
        const results = await getGameNews(q.selectedAppId!);
        return { selectedGame: game, results };
      });
    },
    [run],
  );

  return { state: state as NewsSearchState, fetchNews, reset };
}
