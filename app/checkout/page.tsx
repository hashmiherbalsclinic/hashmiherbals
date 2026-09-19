"use client";

import Image from "next/image";
import Link from "next/link";
import { Lock, MessageCircle, Package, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { PakistanCitySelect } from "@/components/checkout/PakistanCitySelect";
import { placeOrder } from "@/lib/admin/actions";
import { formatPrice, siteConfig } from "@/lib/catalog";
import { createClient } from "@/lib/supabase/client";
import { useCart } from "@/store/cart";
import { toUserFacingError } from "@/lib/errors/user-message";
import { ErrorAlert } from "@/components/errors/ErrorAlert";

const inputClass =
  "h-12 w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm text-[#141414] outline-none transition placeholder:text-stone-400 focus:border-[#1B4332]/40 focus:ring-2 focus:ring-[#1B4332]/15";

function CheckoutHeader() {
  return (
    <header className="border-b border-stone-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-6 py-5 sm:flex-row sm:justify-between">
        <Link href="/" className="inline-flex items-center">
          <Image
            src="/images/logo-clean.webp"
            alt={siteConfig.name}
            width={160}
            height={48}
            className="h-10 w-auto object-contain sm:h-11"
            priority
          />
        </Link>
        <p className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-[#FAF8F5] px-3.5 py-1.5 text-[11px] font-semibold tracking-wide text-[#1B4332] sm:text-xs">
          <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden />
          256-Bit Encrypted Secure Checkout
        </p>
      </div>
    </header>
  );
}

function CheckoutProgress({ step }: { step: 1 | 2 | 3 }) {
  const steps = [
    { n: 1, label: "Cart" },
    { n: 2, label: "Shipping & Contact Details" },
    { n: 3, label: "Complete Order" },
  ] as const;

  return (
    <nav
      aria-label="Checkout progress"
      className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-2 px-6 pt-8 text-xs sm:gap-3 sm:text-sm"
    >
      {steps.map((s, i) => {
        const active = step === s.n;
        const done = step > s.n;
        return (
          <span key={s.label} className="inline-flex items-center gap-2 sm:gap-3">
            {i > 0 && (
              <span className="text-stone-300" aria-hidden>
                →
              </span>
            )}
            <span
              className={
                active
                  ? "font-semibold text-[#1B4332]"
                  : done
                    ? "font-medium text-stone-500"
                    : "text-stone-400"
              }
            >
              {s.label}
            </span>
          </span>
        );
      })}
    </nav>
  );
}

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const [done, setDone] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("Lahore");
  const [promo, setPromo] = useState("");
  const [promoMsg, setPromoMsg] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const total = subtotal();
  const shipping = total >= siteConfig.freeShippingMin || total === 0 ? 0 : siteConfig.shippingFee;
  const grandTotal = total + shipping;
  const whatsappHref = `https://wa.me/${siteConfig.whatsapp}`;

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      const user = data.user;
      if (!user) return;
      setLoggedIn(true);
      setEmail(user.email ?? "");
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, phone, email")
        .eq("id", user.id)
        .maybeSingle();
      if (profile?.full_name) setName(profile.full_name);
      if (profile?.phone) setPhone(profile.phone);
      if (profile?.email) setEmail(profile.email);
    });
  }, []);

  if (done) {
    return (
      <div className="min-h-dvh bg-[#FAF8F5]">
        <CheckoutHeader />
        <CheckoutProgress step={3} />
        <div className="mx-auto max-w-lg px-6 py-16 text-center">
          <div className="rounded-3xl border border-stone-200/80 bg-white p-8 shadow-sm sm:p-10">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#1B4332]/65">
              Order confirmed
            </p>
            <h1 className="font-display mt-2 text-3xl font-bold text-[#141414]">
              Order received
            </h1>
            {orderNumber && (
              <p className="mt-3 text-sm font-semibold text-[#1B4332]">Order {orderNumber}</p>
            )}
            <p className="mt-3 text-sm leading-relaxed text-stone-600">
              Thank you! A confirmation email was sent, and we&apos;ll also confirm your COD order
              shortly via phone or WhatsApp.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {loggedIn && (
                <Link
                  href="/account"
                  className="inline-flex h-12 items-center rounded-full bg-[#1B4332] px-6 text-sm font-semibold text-white transition hover:bg-[#143326]"
                >
                  View account
                </Link>
              )}
              <Link
                href="/shop"
                className="inline-flex h-12 items-center rounded-full border border-stone-200 bg-white px-6 text-sm font-semibold text-[#1B4332] transition hover:border-[#1B4332]/30"
              >
                Continue shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-dvh bg-[#FAF8F5]">
        <CheckoutHeader />
        <CheckoutProgress step={1} />
        <div className="mx-auto max-w-lg px-6 py-16 text-center">
          <div className="rounded-3xl border border-stone-200/80 bg-white p-8 shadow-sm">
            <h1 className="font-display text-2xl font-bold text-[#141414]">Your cart is empty</h1>
            <p className="mt-2 text-sm text-stone-500">
              Add a few formulations before completing your COD order.
            </p>
            <Link
              href="/shop"
              className="mt-6 inline-flex h-12 items-center rounded-full bg-[#1B4332] px-6 text-sm font-semibold text-white transition hover:bg-[#143326]"
            >
              Shop products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#FAF8F5]">
      <CheckoutHeader />
      <CheckoutProgress step={2} />

      <div className="mx-auto max-w-7xl px-6 py-10">
        {!loggedIn && (
          <p className="mb-8 rounded-2xl border border-stone-200/80 bg-white px-4 py-3 text-sm text-stone-600 shadow-sm">
            Have an account?{" "}
            <Link
              href="/login?next=/checkout"
              className="font-semibold text-[#1B4332] hover:underline"
            >
              Sign in
            </Link>{" "}
            for faster checkout, or{" "}
            <Link
              href="/signup?next=/checkout"
              className="font-semibold text-[#1B4332] hover:underline"
            >
              create one
            </Link>
            .
          </p>
        )}

        <form
          className="grid items-start gap-12 lg:grid-cols-12"
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
              city: String(form.get("city") || ""),
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
              setError(toUserFacingError(result.error, "customer"));
              return;
            }
            setOrderNumber(result.orderNumber ?? null);
            clear();
            setDone(true);
          }}
        >
          {/* LEFT: Shipping & contact */}
          <div className="space-y-6 lg:col-span-7">
            <div className="space-y-8 rounded-3xl border border-stone-200/80 bg-white p-6 shadow-sm sm:p-8">
              {error && (
                <ErrorAlert
                  error={error}
                  audience="customer"
                  onDismiss={() => setError(null)}
                />
              )}

              <section className="space-y-4">
                <h2 className="text-lg font-bold text-[#141414]">1. Contact Details</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="block sm:col-span-1">
                    <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-500">
                      Full name
                    </span>
                    <input
                      required
                      name="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Full name"
                      className={inputClass}
                      autoComplete="name"
                    />
                  </label>
                  <label className="block sm:col-span-1">
                    <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-500">
                      Email address
                    </span>
                    <input
                      required
                      type="email"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email address"
                      className={inputClass}
                      autoComplete="email"
                    />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-500">
                      Phone / WhatsApp
                    </span>
                    <input
                      required
                      name="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Phone / WhatsApp"
                      className={inputClass}
                      autoComplete="tel"
                    />
                    <span className="mt-1.5 block text-xs text-stone-500">
                      Used for COD order verification &amp; tracking updates
                    </span>
                  </label>
                </div>
              </section>

              <section className="space-y-4 border-t border-stone-100 pt-8">
                <h2 className="text-lg font-bold text-[#141414]">2. Delivery Address</h2>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-500">
                    Street address / house / area
                  </span>
                  <textarea
                    required
                    name="address"
                    rows={3}
                    placeholder="Delivery address"
                    className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3.5 text-sm text-[#141414] outline-none transition placeholder:text-stone-400 focus:border-[#1B4332]/40 focus:ring-2 focus:ring-[#1B4332]/15"
                    autoComplete="street-address"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-500">
                    City
                  </span>
                  <PakistanCitySelect value={city} onChange={setCity} />
                </label>
              </section>

              <section className="space-y-4 border-t border-stone-100 pt-8">
                <h2 className="text-lg font-bold text-[#141414]">3. Payment Method</h2>
                <div className="flex items-center justify-between gap-4 rounded-2xl border-2 border-[#1B4332] bg-[#1B4332]/5 p-4">
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked
                      readOnly
                      className="mt-1 h-4 w-4 accent-[#1B4332]"
                      aria-label="Cash on Delivery"
                    />
                    <div>
                      <p className="text-sm font-semibold text-[#141414]">
                        Cash on Delivery (COD)
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-stone-600">
                        Pay with cash upon delivery at your doorstep anywhere in Pakistan.
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full bg-[#1B4332] px-3 py-1 text-[11px] font-bold text-white">
                    Free COD
                  </span>
                </div>
              </section>
            </div>
          </div>

          {/* RIGHT: Order summary */}
          <aside className="lg:col-span-5">
            <div className="sticky top-24 space-y-6 rounded-3xl border border-stone-200/80 bg-[#F9F7F2] p-6 lg:p-8">
              <h2 className="font-display mb-4 text-xl font-semibold text-[#1B4332]">
                Order Summary
              </h2>

              <ul className="max-h-72 space-y-4 overflow-y-auto pr-1">
                {items.map((item) => (
                  <li key={item.id} className="flex gap-3">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-stone-200 bg-white">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[#141414]">{item.title}</p>
                      <p className="mt-0.5 text-xs text-stone-500">
                        {item.sizeLabel}
                        <span className="mx-1.5 text-stone-300">·</span>
                        Qty: {item.quantity}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[#1B4332]">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={promo}
                  onChange={(e) => {
                    setPromo(e.target.value);
                    setPromoMsg(null);
                  }}
                  placeholder="Promo / discount code"
                  className="h-11 min-w-0 flex-1 rounded-xl border border-stone-200 bg-white px-3 text-sm outline-none focus:border-[#1B4332]/40 focus:ring-2 focus:ring-[#1B4332]/15"
                  aria-label="Promo code"
                />
                <button
                  type="button"
                  onClick={() =>
                    setPromoMsg(
                      promo.trim()
                        ? "This code is not active right now."
                        : "Enter a code to apply."
                    )
                  }
                  className="h-11 shrink-0 rounded-xl bg-[#1B4332] px-4 text-sm font-semibold text-white transition hover:bg-[#143326]"
                >
                  Apply
                </button>
              </div>
              {promoMsg && <p className="text-xs text-stone-500">{promoMsg}</p>}

              <div className="space-y-2 border-t border-stone-200/80 pt-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-stone-500">Subtotal</span>
                  <span className="font-semibold text-[#141414]">{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Shipping fee</span>
                  <span
                    className={`font-semibold ${shipping === 0 ? "text-emerald-600" : "text-[#141414]"}`}
                  >
                    {shipping === 0 ? "Free" : formatPrice(shipping)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Estimated COD fee</span>
                  <span className="font-semibold text-[#141414]">Rs 0</span>
                </div>
                <div className="flex items-baseline justify-between border-t border-stone-200/80 pt-3">
                  <span className="text-base font-semibold text-[#141414]">Total (COD)</span>
                  <span className="text-2xl font-bold text-[#1B4332]">
                    {formatPrice(grandTotal)}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#1B4332] py-4 text-center text-base font-bold text-white shadow-xl transition-all hover:bg-[#143326] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Placing order..."
                  : `Complete Order - ${formatPrice(grandTotal)} (COD)`}
              </button>

              <ul className="space-y-2.5 text-xs text-stone-600">
                <li className="flex items-start gap-2.5">
                  <Package className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#1B4332]" aria-hidden />
                  <span>Express Dispatch within 24 Hours</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#1B4332]" aria-hidden />
                  <span>100% Authentic &amp; Sealed Products</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <MessageCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#1B4332]" aria-hidden />
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-[#1B4332] underline-offset-2 hover:underline"
                  >
                    Need Help? Chat with Us on WhatsApp
                  </a>
                </li>
              </ul>
            </div>
          </aside>
        </form>
      </div>
    </div>
  );
}
