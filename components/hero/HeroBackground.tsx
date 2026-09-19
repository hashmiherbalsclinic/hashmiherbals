"use client";

import { motion, useReducedMotion } from "framer-motion";

/** Clean warm canvas with soft ambient light only - no decorative graphics */
export function HeroBackground() {
  const reduceMotion = useReducedMotion();

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[#FAF8F5]" />
      <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-emerald-900/5 blur-3xl" />
      <motion.div
        className="absolute -right-[8%] top-[25%] h-80 w-80 rounded-full bg-emerald-900/[0.04] blur-3xl"
        animate={
          reduceMotion ? undefined : { x: [0, -12, 8, 0], y: [0, 10, -6, 0] }
        }
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
