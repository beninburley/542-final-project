import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxies /steam-api/... → https://api.steampowered.com/...
      // Prevents CORS errors during local development.
      "/steam-api": {
        target: "https://api.steampowered.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/steam-api/, ""),
        secure: true,
      },
      // Proxies /steam-store/... → https://store.steampowered.com/...
      "/steam-store": {
        target: "https://store.steampowered.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/steam-store/, ""),
        secure: true,
      },
    },
  },
});
