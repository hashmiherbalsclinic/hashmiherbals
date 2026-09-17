import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderStatusSelect } from "@/components/admin/OrderStatusSelect";
import { OrderStatusBadge } from "@/components/admin/StatusBadge";
import {
  formatPk,
  type OrderItemRow,
  type OrderRow,
} from "@/lib/admin/types";
import { createClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ id: string }> };

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!order) notFound();

  const { data: items } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", id)
    .order("id");

  const row = order as OrderRow;
  const lineItems = (items ?? []) as OrderItemRow[];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link
        href="/admin/orders"
        className="text-sm font-semibold text-[#1f5c45] hover:underline"
      >
        ← Back to orders
      </Link>

      <div className="rounded-2xl border border-[#d8e0d6] bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-display text-2xl font-bold text-[#0f2a22]">
              {row.order_number}
            </p>
            <p className="mt-1 text-sm text-muted">
              {new Date(row.created_at).toLocaleString("en-PK")}
            </p>
            <div className="mt-3">
              <OrderStatusBadge status={row.status} />
            </div>
          </div>
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
              Update status
            </p>
            <OrderStatusSelect orderId={row.id} status={row.status} />
          </div>
        </div>

        <div className="mt-6 grid gap-6 border-t border-[#e8eee6] pt-6 sm:grid-cols-2">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
              Customer
            </h3>
            <p className="mt-2 font-semibold text-[#0f2a22]">{row.customer_name}</p>
            {row.customer_email && (
              <p className="mt-1 text-sm text-muted">
                <a href={`mailto:${row.customer_email}`} className="hover:text-[#1f5c45]">
                  {row.customer_email}
                </a>
              </p>
            )}
            <p className="mt-1 text-sm text-muted">{row.phone}</p>
            <p className="mt-3 text-sm leading-relaxed text-[#0f2a22]">
              {row.address}
              {row.city ? `, ${row.city}` : ""}
            </p>
            {row.notes && (
              <p className="mt-3 rounded-xl bg-[#f3f6f2] px-3 py-2 text-sm text-muted">
                Note: {row.notes}
              </p>
            )}
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
              Payment
            </h3>
            <dl className="mt-2 space-y-1.5 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Method</dt>
                <dd className="font-medium capitalize">{row.payment_method}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Subtotal</dt>
                <dd className="font-medium">{formatPk(row.subtotal)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Shipping</dt>
                <dd className="font-medium">{formatPk(row.shipping_fee)}</dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-[#e8eee6] pt-2 text-base">
                <dt className="font-semibold text-[#0f2a22]">Total</dt>
                <dd className="font-bold text-[#1f5c45]">{formatPk(row.total)}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#d8e0d6] bg-white shadow-sm">
        <div className="border-b border-[#d8e0d6] px-5 py-4">
          <h2 className="font-display text-lg font-bold text-[#0f2a22]">Items</h2>
        </div>
        {lineItems.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted">No line items.</p>
        ) : (
          <ul className="divide-y divide-[#e8eee6]">
            {lineItems.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-4 px-5 py-4"
              >
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[#f3f6f2]">
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-[#0f2a22]">{item.product_title}</p>
                  <p className="text-xs text-muted">
                    {item.size_label ? `${item.size_label} · ` : ""}
                    Qty {item.quantity} · {formatPk(item.unit_price)} each
                  </p>
                </div>
                <p className="font-semibold text-[#0f2a22]">
                  {formatPk(item.unit_price * item.quantity)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
