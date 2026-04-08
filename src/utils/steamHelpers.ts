/** Format an ISO-8601 date string into a readable short date. */
export function formatDate(isoString: string): string {
  try {
    return new Date(isoString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return isoString;
  }
}

/** Format a percentage number to one decimal place. */
export function formatPercent(value: number): string {
  const n = Number(value);
  return isNaN(n) ? '—' : `${n.toFixed(1)}%`;
}

/** Build the Steam store page URL for a given App ID. */
export function steamStoreUrl(appId: number): string {
  return `https://store.steampowered.com/app/${appId}`;
}

/**
 * Determine whether a search string looks like a bare Steam App ID.
 * Returns the parsed integer if yes, or null if not.
 */
export function parseAppId(input: string): number | null {
  const trimmed = input.trim();
  const asNumber = parseInt(trimmed, 10);
  if (!isNaN(asNumber) && asNumber > 0 && String(asNumber) === trimmed) {
    return asNumber;
  }
  return null;
}
