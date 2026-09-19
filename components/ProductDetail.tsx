"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Banknote, Check, ChevronDown, Truck } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import {
  compareAtForSize,
  formatPrice,
  getDefaultSize,
  priceForSize,
  siteConfig,
  type Product,
  type ProductDetail,
} from "@/lib/catalog";
import { useCart } from "@/store/cart";

const defaultBenefits = [
  "Pure natural formulation without synthetic additives.",
  "Traditional Unani recipe prepared under expert supervision.",
  "Clear usage instructions for daily routines.",
  "Carefully sourced botanicals for optimal purity.",
];

const defaultFaqs = [
  {
    q: "How long does one pack typically last?",
    a: "Most packs last several weeks with regular use, depending on the dosage recommended for you and the pack size selected.",
  },
  {
    q: "Are there any known side effects?",
    a: "Traditional herbal formulas are generally well tolerated when used as directed. If you are pregnant, nursing, or on medication, consult a qualified practitioner before use.",
  },
  {
    q: "Can I combine this with other herbal remedies?",
    a: "Many customers use complementary Unani formulas together. Share your current regimen during consultation so we can guide you safely.",
  },
  {
    q: "How should I store this product?",
    a: "Keep the pack sealed in a cool, dry place away from direct sunlight and moisture. Reseal after each use to preserve freshness.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-stone-200">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 py-4 text-left"
        aria-expanded={open}
      >
        <span className="font-display text-base font-bold text-[#1B4332]">{q}</span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-[#1B4332] transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="pb-4 text-sm leading-relaxed text-stone-600">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ProductDetail({
  product,
}: {
  product: ProductDetail;
  related: Product[];
}) {
  const add = useCart((s) => s.add);
  const [added, setAdded] = useState(false);
  const [sizeId, setSizeId] = useState(() => getDefaultSize(product.sizes).id);

  const selectedSize =
    product.sizes.find((s) => s.id === sizeId) ??
    product.sizes[0] ??
    getDefaultSize(product.sizes);
  const unitPrice = priceForSize(product.price, selectedSize);
  const unitCompareAt = compareAtForSize(product.compareAt, selectedSize);

  const shortDescription = useMemo(() => {
    const base = product.tagline
      ? `${product.tagline} ${product.description}`
      : product.description;
    const sentences = base
      .replace(/\s+/g, " ")
      .split(/(?<=[.!?])\s+/)
      .filter(Boolean);
    return sentences.slice(0, 2).join(" ") || product.description;
  }, [product.description, product.tagline]);

  const benefits =
    product.benefits?.length >= 4
      ? product.benefits.slice(0, 4)
      : [
          ...(product.benefits ?? []),
          ...defaultBenefits,
        ].slice(0, 4);

  const howToUse =
    product.howToUse?.length > 0
      ? product.howToUse.slice(0, 3)
      : [
          "Take the suggested amount once or twice daily, or as advised.",
          "Use consistently with water or warm milk as preferred.",
          "Store sealed in a cool, dry place after each use.",
        ];

  const faqs =
    product.faqs?.length > 0
      ? [
          ...product.faqs,
          ...defaultFaqs.filter((d) => !product.faqs.some((f) => f.q === d.q)),
        ].slice(0, 4)
      : defaultFaqs;

  const waHref = `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(
    `Assalamualaikum! I'd like to order ${product.title} (${selectedSize.label}) - ${formatPrice(unitPrice)}.`
  )}`;

  const handleAdd = () => {
    add(product, 1, selectedSize);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  };

  return (
    <div className="bg-[#FAF8F5]">
      {/* Section 1 - Essential product hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-12 lg:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-sm">
          <Image
            src={product.image}
            alt={product.title}
            fill
            className="object-cover"
            sizes="(max-width:1024px) 100vw, 50vw"
            priority
          />
          <span className="absolute left-4 top-4 rounded-full border border-[#1B4332]/10 bg-white/90 px-3 py-1 text-[11px] font-semibold tracking-wide text-[#1B4332] shadow-sm">
            100% Pure Herbal
          </span>
        </div>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#1B4332]/65">
            {product.categoryName}
          </p>
          <h1 className="font-display mt-3 text-3xl font-bold tracking-tight text-[#1B4332] sm:text-4xl">
            {product.title}
          </h1>

          <div className="mt-5 flex flex-wrap items-baseline gap-3">
            <span className="text-3xl font-bold text-[#141414]">
              {formatPrice(unitPrice)}
            </span>
            {unitCompareAt && unitCompareAt > unitPrice && (
              <span className="text-lg text-stone-400 line-through">
                {formatPrice(unitCompareAt)}
              </span>
            )}
          </div>

          {product.sizes.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {product.sizes.map((size) => {
                const active = size.id === selectedSize.id;
                return (
                  <button
                    key={size.id}
                    type="button"
                    onClick={() => setSizeId(size.id)}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                      active
                        ? "border-[#1B4332] bg-[#1B4332] text-white"
                        : "border-stone-200 bg-white text-[#1B4332] hover:border-[#1B4332]/35"
                    }`}
                  >
                    {size.label.replace(/\s/g, "")}
                  </button>
                );
              })}
            </div>
          )}

          <p className="mt-6 text-[15px] leading-relaxed text-stone-600 sm:text-base">
            {shortDescription}
          </p>

          <div className="mt-8 space-y-3">
            <button
              type="button"
              onClick={handleAdd}
              disabled={product.stock <= 0}
              className="flex h-12 w-full items-center justify-center rounded-full bg-[#1B4332] px-6 text-sm font-semibold text-white transition hover:bg-[#143326] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {product.stock <= 0
                ? "Out of stock"
                : added
                  ? "Added to Cart"
                  : `Add to Cart - ${formatPrice(unitPrice)}`}
            </button>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-[#1B4332]/20 bg-white px-6 text-sm font-semibold text-[#1B4332] transition hover:border-[#25D366] hover:bg-[#25D366]/5"
            >
              <WhatsAppIcon className="h-4 w-4 text-[#25D366]" title="" />
              Order via WhatsApp
            </a>
          </div>

          <p className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-stone-500">
            <span className="inline-flex items-center gap-1.5">
              <Truck className="h-3.5 w-3.5 text-[#1B4332]" />
              Free Delivery Rs {siteConfig.freeShippingMin.toLocaleString()}+
            </span>
            <span className="text-stone-300">•</span>
            <span className="inline-flex items-center gap-1.5">
              <Banknote className="h-3.5 w-3.5 text-[#1B4332]" />
              Cash on Delivery
            </span>
          </p>

          <Link
            href="/shop"
            className="mt-6 inline-flex text-sm font-semibold text-[#1B4332] underline-offset-4 hover:underline"
          >
            ← Back to shop
          </Link>
        </div>
      </section>

      {/* Section 2 - Benefits & FAQs */}
      <section className="mx-auto max-w-3xl border-t border-stone-200/80 px-6 py-12">
        <div>
          <h2 className="font-display mb-6 text-2xl font-bold text-[#1B4332]">
            Key Benefits &amp; Uses
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-start gap-3 text-sm leading-relaxed text-stone-600">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1B4332]/10 text-[#1B4332]">
                  <Check className="h-3 w-3" strokeWidth={2.5} />
                </span>
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        <div className="my-8 rounded-2xl border border-stone-200/60 bg-[#F4F1EA] p-6">
          <h3 className="font-display text-lg font-bold text-[#1B4332]">
            Suggested Dosage &amp; Directions
          </h3>
          <ol className="mt-4 space-y-3">
            {howToUse.map((step, i) => (
              <li key={step} className="flex gap-3 text-sm leading-relaxed text-stone-700">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1B4332] text-[11px] font-bold text-white">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        <div>
          <h2 className="font-display mb-2 text-2xl font-bold text-[#1B4332]">
            Frequently Asked Questions
          </h2>
          <div className="mt-2">
            {faqs.map((faq) => (
              <FaqItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
          <p className="mt-8 text-xs leading-relaxed text-stone-400">
            Traditional herbal wellness products are not a substitute for professional medical
            advice. If you are pregnant, nursing, or taking medication, consult a qualified
            practitioner before use.
          </p>
        </div>
      </section>
    </div>
  );
}
