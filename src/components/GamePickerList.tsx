import type { Game } from "../types";

type Props = {
  games: Game[];
  onSelect: (game: Game) => void;
  /** Hint shown above the list when there are multiple results. */
  heading?: string;
};

/**
 * Displays a list of game candidates and lets the user pick one.
 * Always rendered — callers decide when to show/hide based on state.
 * Never auto-selects, even when only one result is present.
 */
export default function GamePickerList({ games, onSelect, heading }: Props) {
  return (
    <div className="game-picker">
      <p className="game-picker__heading">
        {heading ??
          (games.length === 1
            ? "One game found. Confirm to continue:"
            : `${games.length} games found — please select the correct one:`)}
      </p>
      <ul className="game-picker__list">
        {games.map((game) => (
          <li key={game.appId} className="game-picker__item">
            <button
              type="button"
              onClick={() => onSelect(game)}
              className="game-picker__btn"
            >
              {game.iconUrl && (
                <img
                  src={game.iconUrl}
                  alt=""
                  className="game-picker__icon"
                  width={32}
                  height={32}
                />
              )}
              <span className="game-picker__name">{game.title}</span>
              <span className="game-picker__id">App ID: {game.appId}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
