import type { OrderStatus } from "@/lib/admin/types";

const ORDER_STYLES: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-sky-100 text-sky-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-rose-100 text-rose-800",
};

const MESSAGE_STYLES: Record<string, string> = {
  new: "bg-amber-100 text-amber-800",
  read: "bg-slate-100 text-slate-700",
  replied: "bg-sky-100 text-sky-800",
  archived: "bg-zinc-100 text-zinc-600",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${ORDER_STYLES[status]}`}
    >
      {status}
    </span>
  );
}

export function MessageStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
        MESSAGE_STYLES[status] ?? "bg-slate-100 text-slate-700"
      }`}
    >
      {status}
    </span>
  );
}

export function ActiveBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        active ? "bg-emerald-100 text-emerald-800" : "bg-zinc-100 text-zinc-600"
      }`}
    >
      {active ? "Active" : "Hidden"}
    </span>
  );
}

export function PublishedBadge({ published }: { published: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        published ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
      }`}
    >
      {published ? "Published" : "Draft"}
    </span>
  );
}
