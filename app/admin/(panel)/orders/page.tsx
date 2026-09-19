import Link from "next/link";
import { DeleteAllOrdersButton } from "@/components/admin/DeleteAllOrdersButton";
import { OrderStatusBadge } from "@/components/admin/StatusBadge";
import { formatPk, type OrderRow } from "@/lib/admin/types";
import { createClient } from "@/lib/supabase/server";

export default async function AdminOrdersPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  const orders = (data ?? []) as OrderRow[];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">{orders.length} orders</p>
        <DeleteAllOrdersButton orderCount={orders.length} />
      </div>

      {orders.length === 0 ? (
        <p className="rounded-2xl border border-[#d8e0d6] bg-white px-5 py-12 text-center text-sm text-muted shadow-sm">
          No orders yet.
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#d8e0d6] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-[#f3f6f2] text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-5 py-3 font-semibold">Order</th>
                  <th className="px-5 py-3 font-semibold">Customer</th>
                  <th className="px-5 py-3 font-semibold">Phone</th>
                  <th className="px-5 py-3 font-semibold">Total</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e8eee6]">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#f8faf7]">
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-semibold text-[#1f5c45] hover:underline"
                      >
                        {order.order_number}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-[#0f2a22]">
                      {order.customer_name}
                    </td>
                    <td className="px-5 py-3 text-muted">{order.phone}</td>
                    <td className="px-5 py-3 font-medium">
                      {formatPk(order.total)}
                    </td>
                    <td className="px-5 py-3">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-5 py-3 text-muted">
                      {new Date(order.created_at).toLocaleDateString("en-PK", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
