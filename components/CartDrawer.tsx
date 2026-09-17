"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
import { formatPrice, siteConfig } from "@/lib/catalog";
import { useCart } from "@/store/cart";

export function CartDrawer() {
  const { items, open, closeCart, remove, setQty, subtotal } = useCart();
  const total = subtotal();
  const shipping = total >= siteConfig.freeShippingMin || total === 0 ? 0 : siteConfig.shippingFee;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      <button type="button" className="absolute inset-0 bg-black/40" onClick={closeCart} aria-label="Close cart" />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-display text-xl font-bold">Your cart</h2>
          <button type="button" onClick={closeCart} className="rounded-full p-2 hover:bg-surface">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-muted">Your cart is empty</p>
              <Link href="/shop" onClick={closeCart} className="btn-primary mt-6 inline-flex">
                Shop favorites
              </Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li key={item.id} className="flex gap-3 border-b border-line pb-4">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-surface">
                    <Image src={item.image} alt={item.title} fill className="object-cover" sizes="80px" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link href={`/shop/${item.slug}`} onClick={closeCart} className="line-clamp-2 text-sm font-semibold hover:text-green">
                      {item.title}
                    </Link>
                    <p className="mt-0.5 text-xs text-muted">{item.sizeLabel}</p>
                    <p className="mt-1 text-sm font-medium">{formatPrice(item.price)}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        className="rounded-full border border-line p-1"
                        onClick={() => setQty(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="text-sm">{item.quantity}</span>
                      <button
                        type="button"
                        className="rounded-full border border-line p-1"
                        onClick={() => setQty(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        className="ml-auto text-xs text-muted hover:text-ink"
                        onClick={() => remove(item.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-line px-5 py-5">
            <div className="flex justify-between text-sm">
              <span className="text-muted">Subtotal</span>
              <span className="font-semibold">{formatPrice(total)}</span>
            </div>
            <div className="mt-1 flex justify-between text-sm">
              <span className="text-muted">Shipping</span>
              <span className="font-semibold">{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
            </div>
            <Link href="/checkout" onClick={closeCart} className="btn-primary mt-4 w-full">
              Checkout · {formatPrice(total + shipping)}
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
}
