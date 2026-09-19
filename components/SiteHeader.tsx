"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Menu,
  MessageCircle,
  Phone,
  Search,
  ShoppingBag,
  X,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useId, useRef, useState, type FormEvent, type MouseEvent } from "react";
import { AccountNavButton } from "@/components/auth/AccountNavButton";
import { categories, formatPrice, siteConfig, type Product } from "@/lib/catalog";
import { fetchProductsClient } from "@/lib/products-client";
import { useCart } from "@/store/cart";

const ShopMegaMenu = dynamic(
  () => import("@/components/ShopMegaMenu").then((m) => m.ShopMegaMenu),
  { ssr: false }
);

const navLinks = [
  { href: "/shop", label: "Shop", mega: true },
  { href: "/consultation", label: "Consultation" },
  { href: "/about", label: "About" },
  { href: "/blogs", label: "Blogs" },
  { href: "/contact", label: "Contact" },
] as const;

const tickerItems = [
  `Free Express Delivery on orders over PKR ${siteConfig.freeShippingMin.toLocaleString()}+`,
  "Cash on Delivery Nationwide",
  "Expert Consultation Available",
];

/** Enough repeats so the ribbon fills wide screens on first paint */
const ribbonSegment = Array.from({ length: 4 }, () => tickerItems).flat();

