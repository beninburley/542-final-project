import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage";
import NewsPage from "../pages/NewsPage";
import AchievementsPage from "../pages/AchievementsPage";
import LoginPage from "../pages/LoginPage";
import ProfilePage from "../pages/ProfilePage";
import ProtectedRoute from "../components/ProtectedRoute";

/**
 * All application routes.
 *
 * Routes:
 *   /                  → Home (public landing)
 *   /news              → News search (public)
 *   /achievements      → Achievements search (public)
 *   /login             → Login form (public)
 *   /profile           → Player profile lookup (requires auth)
 *
 * HashRouter is used by App.tsx so GitHub Pages deployment works without
 * server-side redirect configuration.
 */
export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/news" element={<NewsPage />} />
      <Route path="/achievements" element={<AchievementsPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
