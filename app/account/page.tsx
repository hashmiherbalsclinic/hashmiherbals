import Link from "next/link";
import { redirect } from "next/navigation";
import { AccountProfileForm } from "@/components/auth/AccountProfileForm";
import { getCustomerProfile } from "@/lib/auth/customer";
import { formatPrice, siteConfig } from "@/lib/catalog";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "My account",
  description: `Manage your ${siteConfig.name} profile and orders.`,
};

type OrderRow = {
  id: string;
  order_number: string;
  status: string;
  total: number;
  created_at: string;
};

export default async function AccountPage() {
  const { user, profile } = await getCustomerProfile();
  if (!user) redirect("/login?next=/account");

  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("id, order_number, status, total, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const list = (orders as OrderRow[] | null) ?? [];

  return (
    <div className="bg-[#FAF8F5]">
      <div className="mx-auto max-w-3xl px-6 py-14 sm:py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1B4332]/65">
          Account
        </p>
        <h1 className="font-display mt-2 text-3xl font-bold text-[#1B4332] sm:text-4xl">
          Welcome{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}
        </h1>
        <p className="mt-2 text-sm text-stone-600">
          Manage your profile and track COD orders.
        </p>

        <div className="mt-10 space-y-8">
          {profile ? (
            <AccountProfileForm profile={profile} />
          ) : (
            <div className="rounded-3xl border border-stone-200 bg-white p-6 text-sm text-stone-600">
              Profile is still syncing. Refresh in a moment, or{" "}
              <Link href="/contact" className="font-semibold text-[#1B4332] hover:underline">
                contact us
              </Link>
              .
            </div>
          )}

          <section className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-xl font-bold text-[#1B4332]">Your orders</h2>
              <Link
                href="/shop"
                className="text-sm font-semibold text-[#1B4332] hover:underline"
              >
                Continue shopping →
              </Link>
            </div>

            {list.length === 0 ? (
              <p className="mt-6 text-sm text-stone-500">
                No orders yet. Browse the shop and checkout with Cash on Delivery.
              </p>
            ) : (
              <ul className="mt-6 divide-y divide-stone-100">
                {list.map((order) => (
                  <li
                    key={order.id}
                    className="flex flex-wrap items-center justify-between gap-3 py-4"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#1B4332]">
                        {order.order_number}
                      </p>
                      <p className="mt-0.5 text-xs text-stone-500">
                        {new Date(order.created_at).toLocaleDateString("en-PK", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-[#1B4332]">
                        {formatPrice(Number(order.total))}
                      </p>
                      <p className="mt-0.5 text-xs capitalize text-stone-500">{order.status}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
