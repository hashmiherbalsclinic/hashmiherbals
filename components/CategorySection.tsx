"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { categories, type CategoryId } from "@/lib/catalog";
import { Reveal } from "@/components/Reveal";

const iconSrc: Record<CategoryId, string> = {
  "mens-care": "/images/categories/mens-care.webp",
  "womens-care": "/images/categories/womens-care.webp",
  majoon: "/images/categories/majoon.webp",
  oils: "/images/categories/oils.webp",
  powders: "/images/categories/powders.webp",
  salajeet: "/images/categories/salajeet.webp",
  digestion: "/images/categories/digestion.webp",
  seeds: "/images/categories/seeds.webp",
};

export function CategorySection() {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category");
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);
  const reduceMotion = useReducedMotion();

  const updateArrows = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft < max - 4);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [updateArrows]);

  const scrollBy = (dir: -1 | 1) => {
    const el = trackRef.current;
    if (!el) return;
    const amount = Math.min(420, el.clientWidth * 0.8);
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  return (
    <section className="border-y border-stone-200/60 bg-white py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#1B4332]/65">
                Collection Categories
              </p>
              <h2 className="font-display mt-2 text-3xl font-bold text-[#141414] sm:text-4xl">
                Curated For Your Wellness
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/shop"
                className="text-sm font-semibold text-[#1B4332] transition hover:underline"
              >
                View all →
              </Link>
              <div className="flex items-center gap-2 lg:hidden">
                <button
                  type="button"
                  onClick={() => scrollBy(-1)}
                  disabled={!canPrev}
                  aria-label="Previous categories"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-stone-200 bg-white text-[#1B4332] transition hover:bg-stone-50 disabled:opacity-35"
                >
                  <ChevronLeft className="h-5 w-5" strokeWidth={1.75} />
                </button>
                <button
                  type="button"
                  onClick={() => scrollBy(1)}
                  disabled={!canNext}
                  aria-label="Next categories"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-stone-200 bg-white text-[#1B4332] transition hover:bg-stone-50 disabled:opacity-35"
                >
                  <ChevronRight className="h-5 w-5" strokeWidth={1.75} />
                </button>
              </div>
            </div>
          </div>
        </Reveal>

        <div className="relative mt-10 lg:hidden">
          <div
            ref={trackRef}
            className="flex snap-x snap-mandatory gap-5 overflow-x-auto overscroll-x-contain scroll-smooth pb-4 pt-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {categories.map((item) => (
              <CategoryCard
                key={item.id}
                href={item.href}
                name={item.name}
                blurb={item.blurb}
                icon={iconSrc[item.id]}
                active={activeCategory === item.id}
                className="min-w-[180px] shrink-0 snap-start sm:min-w-[200px]"
              />
            ))}
          </div>
        </div>

        <div className="mt-10 hidden gap-6 lg:grid lg:grid-cols-4">
          {categories.map((item, i) => (
            <Reveal key={item.id} delay={reduceMotion ? 0 : i * 0.08}>
              <CategoryCard
                href={item.href}
                name={item.name}
                blurb={item.blurb}
                icon={iconSrc[item.id]}
                active={activeCategory === item.id}
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoryCard({
  href,
  name,
  blurb,
  icon,
  active,
  className = "",
}: {
  href: string;
  name: string;
  blurb: string;
  icon: string;
  active: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`group relative flex min-h-[220px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-stone-200/80 bg-white px-6 py-8 text-center shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] ${
        active ? "border-[#1B4332]/25" : ""
      } ${className}`}
    >
      <div className="relative mx-auto mb-4">
        <div className="relative mx-auto flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-[#F7F4EE] transition-transform duration-300 ease-out group-hover:scale-[1.08]">
          <div className="relative h-[4.25rem] w-[4.25rem] overflow-hidden rounded-full">
            <Image
              src={icon}
              alt={name}
              fill
              className="object-cover mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
              sizes="80px"
            />
          </div>
        </div>
      </div>

      <h3 className="font-display mb-1 text-center text-base font-semibold text-[#1B4332] lg:text-lg">
        {name}
      </h3>
      <p className="mx-auto max-w-[140px] text-center text-xs text-stone-500 line-clamp-2">
        {blurb}
      </p>
    </Link>
  );
}
