import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { AuthSession, LoginCredentials } from "../types";
import { HARDCODED_CREDENTIALS } from "../config/constants";

type AuthContextValue = {
  session: AuthSession;
  login: (credentials: LoginCredentials) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/** Provides authentication state to the component tree. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession>({ status: "anonymous" });

  function login(credentials: LoginCredentials) {
    if (
      credentials.username === HARDCODED_CREDENTIALS.username &&
      credentials.password === HARDCODED_CREDENTIALS.password
    ) {
      setSession({ status: "authenticated", username: credentials.username });
    } else {
      setSession({
        status: "authError",
        message: "Invalid username or password.",
      });
    }
  }

  function logout() {
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
