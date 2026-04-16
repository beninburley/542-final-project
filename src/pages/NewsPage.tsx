import { useState } from "react";
import type { Game } from "../types";
import { useGameSearch } from "../hooks/useGameSearch";
import { useNews } from "../hooks/useNews";
import GameSearchBar from "../components/GameSearchBar";
import GamePickerList from "../components/GamePickerList";
import GameHeader from "../components/GameHeader";
import NewsCard from "../components/NewsCard";
import StatusView from "../components/StatusView";

/**
 * News page — two-phase flow:
 *   Phase 1: game search → show picker → user selects a game
 *   Phase 2: fetch and display news for the selected game
 *
 * Phases are independent: resetting the game clears news state too.
 */
export default function NewsPage() {
  const { state: searchState, search, reset: resetSearch } = useGameSearch();
  const { state: newsState, fetchNews, reset: resetNews } = useNews();
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  function handleSearch(query: string) {
    setSelectedGame(null);
    resetNews();
    search(query);
  }

  function handleSelectGame(game: Game) {
    setSelectedGame(game);
    resetSearch();
    fetchNews(game);
  }

  function handleClearGame() {
    setSelectedGame(null);
    resetSearch();
    resetNews();
  }

  function handleRetryNews() {
    if (selectedGame) fetchNews(selectedGame);
  }

  return (
    <div className="page page--news">
      <h1>Game News</h1>
      <p className="page__subtitle">
        Find recent news, patch notes, and announcements for any Steam game.
      </p>

      {/* ── Phase 1: Game selection ── */}
      {!selectedGame && (
        <section className="search-section">
          <GameSearchBar
            onSearch={handleSearch}
            isLoading={searchState.status === "loading"}
            label="Search for a game"
          />
          <p className="search-suggestions">
            Not sure what to search? Try: <em>Bopl Battle</em>, <em>Age of Empires II</em>, <em>Terraria</em>, or <em>Marvel Rivals</em>.
          </p>

          {searchState.status === "idle" && (
            <StatusView
              variant="idle"
              message="Enter a game title or App ID above."
            />
          )}

          {searchState.status === "loading" && (
            <StatusView variant="loading" message="Searching Steam…" />
          )}

          {searchState.status === "error" && (
            <StatusView
              variant="error"
              message={searchState.message}
              onRetry={() => search(searchState.query.searchText)}
            />
          )}

          {searchState.status === "success" &&
            searchState.data.length === 0 && (
              <StatusView
                variant="empty"
                message="No games found. Try a different title or paste in a Steam App ID."
              />
            )}

          {searchState.status === "success" && searchState.data.length > 0 && (
            <GamePickerList
              games={searchState.data}
              onSelect={handleSelectGame}
            />
          )}
        </section>
      )}

      {/* ── Phase 2: News results ── */}
      {selectedGame && (
        <section className="results-section">
          <GameHeader game={selectedGame} onClear={handleClearGame} />

          {newsState.status === "loading" && (
            <StatusView variant="loading" message="Fetching news…" />
          )}

          {newsState.status === "error" && (
            <StatusView
              variant="error"
              message={newsState.message}
              onRetry={handleRetryNews}
            />
          )}

          {newsState.status === "success" &&
            newsState.data.results.length === 0 && (
              <StatusView
                variant="empty"
                message="No news found for this game. It may not have a news feed."
              />
            )}

          {newsState.status === "success" &&
            newsState.data.results.length > 0 && (
              <ul className="news-list">
                {newsState.data.results.map((item) => (
                  <NewsCard key={item.id} item={item} />
                ))}
              </ul>
            )}
        </section>
      )}
    </div>
  );
}
