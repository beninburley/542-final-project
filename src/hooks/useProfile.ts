import { useCallback } from "react";
import type { UserSearchQuery, UserSearchState, SteamProfile } from "../types";
import { useAsyncState } from "./useAsyncState";
import { getPlayerSummary } from "../services/profileService";

/**
 * Manages the profile lookup lifecycle.
 * Requires VITE_STEAM_API_KEY to be set; otherwise resolves to an error state
 * with a configuration message so the UI can show a helpful prompt.
 */
export function useProfile() {
  const initialQuery: UserSearchQuery = { steamId: "" };
  const { state, run, reset } = useAsyncState<UserSearchQuery, SteamProfile>(
    initialQuery,
  );

  const fetchProfile = useCallback(
    (steamId: string) => {
      const trimmed = steamId.trim();
      if (!trimmed) return;

      const query: UserSearchQuery = { steamId: trimmed };
      run(query, (q) => getPlayerSummary(q.steamId));
    },
    [run],
  );

  return { state: state as UserSearchState, fetchProfile, reset };
}
