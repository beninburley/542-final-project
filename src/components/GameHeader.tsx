import type { Game } from "../types";
import { steamStoreUrl } from "../utils/steamHelpers";

type Props = {
  game: Game;
  /** If provided, renders a "Change game" button that calls this handler. */
  onClear?: () => void;
};

/**
 * Displays summary information about the currently selected game.
 * Shown at the top of feature pages once a game has been chosen.
 */
export default function GameHeader({ game, onClear }: Props) {
  return (
    <div className="game-header">
      {game.headerImageUrl && (
        <img
          src={game.headerImageUrl}
          alt={game.title}
          className="game-header__image"
        />
      )}

      <div className="game-header__body">
        <div className="game-header__title-row">
          {!game.headerImageUrl && game.iconUrl && (
            <img
              src={game.iconUrl}
              alt=""
              className="game-header__icon"
              width={32}
              height={32}
            />
          )}
          <h2 className="game-header__title">{game.title}</h2>
        </div>

        <p className="game-header__meta">
          App ID: {game.appId} ·{" "}
          <a
            href={steamStoreUrl(game.appId)}
            target="_blank"
            rel="noopener noreferrer"
          >
            View on Steam ↗
          </a>
        </p>

        {game.description && (
          <p className="game-header__desc">{game.description}</p>
        )}

        {onClear && (
          <button
            type="button"
            onClick={onClear}
            className="btn btn--secondary btn--sm"
          >
            ← Change game
          </button>
        )}
      </div>
    </div>
  );
}
