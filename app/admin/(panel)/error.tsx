"use client";

import { RouteError } from "@/components/errors/RouteError";

/** Catches errors inside the admin panel segment (dashboard, blogs, etc.). */
export default function AdminPanelError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <RouteError error={error} reset={reset} variant="admin" />;
}
