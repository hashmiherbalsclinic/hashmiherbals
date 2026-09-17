"use client";

import Link from "next/link";
import { useState } from "react";
import { placeOrder } from "@/lib/admin/actions";
import { formatPrice, siteConfig } from "@/lib/catalog";
import { useCart } from "@/store/cart";

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const [done, setDone] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const total = subtotal();
  const shipping = total >= siteConfig.freeShippingMin || total === 0 ? 0 : siteConfig.shippingFee;

  if (done) {
    return (
      <div className="container-page max-w-lg py-20 text-center">
        <h1 className="font-display text-3xl font-bold">Order received</h1>
        {orderNumber && (
          <p className="mt-2 text-sm font-semibold text-[#1f5c45]">Order {orderNumber}</p>
        )}
        <p className="mt-3 text-muted">
          Thank you! A confirmation email was sent, and we&apos;ll also confirm your COD order
          shortly via phone or WhatsApp.
        </p>
        <Link href="/shop" className="btn-primary mt-8 inline-flex">
          Continue shopping
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-page py-20 text-center">
        <p className="text-muted">Your cart is empty.</p>
        <Link href="/shop" className="btn-primary mt-6 inline-flex">
          Shop products
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page max-w-2xl py-10 sm:py-14">
      <h1 className="font-display text-3xl font-bold">Checkout</h1>
      <p className="mt-2 text-muted">Cash on Delivery across Pakistan</p>

      <form
        className="mt-8 space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setError(null);
          setLoading(true);
          const form = new FormData(e.currentTarget);
          const result = await placeOrder({
            customer_name: String(form.get("name") || ""),
            customer_email: String(form.get("email") || ""),
            phone: String(form.get("phone") || ""),
            address: String(form.get("address") || ""),
            subtotal: total,
            shipping_fee: shipping,
            total: total + shipping,
            items: items.map((item) => ({
              product_id:
                /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
                  item.productId
                )
                  ? item.productId
                  : undefined,
              product_title: item.title,
              product_slug: item.slug,
              size_label: item.sizeLabel,
              unit_price: item.price,
              quantity: item.quantity,
              image: item.image,
            })),
          });
          setLoading(false);
          if (result.error) {
            setError(result.error);
            return;
          }
          setOrderNumber(result.orderNumber ?? null);
          clear();
          setDone(true);
        }}
      >
        {error && (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </p>
        )}
        <input
          required
          name="name"
          placeholder="Full name"
          className="h-12 w-full rounded-full border border-line px-5 text-sm outline-none ring-green/30 focus:ring-2"
        />
        <input
          required
          type="email"
          name="email"
          placeholder="Email address"
          className="h-12 w-full rounded-full border border-line px-5 text-sm outline-none ring-green/30 focus:ring-2"
        />
        <input
          required
          name="phone"
          placeholder="Phone / WhatsApp"
          className="h-12 w-full rounded-full border border-line px-5 text-sm outline-none ring-green/30 focus:ring-2"
        />
        <textarea
          required
          name="address"
          rows={3}
          placeholder="Delivery address"
          className="w-full rounded-3xl border border-line px-5 py-3.5 text-sm outline-none ring-green/30 focus:ring-2"
        />

        <div className="rounded-2xl border border-line bg-white p-5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Subtotal</span>
            <span className="font-semibold">{formatPrice(total)}</span>
          </div>
          <div className="mt-1 flex justify-between">
            <span className="text-muted">Shipping</span>
            <span className="font-semibold">{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
          </div>
          <div className="mt-3 flex justify-between border-t border-line pt-3 text-base font-bold">
            <span>Total (COD)</span>
            <span>{formatPrice(total + shipping)}</span>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
          {loading ? "Placing order..." : "Place COD order"}
        </button>
      </form>
    </div>
  );
}
