"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateOrderStatus } from "@/lib/admin/actions";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/admin/types";

export function OrderStatusSelect({
  orderId,
  status,
}: {
  orderId: string;
  status: OrderStatus;
}) {
  const router = useRouter();
  const [value, setValue] = useState<OrderStatus>(status);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  async function onChange(next: OrderStatus) {
    if (next === value) return;
    const previous = value;
    setValue(next);
    setLoading(true);
    setError(null);
    setNote(null);

    const result = await updateOrderStatus(orderId, next);
    setLoading(false);

    if (result.error) {
      setError(result.error);
      setValue(previous);
      return;
    }

    if (result.warning) {
      setNote(result.warning);
    } else {
      setNote("Status updated · customer emailed");
    }
    router.refresh();
  }

  return (
    <div>
      <select
        value={value}
        disabled={loading}
        onChange={(e) => onChange(e.target.value as OrderStatus)}
        className="rounded-xl border border-[#d8e0d6] bg-white px-3.5 py-2.5 text-sm font-medium outline-none transition focus:border-[#74a13a] focus:ring-2 focus:ring-[#74a13a]/25 disabled:opacity-60"
      >
        {ORDER_STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}
      {loading && <p className="mt-2 text-xs text-muted">Updating &amp; emailing…</p>}
      {!loading && note && <p className="mt-2 text-xs text-[#1f5c45]">{note}</p>}
    </div>
  );
}
