import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../app/AuthContext";
import type { LoginCredentials } from "../types";

/**
 * Login page — accepts the hardcoded username + password.
 * On success, navigates to /profile.
 * On failure, displays the error message from AuthContext.
 * Logging out elsewhere returns the user here on next /profile visit.
 */
export default function LoginPage() {
  const { session, login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Redirect away immediately if already authenticated.
  if (session.status === "authenticated") {
    navigate("/profile", { replace: true });
    return null;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const credentials: LoginCredentials = { username, password };
    login(credentials);
    // Navigation happens reactively: if login succeeds, the redirect above fires
    // on the next render. If it fails, the error state is shown below.
  }

  return (
    <div className="page page--login">
      <h1>Sign In</h1>
      <p className="page__subtitle">
        Log in to access Steam player profile lookup.
      </p>

      <form onSubmit={handleSubmit} className="login-form" noValidate>
        <div className="form-field">
          <label htmlFor="login-username">Username</label>
          <input
            id="login-username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>

        {session.status === "authError" && (
          <p className="login-form__error" role="alert">
            {session.message}
          </p>
        )}

        <button
          type="submit"
          className="btn btn--primary"
          disabled={!username || !password}
        >
          Sign in
        </button>
      </form>

      <p className="login-hint">
        <small>
          Hint: use the credentials documented in the project README.
        </small>
      </p>
    </div>
  );
}
