"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Construction } from "lucide-react";
import { updateMaintenanceMode } from "@/lib/admin/site-settings-actions";

export function MaintenanceToggle({ initialEnabled }: { initialEnabled: boolean }) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(initialEnabled);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function onToggle(next: boolean) {
    setError(null);
    setSaved(false);
    const prev = enabled;
    setEnabled(next);

    startTransition(async () => {
      const result = await updateMaintenanceMode(next);
      if (!result.ok) {
        setEnabled(prev);
        setError(result.error);
        return;
      }
      setSaved(true);
      router.refresh();
    });
  }

  return (
    <div className="rounded-2xl border border-[#d8e0d6] bg-white p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f3f6f2] text-[#1f5c45]">
          <Construction className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold text-[#0f2a22]">
            Website lock
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-[#5a6b63]">
            When enabled, visitors see an under-construction page. Admin panel
            stays available so you can manage the site and turn this off.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-4">
            <button
              type="button"
              role="switch"
              aria-checked={enabled}
              disabled={pending}
              onClick={() => onToggle(!enabled)}
              className={`relative h-8 w-14 shrink-0 rounded-full transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#74a13a] disabled:opacity-60 ${
                enabled ? "bg-[#c45c3a]" : "bg-[#c5cec3]"
              }`}
            >
              <span
                className={`absolute top-1 left-1 h-6 w-6 rounded-full bg-white shadow transition ${
                  enabled ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
            <div>
              <p className="text-sm font-medium text-[#0f2a22]">
                {enabled ? "Site is locked" : "Site is live"}
              </p>
              <p className="text-xs text-[#5a6b63]">
                {pending
                  ? "Saving…"
                  : saved
                    ? "Saved"
                    : enabled
                      ? "Storefront shows under construction"
                      : "Everyone can browse normally"}
              </p>
            </div>
          </div>

          {error && (
            <p className="mt-3 text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
