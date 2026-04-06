import { HashRouter } from "react-router-dom";
import { AuthProvider } from "./app/AuthContext";
import { AppRouter } from "./router";
import Navigation from "./components/Navigation";
import "./App.css";

/**
 * Root application shell.
 *
 * Provider order (outermost → innermost):
 *   HashRouter  —  makes routing hooks available everywhere
 *   AuthProvider  —  makes useAuth() available everywhere
 *
 * HashRouter is used instead of BrowserRouter so that the app works on
 * GitHub Pages (a static host) without a custom 404 redirect.
 * All routes will be prefixed with /#/ in the address bar.
 */
export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <div className="app-shell">
          <Navigation />
          <main className="app-main">
            <AppRouter />
          </main>
        </div>
      </AuthProvider>
    </HashRouter>
  );
}