const whatsappHref = `https://wa.me/${siteConfig.whatsapp}`;

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const searchInputId = useId();
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [badgePulse, setBadgePulse] = useState(0);
  const shopTriggerRef = useRef<HTMLDivElement>(null);
  const megaRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const prevCount = useRef(0);

  const count = useCart((s) => s.items.reduce((n, i) => n + i.quantity, 0));
  const openCart = useCart((s) => s.openCart);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setDrawerOpen(false);
    setShopOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (count > prevCount.current) setBadgePulse((n) => n + 1);
    prevCount.current = count;
  }, [count]);

  useEffect(() => {
    const locked = drawerOpen || searchOpen;
    if (!locked) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setDrawerOpen(false);
      setSearchOpen(false);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [drawerOpen, searchOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    const t = window.setTimeout(() => searchRef.current?.focus(), 50);
    return () => window.clearTimeout(t);
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    const q = query.trim().toLowerCase();
    let cancelled = false;
    setSearchLoading(true);
    const t = window.setTimeout(() => {
      fetchProductsClient({
        limit: q ? 8 : 6,
        q: q || undefined,
      }).then((list) => {
        if (cancelled) return;
        setResults(list);
        setSearchLoading(false);
      });
    }, 180);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [query, searchOpen]);

  const openShop = () => setShopOpen(true);

  const closeShopNow = () => setShopOpen(false);

  const leaveShopArea = (e: MouseEvent, from: "trigger" | "mega") => {
    const related = e.relatedTarget as Node | null;
    if (!related) {
      closeShopNow();
      return;
    }
    const movingToMega = megaRef.current?.contains(related);
    const movingToTrigger = shopTriggerRef.current?.contains(related);
    if (from === "trigger" && movingToMega) return;
    if (from === "mega" && movingToTrigger) return;
    closeShopNow();
  };

  const submitSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    setSearchOpen(false);
    if (q) router.push(`/shop?q=${encodeURIComponent(q)}`);
    else router.push("/shop");
  };

  return (
    <>
      <header className="sticky top-0 z-50">
        {/* Section 1 - Continuous announcement ribbon */}
        <div className="overflow-hidden bg-[#1B4332] py-2 text-xs font-medium text-white">
          <div className="flex w-max animate-header-ribbon will-change-transform">
            {[0, 1].map((copy) => (
              <p key={copy} className="flex shrink-0 items-center whitespace-nowrap" aria-hidden={copy === 1}>
                {ribbonSegment.map((item, i) => (
                  <span key={`${copy}-${i}`} className="inline-flex items-center">
                    <span className="px-5">{item}</span>
                    <span className="text-white/40" aria-hidden>
                      -
                    </span>
                  </span>
                ))}
              </p>
            ))}
          </div>
        </div>

        {/* Section 2 - Glassmorphic navbar */}
        <div
          className={`relative transition-all duration-300 ${
            scrolled
              ? "border-b border-stone-200/60 bg-white/80 shadow-sm backdrop-blur-lg"
              : "border-b border-transparent bg-[#FAF8F5]/90 backdrop-blur-md"
          }`}
        >
          <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-6">
            {/* Left - brand */}
            <div className="flex min-w-0 items-center gap-2.5">
              <button
                type="button"
                className="rounded-full p-2 text-[#1B4332] transition hover:bg-stone-100/80 lg:hidden"
                onClick={() => setDrawerOpen(true)}
                aria-label="Open menu"
                aria-expanded={drawerOpen}
              >
                <Menu className="h-5 w-5" strokeWidth={1.75} />
              </button>

              <Link
                href="/"
                className="flex items-center transition-opacity hover:opacity-90"
                aria-label={siteConfig.name}
              >
                <span className="relative h-14 w-14 overflow-hidden rounded-full border border-stone-200 bg-white shadow-sm sm:h-16 sm:w-16">
                  <Image
                    src="/images/logo-clean.webp"
                    alt=""
                    fill
                    className="object-contain p-0.5"
                    sizes="64px"
                    priority
                  />
                </span>
              </Link>
            </div>

            {/* Center - nav + mega */}
            <nav className="hidden items-center gap-1 lg:flex">
              {navLinks.map((l) => {
                const active = isActivePath(pathname, l.href);
                if ("mega" in l && l.mega) {
                  return (
                    <div
                      key={l.href}
                      ref={shopTriggerRef}
                      className="relative flex self-stretch items-center px-3"
                      onMouseEnter={openShop}
                      onMouseLeave={(e) => leaveShopArea(e, "trigger")}
                    >
                      <Link
                        href={l.href}
                        className={`group relative py-2 text-sm font-medium transition-colors ${
                          active || shopOpen
                            ? "text-[#1B4332]"
                            : "text-stone-700 hover:text-[#1B4332]"
                        }`}
                        aria-expanded={shopOpen}
                        aria-haspopup="true"
                      >
                        {l.label}
                        <span
                          className={`absolute bottom-0 left-0 h-[2px] w-full origin-left bg-[#1B4332] transition-transform duration-300 ${
                            active || shopOpen
                              ? "scale-x-100"
                              : "scale-x-0 group-hover:scale-x-100"
                          }`}
                        />
                      </Link>
                    </div>
                  );
                }

                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    onMouseEnter={closeShopNow}
                    className={`group relative px-3 py-2 text-sm font-medium transition-colors ${
                      active
                        ? "text-[#1B4332]"
                        : "text-stone-700 hover:text-[#1B4332]"
                    }`}
                  >
                    {l.label}
                    <span
                      className={`absolute bottom-0 left-0 h-[2px] w-full origin-left bg-[#1B4332] transition-transform duration-300 ${
                        active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                      }`}
                    />
                  </Link>
                );
              })}
            </nav>

            {/* Right - utilities */}
            <div
              className="flex items-center gap-1.5 sm:gap-2"
              onMouseEnter={closeShopNow}
            >
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="rounded-full p-2.5 text-[#1B4332] transition hover:bg-stone-100/80"
                aria-label="Search products"
              >
                <Search className="h-5 w-5" strokeWidth={1.75} />
              </button>

              <AccountNavButton />

              <button
                type="button"
                onClick={openCart}
                className="relative rounded-full border border-stone-200/80 bg-[#FAF8F5] p-2.5 text-[#1B4332] transition-all hover:bg-[#F4F1EA]"
                aria-label="Open cart"
              >
                <ShoppingBag className="h-5 w-5" strokeWidth={1.75} />
                <AnimatePresence>
                  {count > 0 && (
                    <motion.span
                      key={`${count}-${badgePulse}`}
                      initial={{ scale: 0.4, opacity: 0 }}
                      animate={{ scale: [1.15, 1], opacity: 1 }}
                      exit={{ scale: 0.4, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#1B4332] text-[10px] font-bold text-white shadow-sm"
                    >
                      {count > 99 ? "99+" : count}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>

          {/* Shop mega-menu */}
          <AnimatePresence>
            {shopOpen && (
              <motion.div
                ref={megaRef}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.12 }}
                className="absolute inset-x-0 top-full z-40 hidden lg:block"
                onMouseEnter={openShop}
                onMouseLeave={(e) => leaveShopArea(e, "mega")}
              >
                <div className="mx-auto max-w-7xl px-6 pb-4 pt-0">
                  <div className="overflow-hidden rounded-2xl border border-stone-200/70 bg-white/95 shadow-[0_24px_60px_-20px_rgba(27,67,50,0.28)] backdrop-blur-xl">
                    <ShopMegaMenu onNavigate={closeShopNow} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Search overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            className="fixed inset-0 z-[70]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby={searchInputId}
          >
            <button
              type="button"
              className="absolute inset-0 bg-[#1B4332]/30 backdrop-blur-md"
              aria-label="Close search"
              onClick={() => setSearchOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="relative mx-auto mt-20 w-[min(100%-1.5rem,36rem)] overflow-hidden rounded-2xl border border-stone-200/80 bg-white/95 shadow-2xl backdrop-blur-xl"
            >
              <form onSubmit={submitSearch} className="flex items-center gap-2 border-b border-stone-200 px-4 py-3">
                <Search className="h-5 w-5 shrink-0 text-stone-400" strokeWidth={1.75} />
                <input
                  ref={searchRef}
                  id={searchInputId}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search oils, majoon, salajeet…"
                  className="w-full bg-transparent text-sm text-[#1B4332] outline-none placeholder:text-stone-400"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="rounded-full p-1.5 text-stone-500 hover:bg-stone-100"
                  aria-label="Close search"
                >
                  <X className="h-4 w-4" />
                </button>
              </form>
              <div className="max-h-[min(60vh,22rem)] overflow-y-auto p-2">
                {searchLoading ? (
                  <p className="px-3 py-6 text-center text-sm text-stone-500">Searching…</p>
                ) : results.length === 0 ? (
                  <p className="px-3 py-6 text-center text-sm text-stone-500">
                    No products found.
                  </p>
                ) : (
                  <ul>
                    {results.map((p) => (
                      <li key={p.id}>
                        <Link
                          href={`/shop/${p.slug}`}
                          onClick={() => setSearchOpen(false)}
                          className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-[#FAF8F5]"
                        >
                          <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[#F4F1EA]">
                            <Image
                              src={p.image || "/images/categories/oils.webp"}
                              alt=""
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium text-[#1B4332]">
                              {p.title}
                            </span>
                            <span className="mt-0.5 block text-xs text-stone-500">
                              {formatPrice(p.price)}
                            </span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
                <Link
                  href="/shop"
                  onClick={() => setSearchOpen(false)}
                  className="mt-1 block rounded-xl px-3 py-3 text-center text-sm font-semibold text-[#1B4332] hover:bg-[#FAF8F5]"
                >
                  Browse all products →
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Section 3 - Mobile drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            className="fixed inset-0 z-[60] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
          >
            <button
              type="button"
              className="absolute inset-0 bg-[#1B4332]/30 backdrop-blur-md"
              aria-label="Close menu"
              onClick={() => setDrawerOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="absolute left-0 top-0 flex h-full w-[80vw] max-w-sm flex-col bg-white/95 p-6 shadow-2xl backdrop-blur-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <p className="font-display text-xl font-bold text-[#1B4332]">
                  Hashmi Herbals
                </p>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="rounded-full p-2 hover:bg-stone-100"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="mt-6 flex flex-col gap-1">
                {navLinks.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setDrawerOpen(false)}
                    className={`rounded-xl px-3 py-3 text-sm font-semibold transition ${
                      isActivePath(pathname, l.href)
                        ? "bg-[#1B4332]/5 text-[#1B4332]"
                        : "text-[#1B4332] hover:bg-stone-50"
                    }`}
                  >
                    {l.label}
                  </Link>
                ))}
                <Link
                  href="/account"
                  onClick={() => setDrawerOpen(false)}
                  className="rounded-xl px-3 py-3 text-sm font-semibold text-[#1B4332] hover:bg-stone-50"
                >
                  My account
                </Link>
                <Link
                  href="/login"
                  onClick={() => setDrawerOpen(false)}
                  className="rounded-xl px-3 py-3 text-sm font-semibold text-stone-600 hover:bg-stone-50"
                >
                  Sign in / Sign up
                </Link>
              </nav>

              <p className="mt-6 px-3 text-[11px] font-bold uppercase tracking-wider text-stone-400">
                Categories
              </p>
              <div className="mt-1 flex flex-col gap-0.5 overflow-y-auto">
                {categories.map((c) => (
                  <Link
                    key={c.id}
                    href={c.href}
                    onClick={() => setDrawerOpen(false)}
                    className="rounded-xl px-3 py-2.5 text-sm text-stone-600 hover:bg-stone-50"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>

              <div className="mt-auto space-y-3 border-t border-stone-200 pt-5">
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-[#1B4332] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#163528]"
                >
                  <MessageCircle className="h-4 w-4" strokeWidth={2} />
                  WhatsApp consultation
                </a>
                <div className="space-y-1.5 px-1 text-xs text-stone-600">
                  <a
                    href={`tel:${siteConfig.phone.replace(/\s/g, "")}`}
                    className="flex items-center gap-2 hover:text-[#1B4332]"
                  >
                    <Phone className="h-3.5 w-3.5" strokeWidth={1.75} />
                    {siteConfig.phone}
                  </a>
                  <p>
                    {siteConfig.address}
                    <br />
                    {siteConfig.addressDetail}
                  </p>
                </div>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
