import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../app/AuthContext";

/**
 * Top-level navigation bar.
 * On desktop: links shown inline.
 * On mobile (≤640px): links collapse behind a hamburger toggle button.
 * Authenticated users see a Profile link and a sign-out button.
 * Unauthenticated users see a Login link instead.
 */
export default function Navigation() {
  const { session, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  /** Close the mobile drawer (called on every link/action click). */
  function close() {
    setIsOpen(false);
  }

  return (
    <nav className="app-nav" aria-label="Main navigation">
      <span className="app-nav__brand">
        <NavLink to="/" end onClick={close}>
          SteamLens
        </NavLink>
      </span>

      {/* Hamburger button — only visible via CSS at ≤640px */}
      <button
        className="app-nav__menu-btn"
        aria-label="Toggle navigation menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((o) => !o)}
      >
        <span className="app-nav__hamburger" />
      </button>

      <ul className={`app-nav__links${isOpen ? " app-nav__links--open" : ""}`}>
        <li>
          <NavLink to="/" end onClick={close}>
            Home
          </NavLink>
        </li>
        <li>
          <NavLink to="/news" onClick={close}>
            News
          </NavLink>
        </li>
        <li>
          <NavLink to="/achievements" onClick={close}>
            Achievements
          </NavLink>
        </li>

        {session.status === "authenticated" ? (
          <>
            <li>
              <NavLink to="/profile" onClick={close}>
                Profile
              </NavLink>
            </li>
            <li>
              <button
                className="btn btn--inline"
                onClick={() => {
                  logout();
                  close();
                }}
              >
                Sign out ({session.username})
              </button>
            </li>
          </>
        ) : (
          <li>
            <NavLink to="/login" onClick={close}>
              Login
            </NavLink>
          </li>
        )}
      </ul>
    </nav>
  );
}
