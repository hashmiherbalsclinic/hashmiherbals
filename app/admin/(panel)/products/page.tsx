import Link from "next/link";
import { Plus } from "lucide-react";
import { DeleteAllProductsButton } from "@/components/admin/DeleteAllProductsButton";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { ActiveBadge } from "@/components/admin/StatusBadge";
import { categories } from "@/lib/catalog";
import { formatPk, PRODUCT_CATEGORIES, type ProductRow } from "@/lib/admin/types";
import { createClient } from "@/lib/supabase/server";

type Props = {
  searchParams?: Promise<{ category?: string }>;
};

export default async function AdminProductsPage({ searchParams }: Props) {
  const params = (await searchParams) ?? {};
  const categoryParam = params.category?.trim() || "";
  const activeCategory = PRODUCT_CATEGORIES.includes(
    categoryParam as (typeof PRODUCT_CATEGORIES)[number]
  )
    ? categoryParam
    : "";

  const supabase = await createClient();
  const [{ count: totalCount }, listRes] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    (async () => {
      let query = supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      if (activeCategory) query = query.eq("category", activeCategory);
      return query;
    })(),
  ]);

  const products = (listRes.data ?? []) as ProductRow[];
  const allProductCount = totalCount ?? 0;

  const categoryLabel = (id: string) =>
    categories.find((c) => c.id === id)?.name ?? id.replace(/-/g, " ");

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          {products.length} product{products.length === 1 ? "" : "s"}
          {activeCategory ? (
            <span className="text-[#1f5c45]">
              {" "}
              in {categoryLabel(activeCategory)}
            </span>
          ) : null}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <DeleteAllProductsButton productCount={allProductCount} />
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 rounded-xl bg-[#1f5c45] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#174a37]"
          >
            <Plus className="h-4 w-4" />
            Add product
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/admin/products"
          className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
            !activeCategory
              ? "bg-[#1f5c45] text-white"
              : "border border-[#d8e0d6] bg-white text-[#0f2a22] hover:bg-[#f3f6f2]"
          }`}
        >
          All
        </Link>
        {PRODUCT_CATEGORIES.map((id) => {
          const selected = activeCategory === id;
          return (
            <Link
              key={id}
              href={`/admin/products?category=${id}`}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize transition ${
                selected
                  ? "bg-[#1f5c45] text-white"
                  : "border border-[#d8e0d6] bg-white text-[#0f2a22] hover:bg-[#f3f6f2]"
              }`}
            >
              {categoryLabel(id)}
            </Link>
          );
        })}
      </div>

      {products.length === 0 ? (
        <p className="rounded-2xl border border-[#d8e0d6] bg-white px-5 py-12 text-center text-sm text-muted shadow-sm">
          {activeCategory
            ? `No products in ${categoryLabel(activeCategory)}.`
            : "No products yet. Create your first product."}
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
                      {categoryLabel(p.category)}
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
