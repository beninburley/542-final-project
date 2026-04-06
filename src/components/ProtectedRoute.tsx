import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../app/AuthContext";

type Props = { children: ReactNode };

/**
 * Wraps a route that requires authentication.
 * Redirects unauthenticated users to /login.
 * Renders children when the session is authenticated.
 */
export default function ProtectedRoute({ children }: Props) {
  const { session } = useAuth();

  if (session.status !== "authenticated") {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
