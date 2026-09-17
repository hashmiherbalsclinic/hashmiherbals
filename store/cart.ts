"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  getDefaultSize,
  priceForSize,
  type Product,
  type ProductSize,
} from "@/lib/catalog";

export type CartItem = {
  /** Unique line key: productId + size */
  id: string;
  productId: string;
  slug: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;
  sizeId: string;
  sizeLabel: string;
};

type CartState = {
  items: CartItem[];
  open: boolean;
  add: (product: Product, qty?: number, size?: ProductSize) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  openCart: () => void;
  closeCart: () => void;
  count: () => number;
  subtotal: () => number;
};

function lineId(productId: string, sizeId: string) {
  return `${productId}:${sizeId}`;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      open: false,
      add: (product, qty = 1, size) => {
        const selected = size ?? getDefaultSize(product.sizes);
        const id = lineId(product.id, selected.id);
        const unitPrice = priceForSize(product.price, selected);
        set((s) => {
          const existing = s.items.find((i) => i.id === id);
          if (existing) {
            return {
              open: true,
              items: s.items.map((i) =>
                i.id === id
                  ? { ...i, quantity: Math.min(i.quantity + qty, i.stock) }
                  : i
              ),
            };
          }
          return {
            open: true,
            items: [
              ...s.items,
              {
                id,
                productId: product.id,
                slug: product.slug,
                title: product.title,
                price: unitPrice,
                image: product.image,
                quantity: Math.min(qty, product.stock),
                stock: product.stock,
                sizeId: selected.id,
                sizeLabel: selected.label,
              },
            ],
          };
        });
      },
      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      setQty: (id, qty) => {
        if (qty <= 0) return get().remove(id);
        set((s) => ({
          items: s.items.map((i) =>
            i.id === id ? { ...i, quantity: Math.min(qty, i.stock) } : i
          ),
        }));
      },
      clear: () => set({ items: [] }),
      openCart: () => set({ open: true }),
      closeCart: () => set({ open: false }),
      count: () => get().items.reduce((n, i) => n + i.quantity, 0),
      subtotal: () => get().items.reduce((n, i) => n + i.price * i.quantity, 0),
    }),
    { name: "hashmi-cart-v2" }
  )
);
