import { useState, useCallback } from "react";
import type { RemoteData } from "../types";

type RunFn<TQuery, TResult> = (query: TQuery) => Promise<TResult>;

/**
 * Generic hook that manages the four-state async lifecycle (idle → loading →
 * success | error) using the RemoteData discriminated union.
 *
 * Usage:
 *   const { state, run, reset } = useAsyncState<MyQuery, MyResult>(initialQuery);
 *   run(query, async (q) => fetchSomething(q));
 */
export function useAsyncState<TQuery, TResult>(initialQuery: TQuery) {
  const [state, setState] = useState<RemoteData<TQuery, TResult>>({
    status: "idle",
    query: initialQuery,
  });

  /**
   * Start an async operation. Transitions through loading → success | error.
   * `fn` receives the query and should resolve with the result or throw.
   */
  const run = useCallback((query: TQuery, fn: RunFn<TQuery, TResult>) => {
    setState({ status: "loading", query });

    fn(query).then(
      (data) => setState({ status: "success", query, data }),
      (err: unknown) => {
        const message =
          err instanceof Error ? err.message : "An unknown error occurred.";
        setState({ status: "error", query, message });
      },
    );
  }, []);

  /** Reset back to idle, optionally with a new query value. */
  const reset = useCallback(
    (query: TQuery = initialQuery) => {
      setState({ status: "idle", query });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return { state, run, reset };
}
