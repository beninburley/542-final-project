/**
 * StatusView — renders a contextual message for each async state variant.
 *
 * Accepts a discriminated-union prop so each variant's required fields
 * are enforced at compile time.
 */

type StatusViewProps =
  | { variant: "idle"; message?: string }
  | { variant: "loading"; message?: string }
  | { variant: "error"; message: string; onRetry?: () => void }
  | { variant: "empty"; message?: string };

export default function StatusView(props: StatusViewProps) {
  switch (props.variant) {
    case "idle":
      return (
        <p className="status-view status-view--idle">
          {props.message ?? "Enter a search to get started."}
        </p>
      );

    case "loading":
      return (
        <p className="status-view status-view--loading" aria-live="polite">
          {props.message ?? "Loading…"}
        </p>
      );

    case "error":
      return (
        <div className="status-view status-view--error" role="alert">
          <p>
            <strong>Error:</strong> {props.message}
          </p>
          {props.onRetry && (
            <button onClick={props.onRetry} className="btn btn--secondary">
              Try again
            </button>
          )}
        </div>
      );

    case "empty":
      return (
        <p className="status-view status-view--empty">
          {props.message ?? "No results found."}
        </p>
      );
  }
}
