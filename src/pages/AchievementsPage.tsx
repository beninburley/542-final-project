import { useState } from "react";
import type { Game, AchievementSearchResult } from "../types";
import { useGameSearch } from "../hooks/useGameSearch";
import { useAchievements } from "../hooks/useAchievements";
import GameSearchBar from "../components/GameSearchBar";
import GamePickerList from "../components/GamePickerList";
import GameHeader from "../components/GameHeader";
import AchievementRow from "../components/AchievementRow";
import AchievementsChart from "../components/AchievementsChart";
import StatusView from "../components/StatusView";

type SortBy = "name" | "percent";

/** Sort a copy of the achievements array without mutating. */
function sortAchievements(
  data: AchievementSearchResult,
  sortBy: SortBy,
): AchievementSearchResult["results"] {
  return [...data.results].sort((a, b) =>
    sortBy === "name"
      ? a.displayName.localeCompare(b.displayName)
      : b.percent - a.percent,
  );
}

/**
 * Achievements page — two-phase flow identical to the News page:
 *   Phase 1: game search → picker → user selects
 *   Phase 2: fetch and display global achievement percentages
 *
 * Adds a sort control (by name or by completion %) on top of the list.
 */
export default function AchievementsPage() {
  const { state: searchState, search, reset: resetSearch } = useGameSearch();
  const {
    state: achState,
    fetchAchievements,
    reset: resetAch,
  } = useAchievements();
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>("percent");

  function handleSearch(query: string) {
    setSelectedGame(null);
    resetAch();
    search(query);
  }

  function handleSelectGame(game: Game) {
    setSelectedGame(game);
    resetSearch();
    fetchAchievements(game);
  }

  function handleClearGame() {
    setSelectedGame(null);
    resetSearch();
    resetAch();
  }

  function handleRetry() {
    if (selectedGame) fetchAchievements(selectedGame);
  }

  return (
    <div className="page page--achievements">
      <h1>Global Achievements</h1>
      <p className="page__subtitle">
        Browse how many players worldwide have unlocked each achievement.
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
            Not sure what to search? Try: <em>Bopl Battle</em>,{" "}
            <em>Age of Empires II</em>, <em>Terraria</em>, or{" "}
            <em>Marvel Rivals</em>.
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

      {/* ── Phase 2: Achievements list ── */}
      {selectedGame && (
        <section className="results-section">
          <GameHeader game={selectedGame} onClear={handleClearGame} />

          {achState.status === "loading" && (
            <StatusView variant="loading" message="Fetching achievements…" />
          )}

          {achState.status === "error" && (
            <StatusView
              variant="error"
              message={achState.message}
              onRetry={handleRetry}
            />
          )}

          {achState.status === "success" &&
            achState.data.results.length === 0 && (
              <StatusView
                variant="empty"
                message="No achievement data found. This game may not have achievements."
              />
            )}

          {achState.status === "success" &&
            achState.data.results.length > 0 && (
              <>
                <AchievementsChart achievements={achState.data.results} />

                <div className="sort-controls">
                  <span>Sort by:</span>
                  <button
                    type="button"
                    className={`btn btn--sort ${sortBy === "percent" ? "btn--sort--active" : ""}`}
                    onClick={() => setSortBy("percent")}
                  >
                    % (most common first)
                  </button>
                  <button
                    type="button"
                    className={`btn btn--sort ${sortBy === "name" ? "btn--sort--active" : ""}`}
                    onClick={() => setSortBy("name")}
                  >
                    Name (A–Z)
                  </button>
                  <span className="sort-controls__count">
                    {achState.data.results.length} achievements
                  </span>
                </div>

                <ul className="achievement-list">
                  {sortAchievements(achState.data, sortBy).map((ach) => (
                    <AchievementRow key={ach.name} achievement={ach} />
                  ))}
                </ul>
              </>
            )}
        </section>
      )}
    </div>
  );
}
