import { NavLink } from "react-router-dom";
import { useAuth } from "../app/AuthContext";

/**
 * Top-level navigation bar.
 * Authenticated users see a Profile link and a sign-out button.
 * Unauthenticated users see a Login link instead.
 */
export default function Navigation() {
  const { session, logout } = useAuth();

  return (
    <nav className="app-nav" aria-label="Main navigation">
      <span className="app-nav__brand">SteamLens</span>

      <ul className="app-nav__links">
        <li>
          <NavLink to="/" end>
            Home
          </NavLink>
        </li>
        <li>
          <NavLink to="/news">News</NavLink>
        </li>
        <li>
          <NavLink to="/achievements">Achievements</NavLink>
        </li>

        {session.status === "authenticated" ? (
          <>
            <li>
              <NavLink to="/profile">Profile</NavLink>
            </li>
            <li>
              <button className="btn btn--inline" onClick={logout}>
                Sign out ({session.username})
              </button>
            </li>
          </>
        ) : (
          <li>
            <NavLink to="/login">Login</NavLink>
          </li>
        )}
      </ul>
    </nav>
  );
}
