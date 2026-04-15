import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { AuthSession, LoginCredentials } from "../types";
import { HARDCODED_CREDENTIALS } from "../config/constants";

const SESSION_STORAGE_KEY = "steamlens_session";

/** Read a persisted authenticated session from localStorage, if one exists. */
function loadSession(): AuthSession {
  try {
    const stored = localStorage.getItem(SESSION_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as AuthSession;
      // Only restore authenticated sessions; discard any other stored value.
      if (parsed.status === "authenticated" && typeof parsed.username === "string") {
        return parsed;
      }
    }
  } catch {
    // Malformed JSON or unavailable localStorage — start fresh.
  }
  return { status: "anonymous" };
}

type AuthContextValue = {
  session: AuthSession;
  login: (credentials: LoginCredentials) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/** Provides authentication state to the component tree. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession>(loadSession);

  function login(credentials: LoginCredentials) {
    if (
      credentials.username === HARDCODED_CREDENTIALS.username &&
      credentials.password === HARDCODED_CREDENTIALS.password
    ) {
      const authenticated: AuthSession = { status: "authenticated", username: credentials.username };
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(authenticated));
      setSession(authenticated);
    } else {
      setSession({
        status: "authError",
        message: "Invalid username or password.",
      });
    }
  }

  function logout() {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    setSession({ status: "anonymous" });
  }

  return (
    <AuthContext.Provider value={{ session, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/** Consume the auth context. Must be used inside AuthProvider. */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
