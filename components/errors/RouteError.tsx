"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertTriangle, Home, RefreshCw, Shield } from "lucide-react";
import { logAppError, toUserFacingError } from "@/lib/errors/user-message";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
  variant?: "store" | "admin";
};

export function RouteError({ error, reset, variant = "store" }: Props) {
  const isAdmin = variant === "admin";
  const message = toUserFacingError(error, isAdmin ? "admin" : "customer");

  useEffect(() => {
    logAppError(isAdmin ? "admin-error-boundary" : "store-error-boundary", error);
  }, [error, isAdmin]);

  return (
    <div
      className={`flex min-h-[60vh] items-center justify-center px-4 py-16 ${
        isAdmin ? "bg-[#f3f6f2]" : "bg-[#fafaf8]"
      }`}
    >
      <div className="w-full max-w-lg rounded-2xl border border-[#d8e0d6] bg-white p-8 text-center shadow-sm">
        <div
          className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${
            isAdmin ? "bg-[#1f5c45]/10 text-[#1f5c45]" : "bg-[#1f5c45]/10 text-[#1f5c45]"
          }`}
        >
          {isAdmin ? (
            <Shield className="h-7 w-7" />
          ) : (
            <AlertTriangle className="h-7 w-7" />
          )}
        </div>

        <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#1f5c45]/70">
          {isAdmin ? "Admin" : "Hashmi Herbals"}
        </p>
        <h1 className="font-display mt-2 text-3xl font-bold text-[#0f2a22]">
          {isAdmin ? "Something went wrong" : "We hit a snag"}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-stone-600">{message}</p>

        {error.digest && (
          <p className="mt-3 font-mono text-[11px] text-stone-400">
            Ref: {error.digest}
          </p>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1f5c45] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#174a37]"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
          <Link
            href={isAdmin ? "/admin" : "/"}
            className="inline-flex items-center gap-2 rounded-xl border border-[#d8e0d6] bg-white px-5 py-2.5 text-sm font-semibold text-[#0f2a22] transition hover:bg-[#f3f6f2]"
          >
            <Home className="h-4 w-4" />
            {isAdmin ? "Admin home" : "Go home"}
          </Link>
        </div>

        {!isAdmin && (
          <p className="mt-6 text-xs text-stone-500">
            Need help? Message us on WhatsApp from the contact page.
          </p>
        )}
      </div>
    </div>
  );
}
