"use client";

import { Package, Search, X } from "lucide-react";
import {
  useEffect,
  useId,
  useRef,
  useState,
  useTransition,
  type FormEvent,
} from "react";
import { trackOrder, type TrackOrderResult } from "@/lib/orders/track-order";
import { formatPrice, siteConfig } from "@/lib/catalog";

const STATUS_COPY: Record<
  string,
  { label: string; hint: string; tone: string }
> = {
  pending: {
    label: "Pending confirmation",
    hint: "Our team will confirm your COD order shortly by phone or WhatsApp.",
    tone: "bg-amber-50 text-amber-800 border-amber-200",
  },
  confirmed: {
    label: "Confirmed",
    hint: "Your order is confirmed and being prepared for dispatch.",
    tone: "bg-emerald-50 text-emerald-800 border-emerald-200",
  },
  shipped: {
    label: "Shipped",
    hint: "Your package is with the courier. Keep your phone reachable for COD.",
    tone: "bg-sky-50 text-sky-800 border-sky-200",
  },
  delivered: {
    label: "Delivered",
    hint: "This order was marked delivered. Need help? WhatsApp us anytime.",
    tone: "bg-[#1B4332]/10 text-[#1B4332] border-[#1B4332]/20",
  },
  cancelled: {
    label: "Cancelled",
    hint: "This order was cancelled. Contact us if this was unexpected.",
    tone: "bg-rose-50 text-rose-800 border-rose-200",
  },
};

export function TrackOrderWidget() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TrackOrderResult | null>(null);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const titleId = useId();
  const whatsappHref = `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(
    "Assalamualaikum! I need help tracking my order."
  )}`;

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    startTransition(async () => {
      const res = await trackOrder(query);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setResult(res.order);
    });
  };

  const statusMeta = result ? STATUS_COPY[result.status] : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#1B4332] text-white shadow-lg transition hover:scale-105 hover:bg-[#143326]"
        aria-label="Track your order"
      >
        <Package className="h-6 w-6" aria-hidden />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
          <button
            type="button"
            className="absolute inset-0 bg-stone-900/40 backdrop-blur-[2px]"
            aria-label="Close track order"
            onClick={() => setOpen(false)}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-stone-200/80 bg-[#FAF8F5] shadow-2xl"
          >
            <div className="flex items-start justify-between gap-3 border-b border-stone-200/80 bg-white px-5 py-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#1B4332]/65">
                  Hashmi Herbals
                </p>
                <h2 id={titleId} className="font-display mt-1 text-xl font-bold text-[#1C1917]">
                  Track your order
                </h2>
                <p className="mt-1 text-sm text-stone-500">
                  Enter the order number from your confirmation email.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-500 transition hover:text-[#1B4332]"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={onSubmit} className="space-y-4 px-5 py-5">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-500">
                  Order number
                </span>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value.toUpperCase())}
                    placeholder="HH-XXXXXX"
                    autoComplete="off"
                    spellCheck={false}
                    className="h-12 w-full rounded-2xl border border-stone-200 bg-white pl-10 pr-4 text-sm font-medium tracking-wide text-[#1C1917] outline-none transition placeholder:font-normal placeholder:tracking-normal placeholder:text-stone-400 focus:border-[#1B4332]/40 focus:ring-2 focus:ring-[#1B4332]/15"
                  />
                </div>
              </label>

              <button
                type="submit"
                disabled={pending || !query.trim()}
                className="flex h-12 w-full items-center justify-center rounded-full bg-[#1B4332] text-sm font-semibold text-white transition hover:bg-[#143326] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pending ? "Checking..." : "Check status"}
              </button>

              {error && (
                <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </p>
              )}

              {result && statusMeta && (
                <div className="space-y-3 rounded-2xl border border-stone-200 bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-[#1C1917]">
                      {result.orderNumber}
                    </p>
                    <span
                      className={`rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${statusMeta.tone}`}
                    >
                      {statusMeta.label}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-stone-600">{statusMeta.hint}</p>
                  <div className="grid grid-cols-2 gap-3 border-t border-stone-100 pt-3 text-sm">
                    <div>
                      <p className="text-xs text-stone-400">Items</p>
                      <p className="font-semibold text-[#1C1917]">{result.itemCount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-stone-400">Total (COD)</p>
                      <p className="font-semibold text-[#1B4332]">
                        {formatPrice(result.total)}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-stone-400">Placed</p>
                      <p className="font-medium text-[#1C1917]">
                        {new Date(result.createdAt).toLocaleString("en-PK", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center text-sm font-medium text-[#1B4332] underline-offset-2 hover:underline"
              >
                Need help? Chat on WhatsApp
              </a>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
