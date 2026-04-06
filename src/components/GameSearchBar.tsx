import { useState } from "react";
import type { FormEvent } from "react";

type Props = {
  onSearch: (query: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  label?: string;
};

/**
 * A controlled text input + submit button for game or user searches.
 * Accepts any query string; callers decide how to interpret it.
 */
export default function GameSearchBar({
  onSearch,
  isLoading = false,
  placeholder,
  label,
}: Props) {
  const [value, setValue] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed) {
      onSearch(trimmed);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="search-bar">
      {label && (
        <label htmlFor="game-search-input" className="search-bar__label">
          {label}
        </label>
      )}
      <div className="search-bar__row">
        <input
          id="game-search-input"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={
            placeholder ?? "Search by game title or enter a Steam App ID…"
          }
          disabled={isLoading}
          className="search-bar__input"
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={isLoading || !value.trim()}
          className="btn btn--primary"
        >
          {isLoading ? "Searching…" : "Search"}
        </button>
      </div>
    </form>
  );
}
