"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";
import type { Product } from "@/lib/catalog";

type Tab = "bestsellers" | "new";

type Props = {
  bestsellers: Product[];
  newArrivals: Product[];
};

const tabs: { id: Tab; label: string; short: string }[] = [
  { id: "bestsellers", label: "Bestsellers", short: "Most loved" },
  { id: "new", label: "New arrivals", short: "Just in" },
];

export function CuratedProducts({ bestsellers, newArrivals }: Props) {
  const [tab, setTab] = useState<Tab>("bestsellers");
  const products = tab === "bestsellers" ? bestsellers : newArrivals;
  const emptyCopy =
    tab === "bestsellers"
      ? "Bestselling formulations arriving soon - join the waitlist via contact."
      : "New formulations arriving soon - join the waitlist via contact.";

  return (
    <section className="relative overflow-hidden bg-[#FAF8F5] py-20 sm:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-stone-300/80 to-transparent"
      />
      <div
        aria-hidden
        className="absolute -left-24 top-24 -z-10 h-80 w-80 rounded-full bg-[#1B4332]/[0.04] blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -right-16 bottom-10 -z-10 h-72 w-72 rounded-full bg-[#C89D42]/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-[1280px] px-4 sm:px-8 lg:px-12 xl:px-16">
        <Reveal>
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#1B4332]/65">
                The Apothecary
              </p>
              <h2 className="font-display mt-2 text-3xl font-bold tracking-tight text-[#141414] sm:text-4xl lg:text-[2.75rem]">
                Curated Formulations
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-stone-600 sm:text-base">
                Handpicked Unani oils, majoons, powders, and salajeet - ready for
                Cash on Delivery across Pakistan.
              </p>
            </div>

            <div
              role="tablist"
              aria-label="Product collections"
              className="inline-flex w-full max-w-md self-start rounded-full border border-stone-200/90 bg-white/80 p-1.5 shadow-sm backdrop-blur-sm lg:self-end"
            >
              {tabs.map((t) => {
                const active = tab === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setTab(t.id)}
                    className={`relative flex min-h-11 flex-1 flex-col items-center justify-center rounded-full px-3 py-2 text-center transition sm:px-5 ${
                      active
                        ? "text-white"
                        : "text-stone-600 hover:text-[#1B4332]"
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="curated-tab"
                        className="absolute inset-0 rounded-full bg-[#1B4332] shadow-sm"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    )}
                    <span className="relative text-sm font-semibold">{t.label}</span>
                    <span
                      className={`relative text-[10px] font-medium ${
                        active ? "text-white/70" : "text-stone-400"
                      }`}
                    >
                      {t.short}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </Reveal>

        <div className="mt-10 sm:mt-12">
          {products.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-stone-300 bg-white/60 px-6 py-16 text-center">
              <p className="font-display text-2xl font-bold text-[#1B4332]">
                New formulations arriving soon
              </p>
              <p className="mx-auto mt-2 max-w-md text-sm text-stone-500">{emptyCopy}</p>
              <Link
                href="/contact"
                className="mt-6 inline-flex h-12 items-center rounded-full bg-[#1B4332] px-6 text-sm font-semibold text-white transition hover:bg-[#143528]"
              >
                Join the waitlist
              </Link>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4"
              >
                {products.map((p, i) => (
                  <Reveal key={`${tab}-${p.id}`} delay={Math.min(i, 7) * 0.05}>
                    <ProductCard product={p} />
                  </Reveal>
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        <Reveal delay={0.1}>
          <div className="mt-12 flex flex-col items-center gap-3 sm:mt-14">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-stone-400">
              {products.length > 0
                ? `Showing ${products.length} ${tab === "bestsellers" ? "bestsellers" : "new arrivals"}`
                : "Collection growing"}
            </p>
            <Link
              href="/shop"
              className="inline-flex h-12 min-h-12 items-center rounded-full bg-[#1B4332] px-7 text-sm font-semibold text-white shadow-[0_12px_28px_-14px_rgba(27,67,50,0.55)] transition hover:bg-[#143528]"
            >
              Browse full collection →
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
