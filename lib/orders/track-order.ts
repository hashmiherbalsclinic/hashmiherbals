"use server";

import { createClient } from "@/lib/supabase/server";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/admin/types";

export type TrackOrderResult = {
  orderNumber: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
  itemCount: number;
};

export async function trackOrder(orderNumberInput: string): Promise<
  | { ok: true; order: TrackOrderResult }
  | { ok: false; error: string }
> {
  const orderNumber = orderNumberInput.trim().toUpperCase();
  if (!orderNumber || orderNumber.length < 6) {
    return { ok: false, error: "Enter a valid order number (e.g. HH-XXXXXX)." };
  }
  if (!/^HH-[A-Z0-9]+$/i.test(orderNumber)) {
    return {
      ok: false,
      error: "Order numbers look like HH-MU81MBZE. Check and try again.",
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_order_tracking", {
    p_order_number: orderNumber,
  });

  if (error) {
    console.error("trackOrder rpc failed", error);
    return { ok: false, error: "Could not look up this order. Please try again." };
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row?.order_number) {
    return { ok: false, error: "No order found with that number." };
  }

  const status = String(row.status || "pending") as OrderStatus;
  if (!ORDER_STATUSES.includes(status)) {
    return { ok: false, error: "Order found, but status is unavailable." };
  }

  return {
    ok: true,
    order: {
      orderNumber: String(row.order_number),
      status,
      total: Number(row.total) || 0,
      createdAt: String(row.created_at),
      itemCount: Number(row.item_count) || 0,
    },
  };
}
