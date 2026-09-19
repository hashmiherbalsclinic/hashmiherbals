"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { deleteAllOrders } from "@/lib/admin/order-actions";

type Props = {
  orderCount: number;
};

export function DeleteAllOrdersButton({ orderCount }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [understood, setUnderstood] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setStep(1);
    setUnderstood(false);
    setConfirmText("");
    setPassword("");
    setError(null);
  }

  function close() {
    if (loading) return;
    setOpen(false);
    reset();
  }

  async function onFinalDelete() {
    if (confirmText !== "DELETE ALL ORDERS" || !password.trim()) return;
    setLoading(true);
    setError(null);
    const result = await deleteAllOrders(password);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    close();
    router.refresh();
  }

  if (orderCount === 0) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => {
          reset();
          setOpen(true);
        }}
        className="inline-flex items-center gap-2 rounded-xl border border-rose-300 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
      >
        <AlertTriangle className="h-4 w-4" />
        Delete all orders
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-stone-900/50"
            aria-label="Close"
            onClick={close}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-all-orders-title"
            className="relative w-full max-w-md rounded-2xl border border-rose-200 bg-white p-6 shadow-2xl"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-100 text-rose-700">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h2
              id="delete-all-orders-title"
              className="mt-4 text-lg font-bold text-[#0f2a22]"
            >
              {step === 1
                ? `Delete all ${orderCount} orders?`
                : "Confirm with password"}
            </h2>

            {step === 1 ? (
              <>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">
                  This permanently deletes every order and its line items. Customer
                  history cannot be recovered. This cannot be undone.
                </p>
                <label className="mt-4 flex items-start gap-3 rounded-xl border border-rose-100 bg-rose-50/60 px-3 py-3 text-sm text-rose-900">
                  <input
                    type="checkbox"
                    checked={understood}
                    onChange={(e) => setUnderstood(e.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-rose-600"
                  />
                  <span>
                    I understand this will permanently delete all {orderCount}{" "}
                    orders and cannot be undone.
                  </span>
                </label>
                <div className="mt-5 flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    onClick={close}
                    className="rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!understood}
                    onClick={() => {
                      setError(null);
                      setStep(2);
                    }}
                    className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Continue
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">
                  Final confirmation: type{" "}
                  <span className="font-semibold text-rose-700">
                    DELETE ALL ORDERS
                  </span>{" "}
                  and enter your admin password.
                </p>

                <label className="mt-4 block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-500">
                    Confirmation phrase
                  </span>
                  <input
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="DELETE ALL ORDERS"
                    autoComplete="off"
                    className="h-11 w-full rounded-xl border border-stone-200 px-3 text-sm outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                  />
                </label>

                <label className="mt-3 block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-500">
                    Admin password
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Your admin account password"
                    autoComplete="current-password"
                    className="h-11 w-full rounded-xl border border-stone-200 px-3 text-sm outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                  />
                </label>

                {error && (
                  <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                    {error}
                  </p>
                )}

                <div className="mt-5 flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => {
                      setStep(1);
                      setError(null);
                      setPassword("");
                    }}
                    className="rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-60"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={
                      loading ||
                      confirmText !== "DELETE ALL ORDERS" ||
                      !password.trim()
                    }
                    onClick={onFinalDelete}
                    className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "Deleting…" : "Delete everything"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
