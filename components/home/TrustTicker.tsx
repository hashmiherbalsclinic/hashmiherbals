"use client";

import { BadgeCheck, Banknote, Package, Stethoscope } from "lucide-react";

const items = [
  { icon: Package, label: "Express Shipping Nationwide" },
  { icon: Banknote, label: "Cash on Delivery" },
  { icon: Stethoscope, label: "Expert Unani Clinic Guidance" },
  { icon: BadgeCheck, label: "100% Pure & Authentic" },
];

export function TrustTicker() {
  const loop = [...items, ...items];

  return (
    <section
      aria-label="Trust signals"
      className="relative overflow-hidden border-y border-white/10 bg-[#1B4332] text-white"
    >
      {/* Desktop divided grid */}
      <div className="mx-auto hidden max-w-[1280px] grid-cols-4 divide-x divide-white/10 px-4 sm:px-8 lg:grid lg:px-12 xl:px-16">
        {items.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex items-center justify-center gap-2.5 px-4 py-3.5 text-[11px] font-semibold uppercase tracking-[0.12em]"
          >
            <Icon className="h-4 w-4 shrink-0 text-[#C89D42]" strokeWidth={1.75} />
            <span className="text-center leading-snug">{label}</span>
          </div>
        ))}
      </div>

      {/* Mobile marquee */}
      <div className="relative flex overflow-hidden py-3.5 lg:hidden">
        <div className="animate-trust-marquee flex min-w-max items-center gap-8 px-4">
          {loop.map(({ icon: Icon, label }, i) => (
            <div
              key={`${label}-${i}`}
              className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] whitespace-nowrap"
            >
              <Icon className="h-3.5 w-3.5 text-[#C89D42]" strokeWidth={1.75} />
              {label}
              <span className="ml-6 text-white/25" aria-hidden>
                ·
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
