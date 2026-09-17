"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  categories,
  formatPrice,
  type CategoryId,
  type Product,
} from "@/lib/catalog";
import { fetchProductsClient } from "@/lib/products-client";

type Props = {
  onNavigate?: () => void;
};

export function ShopMegaMenu({ onNavigate }: Props) {
  const [activeId, setActiveId] = useState<CategoryId>(categories[0].id);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const active = useMemo(
    () => categories.find((c) => c.id === activeId) ?? categories[0],
    [activeId]
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchProductsClient({ category: activeId, limit: 8 }).then((list) => {
      if (!cancelled) {
        setProducts(list);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [activeId]);

  return (
    <div className="overflow-hidden rounded-b-2xl border border-t-0 border-black/[0.06] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.12)]">
      <div className="grid min-h-[22rem] lg:grid-cols-[14rem_1fr_16rem]">
        <aside className="border-b border-black/[0.06] bg-[#f6f4ef] px-5 py-6 lg:border-b-0 lg:border-r">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#1f4d3a]">
            Categories
          </p>
          <ul className="mt-4 space-y-1">
            {categories.map((c) => {
              const selected = c.id === activeId;
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => setActiveId(c.id)}
                    className={`w-full px-1 py-2 text-left text-sm transition ${
                      selected
                        ? "font-semibold text-[#1f4d3a] underline decoration-[#1f4d3a] underline-offset-4"
                        : "text-[#1f4d3a]/85 hover:text-[#1f4d3a]"
                    }`}
                  >
                    {c.name}
                  </button>
                </li>
              );
            })}
            <li className="pt-2">
              <Link
                href="/shop"
                onClick={onNavigate}
                className="inline-block px-1 py-2 text-sm font-semibold text-[#1f4d3a] underline-offset-4 hover:underline"
              >
                Shop all
              </Link>
            </li>
          </ul>
        </aside>

        <div className="px-6 py-6 sm:px-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#1f4d3a]">
            {active.name}
          </p>
          {loading ? (
            <p className="mt-6 text-sm text-muted">Loading...</p>
          ) : products.length === 0 ? (
            <p className="mt-6 text-sm text-muted">No products in this category yet.</p>
          ) : (
            <ul className="mt-5 grid gap-1 sm:grid-cols-2">
              {products.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/shop/${p.slug}`}
                    onClick={onNavigate}
                    className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition hover:bg-[#f6f4ef]"
                  >
                    <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[#f3efe6]">
                      <Image
                        src={p.image || "/images/categories/oils.webp"}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-[#163528]">
                        {p.title}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted">
                        {formatPrice(p.price)}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Link
            href={active.href}
            onClick={onNavigate}
            className="mt-6 inline-flex text-sm font-semibold text-[#1f4d3a] hover:underline"
          >
            View all {active.name} →
          </Link>
        </div>

        <div className="hidden border-t border-black/[0.06] p-5 lg:block lg:border-l lg:border-t-0">
          <Link href={active.href} onClick={onNavigate} className="group block h-full">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#f3efe6]">
              <Image
                src={active.image}
                alt={active.name}
                fill
                className="object-cover transition duration-500 group-hover:scale-[1.03]"
                sizes="256px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
              <p className="absolute bottom-4 left-4 right-4 text-sm font-semibold text-white">
                Shop {active.name} →
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
