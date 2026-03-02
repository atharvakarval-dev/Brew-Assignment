"use client";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps): JSX.Element {
  return (
    <div className="rounded-card border border-destructive/35 bg-destructive/10 p-4">
      <p className="text-sm leading-relaxed text-destructive-foreground/85">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 min-h-[44px] rounded-button border border-destructive/50 bg-destructive/20 px-4 py-2 text-sm font-semibold text-destructive-foreground transition hover:bg-destructive/30"
        >
          Retry
        </button>
      ) : null}
    </div>
  );
}
