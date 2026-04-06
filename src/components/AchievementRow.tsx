import type { Achievement } from "../types";
import { formatPercent } from "../utils/steamHelpers";

type Props = {
  achievement: Achievement;
};

/** Renders one achievement row with a visual completion-percentage bar. */
export default function AchievementRow({ achievement }: Props) {
  const displayName = achievement.displayName || achievement.name;
  const barWidth = Math.min(Math.max(achievement.percent, 0), 100);

  return (
    <li className="achievement-row">
      {achievement.iconUrl && (
        <img
          src={achievement.iconUrl}
          alt=""
          className="achievement-row__icon"
          width={32}
          height={32}
        />
      )}

      <div className="achievement-row__info">
        <span className="achievement-row__name">{displayName}</span>
        {achievement.description && (
          <span className="achievement-row__desc">
            {achievement.description}
          </span>
        )}
      </div>

      <div className="achievement-row__bar-wrap" aria-hidden="true">
        <div
          className="achievement-row__bar"
          style={{ width: `${barWidth}%` }}
        />
      </div>

      <span
        className="achievement-row__percent"
        aria-label={`${displayName}: ${formatPercent(achievement.percent)} of players`}
      >
        {formatPercent(achievement.percent)}
      </span>
    </li>
  );
}
