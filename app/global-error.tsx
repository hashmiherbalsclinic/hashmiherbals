"use client";

import "./globals.css";
import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { logAppError, toUserFacingError } from "@/lib/errors/user-message";

/**
 * Replaces the root layout when it crashes.
 * Must define its own <html> and <body>.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const message = toUserFacingError(error, "customer");

  useEffect(() => {
    logAppError("global-error", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-dvh bg-[#fafaf8] font-sans text-[#0f2a22] antialiased">
        <div className="flex min-h-dvh items-center justify-center px-4 py-16">
          <div className="w-full max-w-lg rounded-2xl border border-[#d8e0d6] bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1f5c45]/10 text-[#1f5c45]">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <h1 className="mt-5 text-2xl font-bold tracking-tight">
              Hashmi Herbals
            </h1>
            <p className="mt-2 text-lg font-semibold">Something went wrong</p>
            <p className="mt-3 text-sm leading-relaxed text-stone-600">{message}</p>
            {error.digest && (
              <p className="mt-3 font-mono text-[11px] text-stone-400">
                Ref: {error.digest}
              </p>
            )}
            <button
              type="button"
              onClick={reset}
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#1f5c45] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#174a37]"
            >
              <RefreshCw className="h-4 w-4" />
              Reload page
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
