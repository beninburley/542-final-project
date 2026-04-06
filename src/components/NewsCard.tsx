import type { GameNewsItem } from "../types";
import { formatDate } from "../utils/steamHelpers";

type Props = {
  item: GameNewsItem;
};

/** Renders one news item as an article card. */
export default function NewsCard({ item }: Props) {
  return (
    <article className="news-card">
      <h3 className="news-card__title">
        <a href={item.url} target="_blank" rel="noopener noreferrer">
          {item.title}
        </a>
      </h3>

      <div className="news-card__meta">
        {item.author && (
          <span className="news-card__author">By {item.author}</span>
        )}
        <span className="news-card__date">{formatDate(item.publishedAt)}</span>
        {item.feedLabel && (
          <span className="news-card__feed">{item.feedLabel}</span>
        )}
      </div>

      <p className="news-card__contents">{item.contents}</p>
    </article>
  );
}
