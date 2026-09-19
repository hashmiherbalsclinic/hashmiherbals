"use client";

import { toUserFacingError } from "@/lib/errors/user-message";

/** Inline banner for forms / client actions. */
export function ErrorAlert({
  error,
  audience = "customer",
  onDismiss,
}: {
  error: string | null | undefined;
  audience?: "customer" | "admin";
  onDismiss?: () => void;
}) {
  if (!error) return null;
  const message = toUserFacingError(error, audience);

  return (
    <div
      role="alert"
      className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="leading-relaxed">{message}</p>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="shrink-0 text-xs font-semibold uppercase tracking-wide text-rose-600 hover:text-rose-800"
          >
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
}
