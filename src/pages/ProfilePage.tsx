import { useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "../app/AuthContext";
import { useProfile } from "../hooks/useProfile";
import { API_KEY_MISSING_PREFIX } from "../services/profileService";
import StatusView from "../components/StatusView";
import { formatDate } from "../utils/steamHelpers";

/**
 * Profile page — authenticated users can look up a Steam profile by Steam ID.
 *
 * This page is protected by ProtectedRoute; it only renders when logged in.
 *
 * If VITE_STEAM_API_KEY is not configured the service throws with an
 * API_KEY_MISSING_PREFIX message, triggering a tailored setup notice rather
 * than a generic error.
 */
export default function ProfilePage() {
  const { session } = useAuth();
  const { state: profileState, fetchProfile, reset } = useProfile();
  const [steamId, setSteamId] = useState("");

  const isApiKeyMissing =
    profileState.status === "error" &&
    profileState.message.startsWith(API_KEY_MISSING_PREFIX);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    fetchProfile(steamId.trim());
  }

  return (
    <div className="page page--profile">
      <h1>Player Profile Lookup</h1>

      {session.status === "authenticated" && (
        <p className="page__subtitle">
          Signed in as <strong>{session.username}</strong>.
        </p>
      )}

      <section className="search-section">
        <form onSubmit={handleSubmit} className="search-bar">
          <div className="search-bar__row">
            <input
              type="text"
              value={steamId}
              onChange={(e) => setSteamId(e.target.value)}
              placeholder="Enter 64-bit Steam ID (e.g. 76561197960435530)"
              disabled={profileState.status === "loading"}
              className="search-bar__input"
              autoComplete="off"
              aria-label="Steam ID"
            />
            <button
              type="submit"
              disabled={profileState.status === "loading" || !steamId.trim()}
              className="btn btn--primary"
            >
              {profileState.status === "loading" ? "Looking up…" : "Look up"}
            </button>
            {profileState.status !== "idle" && (
              <button
                type="button"
                onClick={() => {
                  setSteamId("");
                  reset();
                }}
                className="btn btn--secondary"
              >
                Clear
              </button>
            )}
          </div>
        </form>

        {/* API key missing — show configuration instructions */}
        {isApiKeyMissing && (
          <div
            className="status-view status-view--error setup-notice"
            role="alert"
          >
            <h3>API Key Required</h3>
            <p>
              Profile lookups require a Steam Web API key. The key is not
              configured for this build.
            </p>
            <ol>
              <li>
                Get a free key at{" "}
                <a
                  href="https://steamcommunity.com/dev/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  steamcommunity.com/dev/apikey
                </a>
              </li>
              <li>
                Copy <code>.env.example</code> to <code>.env</code> in the
                project root.
              </li>
              <li>
                Set <code>VITE_STEAM_API_KEY=your_key_here</code>.
              </li>
              <li>Restart the dev server.</li>
            </ol>
            <p>
              <small>
                The rest of the app (News, Achievements) works without a key.
              </small>
            </p>
          </div>
        )}

        {/* Generic loading / error / idle states */}
        {!isApiKeyMissing && profileState.status === "idle" && (
          <StatusView
            variant="idle"
            message="Enter a Steam ID above to look up a profile."
          />
        )}

        {!isApiKeyMissing && profileState.status === "loading" && (
          <StatusView variant="loading" message="Fetching profile…" />
        )}

        {!isApiKeyMissing && profileState.status === "error" && (
          <StatusView
            variant="error"
            message={profileState.message}
            onRetry={() => fetchProfile(profileState.query.steamId)}
          />
        )}
      </section>

      {/* ── Profile result ── */}
      {profileState.status === "success" && (
        <section className="profile-card">
          {profileState.data.avatarUrl && (
            <img
              src={profileState.data.avatarUrl}
              alt={profileState.data.personaName}
              className="profile-card__avatar"
              width={184}
              height={184}
            />
          )}

          <div className="profile-card__info">
            <h2 className="profile-card__name">
              {profileState.data.personaName}
            </h2>

            {profileState.data.realName && (
              <p>
                <strong>Real name:</strong> {profileState.data.realName}
              </p>
            )}

            <p>
              <strong>Steam ID:</strong> {profileState.data.steamId}
            </p>

            {profileState.data.countryCode && (
              <p>
                <strong>Country:</strong> {profileState.data.countryCode}
              </p>
            )}

            {profileState.data.timeCreated && (
              <p>
                <strong>Account created:</strong>{" "}
                {formatDate(profileState.data.timeCreated)}
              </p>
            )}

            {profileState.data.lastLogOff && (
              <p>
                <strong>Last online:</strong>{" "}
                {formatDate(profileState.data.lastLogOff)}
              </p>
            )}

            {profileState.data.profileUrl && (
              <p>
                <a
                  href={profileState.data.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Steam profile ↗
                </a>
              </p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
