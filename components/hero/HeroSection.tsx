"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  Star,
  Truck,
} from "lucide-react";
import { siteConfig } from "@/lib/catalog";
import { HeroBackground } from "@/components/hero/HeroBackground";
import { revealEase } from "@/components/Reveal";

type Props = {
  products?: unknown[];
};

export function HeroSection(_props: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-[#FAF8F5]">
      <HeroBackground />

      <div className="relative z-[1] mx-auto grid max-w-[1280px] items-center gap-10 px-4 py-12 sm:gap-12 sm:px-8 sm:py-16 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14 lg:px-12 lg:py-20 xl:px-16">
        <motion.div
          className="max-w-xl"
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: revealEase }}
        >
          <p className="font-display text-sm font-semibold tracking-[0.06em] text-[#1B4332]/75">
            {siteConfig.name}
          </p>

          <span className="mt-4 inline-flex max-w-full items-center rounded-full border border-[#1B4332]/10 bg-[#E8F0E0]/90 px-3.5 py-1.5 text-[11px] font-semibold tracking-wide text-[#1B4332] shadow-sm backdrop-blur-sm sm:text-xs">
            Authentic Unani Medicine &amp; Modern Herbalism
          </span>

          <h1 className="font-display mt-5 text-[2.55rem] font-bold leading-[1.08] tracking-tight text-[#141414] sm:text-5xl lg:text-[3.4rem]">
            Heal Your Body,
            <span className="mt-1 block italic text-[#1B4332]">Naturally.</span>
          </h1>

          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-[#6b7280] sm:text-base">
            Traditional Unani remedies — oils, majoons, powders, and salajeet — crafted with
            clinical care for modern Pakistani homes.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-2.5 text-sm text-[#3d4a42]">
            <span className="inline-flex items-center gap-0.5 text-[#C89D42]">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-current" />
              ))}
            </span>
            <span className="font-semibold text-[#1B4332]">4.9/5</span>
            <span className="text-[#9ca3af]">·</span>
            <span className="font-medium text-[#6b7280]">
              Trusted by 10,000+ Pakistani Families
            </span>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/shop"
                className="group inline-flex h-12 min-h-12 items-center gap-2 rounded-full bg-[#1B4332] px-6 text-sm font-semibold text-white shadow-[0_14px_32px_-12px_rgba(27,67,50,0.55)] transition-shadow duration-300 hover:bg-[#143528] hover:shadow-[0_18px_36px_-10px_rgba(27,67,50,0.6)]"
              >
                Explore Remedies
                <motion.span
                  className="inline-flex"
                  initial={false}
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 400, damping: 24 }}
                >
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </motion.span>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/contact"
                className="inline-flex h-12 min-h-12 items-center rounded-full border border-[#1B4332]/15 bg-white/55 px-6 text-sm font-semibold text-[#1B4332] shadow-sm backdrop-blur-md transition hover:border-[#1B4332]/28 hover:bg-white/80"
              >
                Book Consultation
              </Link>
            </motion.div>
          </div>

          <div className="mt-9 flex flex-wrap gap-x-5 gap-y-3 border-t border-[#1B4332]/10 pt-6">
            {[
              { icon: Truck, label: "Free Delivery*" },
              { icon: Banknote, label: "Cash on Delivery" },
              { icon: BadgeCheck, label: "100% Organic" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="inline-flex items-center gap-2 text-xs font-semibold text-[#3d4a42] sm:text-[13px]"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/70 text-[#1B4332] shadow-sm ring-1 ring-[#1B4332]/8">
                  <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                </span>
                {label}
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="relative mx-auto w-full max-w-[440px] lg:mx-0 lg:max-w-none lg:justify-self-end"
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.08, ease: revealEase }}
        >
          <div
            aria-hidden
            className="absolute top-1/2 left-1/2 -z-10 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-900/10 blur-3xl"
          />
          <div className="relative aspect-[4/5] overflow-hidden rounded-[24px] bg-[#F5F1E9] shadow-[0_32px_64px_-28px_rgba(27,67,50,0.32)] ring-1 ring-[#1B4332]/[0.06]">
            <Image
              src="/images/hero-products.webp"
              alt={`${siteConfig.name} herbal oils and botanicals`}
              fill
              priority
              className="object-cover object-center transition-transform duration-700 hover:scale-[1.03]"
              sizes="(max-width:1024px) 90vw, 440px"
            />
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, transparent 55%, rgba(27,67,50,0.18) 100%)",
              }}
            />

            <div className="absolute bottom-4 left-4 right-4 sm:bottom-5 sm:left-5 sm:right-5">
              <motion.div
                className="inline-flex max-w-full items-center gap-2 rounded-2xl border border-white/50 bg-white/70 px-3.5 py-2.5 shadow-[0_12px_28px_-14px_rgba(0,0,0,0.25)] backdrop-blur-xl"
                animate={
                  reduceMotion ? undefined : { y: [0, -6, 0] }
                }
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F5EFE0] text-[#C89D42]">
                  <Star className="h-3.5 w-3.5 fill-current" />
                </span>
                <p className="text-[11px] font-semibold leading-snug text-[#1B4332] sm:text-xs">
                  Bestseller: 100% Natural Herbal Care
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
