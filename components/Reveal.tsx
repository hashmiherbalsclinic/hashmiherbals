"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

/** Luxury ease-out cubic */
export const revealEase = [0.16, 1, 0.3, 1] as const;

type Props = {
  children: ReactNode;
  className?: string;
  /** Delay in seconds (e.g. index * 0.08 for stagger) */
  delay?: number;
  as?: "div" | "section";
};

export function Reveal({ children, className = "", delay = 0, as = "div" }: Props) {
  const reduceMotion = useReducedMotion();
  const Component = as === "section" ? motion.section : motion.div;

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <Component
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12, margin: "0px 0px -40px 0px" }}
      transition={{ duration: 0.6, ease: revealEase, delay }}
    >
      {children}
    </Component>
  );
}
