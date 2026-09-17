import Link from "next/link";
import { Plus } from "lucide-react";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { ActiveBadge } from "@/components/admin/StatusBadge";
import { formatPk, type ProductRow } from "@/lib/admin/types";
import { createClient } from "@/lib/supabase/server";

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  const products = (data ?? []) as ProductRow[];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">{products.length} products</p>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-xl bg-[#1f5c45] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#174a37]"
        >
          <Plus className="h-4 w-4" />
          Add product
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="rounded-2xl border border-[#d8e0d6] bg-white px-5 py-12 text-center text-sm text-muted shadow-sm">
          No products yet. Create your first product.
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#d8e0d6] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="bg-[#f3f6f2] text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-5 py-3 font-semibold">Product</th>
                  <th className="px-5 py-3 font-semibold">Category</th>
                  <th className="px-5 py-3 font-semibold">Price</th>
                  <th className="px-5 py-3 font-semibold">Stock</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e8eee6]">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-[#f8faf7]">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-[#f3f6f2]">
                          {p.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={p.image}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[10px] text-muted">
                              N/A
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-[#0f2a22]">
                            {p.title}
                          </p>
                          <p className="truncate text-xs text-muted">{p.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 capitalize text-[#0f2a22]">
                      {p.category.replace(/-/g, " ")}
                    </td>
                    <td className="px-5 py-3 font-medium">{formatPk(p.price)}</td>
                    <td className="px-5 py-3">{p.stock}</td>
                    <td className="px-5 py-3">
                      <ActiveBadge active={p.active} />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/products/${p.id}`}
                          className="rounded-lg border border-[#d8e0d6] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#1f5c45] hover:bg-[#f3f6f2]"
                        >
                          Edit
                        </Link>
                        <DeleteButton
                          table="products"
                          id={p.id}
                          confirmMessage={`Delete “${p.title}”?`}
                        />
                      </div>
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
