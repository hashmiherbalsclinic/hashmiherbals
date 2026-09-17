"use client";

import { useState } from "react";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";
import type { Product } from "@/lib/catalog";

type Props = {
  bestsellers: Product[];
  newArrivals: Product[];
};

export function CuratedProducts({ bestsellers, newArrivals }: Props) {
  const [tab, setTab] = useState<"bestsellers" | "new">("bestsellers");
  const products = tab === "bestsellers" ? bestsellers : newArrivals;
  const emptyCopy =
    tab === "bestsellers"
      ? "Bestselling formulations arriving soon — join the waitlist via contact."
      : "New formulations arriving soon — join the waitlist via contact.";

  return (
    <section className="relative overflow-hidden bg-[#F4F1EA] py-20">
      <div
        aria-hidden
        className="absolute -right-20 top-10 -z-10 h-96 w-96 rounded-full bg-emerald-900/5 blur-3xl"
      />
      <div className="relative mx-auto max-w-[1280px] px-4 sm:px-8 lg:px-12 xl:px-16">
        <Reveal>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#1B4332]/65">
                The Apothecary
              </p>
              <h2 className="font-display mt-2 text-3xl font-bold text-[#141414] sm:text-4xl">
                Curated Formulations
              </h2>
            </div>
            <div className="inline-flex rounded-full border border-stone-200/80 bg-white p-1 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
              <button
                type="button"
                onClick={() => setTab("bestsellers")}
                className={`h-11 min-h-11 rounded-full px-4 text-sm font-semibold transition sm:px-5 ${
                  tab === "bestsellers"
                    ? "bg-[#1B4332] text-white shadow-sm"
                    : "text-[#3d4a42] hover:text-[#1B4332]"
                }`}
              >
                Bestselling Formulations
              </button>
              <button
                type="button"
                onClick={() => setTab("new")}
                className={`h-11 min-h-11 rounded-full px-4 text-sm font-semibold transition sm:px-5 ${
                  tab === "new"
                    ? "bg-[#1B4332] text-white shadow-sm"
                    : "text-[#3d4a42] hover:text-[#1B4332]"
                }`}
              >
                Fresh In The Apothecary
              </button>
            </div>
          </div>
        </Reveal>

        <div className="mt-10 rounded-2xl border border-stone-200/80 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] sm:p-8">
          {products.length === 0 ? (
            <div className="px-2 py-8 text-center sm:px-6">
              <p className="font-display text-2xl font-bold text-[#1B4332]">
                New formulations arriving soon
              </p>
              <p className="mx-auto mt-2 max-w-md text-sm text-[#6b7280]">{emptyCopy}</p>
              <Link
                href="/contact"
                className="mt-6 inline-flex h-12 min-h-12 items-center rounded-full bg-[#1B4332] px-6 text-sm font-semibold text-white transition hover:bg-[#143528]"
              >
                Join the waitlist
              </Link>
              <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse overflow-hidden rounded-2xl border border-stone-200/80 bg-[#F4F1EA]"
                  >
                    <div className="aspect-[4/5] bg-[#EDE8DE]" />
                    <div className="space-y-2 p-4">
                      <div className="h-3 w-1/3 rounded bg-[#EDE8DE]" />
                      <div className="h-4 w-[80%] rounded bg-[#EDE8DE]" />
                      <div className="h-3 w-2/3 rounded bg-[#EDE8DE]" />
                      <div className="mt-3 h-10 rounded-full bg-[#EDE8DE]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
              {products.map((p, i) => (
                <Reveal key={`${tab}-${p.id}`} delay={i * 0.08}>
                  <ProductCard product={p} />
                </Reveal>
              ))}
            </div>
          )}

          <div className="mt-8 text-center">
            <Link
              href="/shop"
              className="inline-flex h-12 min-h-12 items-center rounded-full border border-stone-200/80 bg-white px-6 text-sm font-semibold text-[#1B4332] transition hover:border-[#1B4332]/30"
            >
              Browse full collection →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
