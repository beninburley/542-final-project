import { Link } from "react-router-dom";
import { useAuth } from "../app/AuthContext";

/**
 * Landing page — introduces the app and provides quick navigation to each
 * feature section. No data fetching happens here; it is purely informational.
 *
 * TODO: A global GameContext could be added later so a game selected here
 * is pre-loaded in the News and Achievements pages.
 */
export default function HomePage() {
  const { session } = useAuth();
  const profileRoute =
    session.status === "authenticated" ? "/profile" : "/login";
  return (
    <div className="page page--home">
      <section className="home-hero">
        <h1>SteamLens</h1>
        <p className="home-hero__tagline">
          Explore Steam game news, achievements, and player profiles — all in
          one place.
        </p>
      </section>

      <section className="home-features">
        <h2>What you can do</h2>
        <ul className="feature-list">
          <li className="feature-card">
            <h3>
              <Link to="/news">Game News</Link>
            </h3>
            <p>
              Search for any game and read the latest developer announcements,
              patch notes, and community updates straight from Steam.
            </p>
          </li>

          <li className="feature-card">
            <h3>
              <Link to="/achievements">Achievements</Link>
            </h3>
            <p>
              See global achievement completion percentages for any Steam game.
              Find out which achievements are rare and which are nearly
              universal.
            </p>
          </li>

          <li className="feature-card">
            <h3>
              <Link to={profileRoute}>Player Profile</Link>
            </h3>
            <p>
              {session.status === "authenticated"
                ? "Look up any public Steam account by its 64-bit Steam ID."
                : "Log in to unlock Steam profile lookup. Look up any public Steam account by its 64-bit Steam ID."}
            </p>
          </li>
        </ul>
      </section>

      <section className="home-tip">
        <h2>How to search</h2>
        <p>
          On the News and Achievements pages you can search by{" "}
          <strong>game title</strong> or paste in a{" "}
          <strong>Steam App ID</strong> directly (e.g. <code>570</code> for Dota
          2).
        </p>
        <p>
          If a title search returns multiple matches, you will be shown a list
          to pick the correct game — nothing is selected automatically.
        </p>
      </section>
    </div>
  );
}
