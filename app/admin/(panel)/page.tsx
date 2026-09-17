import Link from "next/link";
import {
  MessageSquare,
  Newspaper,
  Package,
  ShoppingBag,
} from "lucide-react";
import { OrderStatusBadge } from "@/components/admin/StatusBadge";
import { formatPk, type OrderRow } from "@/lib/admin/types";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [
    productsRes,
    ordersRes,
    pendingRes,
    blogsRes,
    messagesRes,
    recentOrdersRes,
  ] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase.from("blog_posts").select("*", { count: "exact", head: true }),
    supabase
      .from("contact_messages")
      .select("*", { count: "exact", head: true })
      .eq("status", "new"),
    supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const stats = [
    {
      label: "Products",
      value: productsRes.count ?? 0,
      href: "/admin/products",
      icon: Package,
      hint: "In catalog",
    },
    {
      label: "Orders",
      value: ordersRes.count ?? 0,
      href: "/admin/orders",
      icon: ShoppingBag,
      hint: `${pendingRes.count ?? 0} pending`,
    },
    {
      label: "Blog posts",
      value: blogsRes.count ?? 0,
      href: "/admin/blogs",
      icon: Newspaper,
      hint: "Articles",
    },
    {
      label: "New messages",
      value: messagesRes.count ?? 0,
      href: "/admin/messages",
      icon: MessageSquare,
      hint: "Unread inbox",
    },
  ];

  const recent = (recentOrdersRes.data ?? []) as OrderRow[];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, href, icon: Icon, hint }) => (
          <Link
            key={label}
            href={href}
            className="group rounded-2xl border border-[#d8e0d6] bg-white p-5 shadow-sm transition hover:border-[#74a13a]/50 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted">{label}</p>
                <p className="font-display mt-2 text-3xl font-bold text-[#0f2a22]">
                  {value}
                </p>
                <p className="mt-1 text-xs text-muted">{hint}</p>
              </div>
              <span className="rounded-xl bg-[#1f5c45]/10 p-2.5 text-[#1f5c45] transition group-hover:bg-[#74a13a] group-hover:text-white">
                <Icon className="h-5 w-5" />
              </span>
            </div>
          </Link>
        ))}
      </div>

      <section className="rounded-2xl border border-[#d8e0d6] bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#d8e0d6] px-5 py-4">
          <h2 className="font-display text-lg font-bold text-[#0f2a22]">
            Recent orders
          </h2>
          <Link
            href="/admin/orders"
            className="text-sm font-semibold text-[#1f5c45] hover:text-[#74a13a]"
          >
            View all
          </Link>
        </div>

        {recent.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted">
            No orders yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-[#f3f6f2] text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-5 py-3 font-semibold">Order</th>
                  <th className="px-5 py-3 font-semibold">Customer</th>
                  <th className="px-5 py-3 font-semibold">Total</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e8eee6]">
                {recent.map((order) => (
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
        )}
      </section>
    </div>
  );
}
