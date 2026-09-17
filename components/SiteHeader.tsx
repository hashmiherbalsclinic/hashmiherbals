"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, Menu, ShoppingBag, User, X } from "lucide-react";
import { categories, siteConfig } from "@/lib/catalog";
import { ShopMegaMenu } from "@/components/ShopMegaMenu";
import { useCart } from "@/store/cart";

const leftLinks = [
  { href: "/shop", label: "Shop", menu: true },
  { href: "/consultation", label: "Consultation", menu: false },
  { href: "/about", label: "About", menu: false },
  { href: "/blogs", label: "Blogs", menu: false },
  { href: "/contact", label: "Contact", menu: false },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const shopWrapRef = useRef<HTMLDivElement>(null);
  const count = useCart((s) => s.items.reduce((n, i) => n + i.quantity, 0));
  const openCart = useCart((s) => s.openCart);
  const compact = scrolled || shopOpen;

  useEffect(() => {
    setShopOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!shopOpen) return;
    const onPointer = (e: MouseEvent) => {
      if (!shopWrapRef.current?.contains(e.target as Node)) setShopOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShopOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [shopOpen]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const linkClass = (href: string) =>
    `inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.16em] text-[#1f4d3a] transition-opacity hover:opacity-70 ${
      pathname.startsWith(href) ? "opacity-100" : ""
    }`;

  return (
    <>
      <div
        className={`sticky top-0 z-50 transition-all duration-300 ease-out ${
          scrolled
            ? "border-b border-stone-200/50 bg-white/80 shadow-sm backdrop-blur-md"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <div className="border-b border-black/[0.04] bg-[#f6f4ef] text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-[#1f4d3a] sm:text-[12px]">
          <p className="px-4 py-2.5">
            Free delivery on orders PKR {siteConfig.freeShippingMin.toLocaleString()}+
            <span className="mx-2 text-[#1f4d3a]/40">·</span>
            <span className="underline decoration-[#1f4d3a]/35 underline-offset-2">
              Cash on Delivery across Pakistan
            </span>
          </p>
        </div>

        <div
          ref={shopWrapRef}
          className={`relative bg-white ${
            shopOpen
              ? "px-0 pb-0 pt-0"
              : `transition-[padding,background-color] duration-500 ease-out ${
                  compact ? "px-0 pb-0 pt-0" : "bg-transparent px-4 pb-4 pt-3 sm:px-6"
                }`
          }`}
        >
          <div
            className={`relative mx-auto w-full ${
              shopOpen
                ? "max-w-none"
                : `transition-[max-width] duration-500 ease-out ${
                    compact ? "max-w-none" : "max-w-[1200px]"
                  }`
            }`}
          >
            <div
              className={`relative z-10 overflow-visible bg-white ${
                shopOpen
                  ? "h-16 rounded-none border-b border-black/[0.06] shadow-none"
                  : `transition-all duration-500 ease-out ${
                      compact
                        ? "h-16 rounded-none border-b border-black/[0.06] shadow-none"
                        : "h-[3.6rem] rounded-full shadow-[0_8px_28px_rgba(0,0,0,0.1)] sm:h-16"
                    }`
              }`}
            >
              <div
                className={`flex h-full items-center justify-between ${
                  compact ? "px-6 sm:px-10 lg:px-12" : "px-6 sm:px-8"
                }`}
              >
                <div className="flex min-w-0 flex-1 items-center justify-start">
                  <button
                    type="button"
                    className="rounded-full p-2 text-[#1f4d3a] hover:bg-black/[0.04] lg:hidden"
                    onClick={() => setDrawerOpen(true)}
                    aria-label="Open menu"
                  >
                    <Menu className="h-5 w-5" strokeWidth={1.5} />
                  </button>

                  <nav className="hidden items-center gap-8 lg:flex xl:gap-10">
                    {leftLinks.map((l) =>
                      l.menu ? (
                        <button
                          key={l.href}
                          type="button"
                          onClick={() => setShopOpen((o) => !o)}
                          aria-expanded={shopOpen}
                          className={`${linkClass(l.href)} ${
                            shopOpen ? "underline decoration-[#1f4d3a] underline-offset-8" : ""
                          }`}
                        >
                          {l.label}
                          {shopOpen ? (
                            <ChevronUp className="h-3 w-3 opacity-60" strokeWidth={2} />
                          ) : (
                            <ChevronDown className="h-3 w-3 opacity-60" strokeWidth={2} />
                          )}
                        </button>
                      ) : (
                        <Link key={l.href} href={l.href} className={linkClass(l.href)}>
                          {l.label}
                        </Link>
                      )
                    )}
                  </nav>
                </div>

                <div className="w-[5.25rem] shrink-0 sm:w-24" aria-hidden />

                <div className="flex min-w-0 flex-1 items-center justify-end gap-1 sm:gap-2">
                  <button
                    type="button"
                    className="hidden rounded-full p-2.5 text-[#1f4d3a] transition hover:bg-black/[0.04] sm:inline-flex"
                    aria-label="Account"
                  >
                    <User className="h-[22px] w-[22px]" strokeWidth={1.5} />
                  </button>
                  <button
                    type="button"
                    onClick={openCart}
                    className="relative rounded-full p-2.5 text-[#1f4d3a] transition hover:bg-black/[0.04]"
                    aria-label="Open cart"
                  >
                    <ShoppingBag className="h-[22px] w-[22px]" strokeWidth={1.75} />
                    <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#1f5c45] px-1 text-[9px] font-bold leading-none text-white">
                      {count}
                    </span>
                  </button>
                </div>
              </div>

              <Link
                href="/"
                aria-label={siteConfig.name}
                className={`absolute left-1/2 top-1/2 z-20 block -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full bg-white ${
                  shopOpen
                    ? "h-[3.25rem] w-[3.25rem] shadow-none"
                    : `transition-all duration-500 ease-out ${
                        compact
                          ? "h-[3.25rem] w-[3.25rem] shadow-none"
                          : "h-[4.5rem] w-[4.5rem] shadow-[0_4px_14px_rgba(0,0,0,0.1)]"
                      }`
                }`}
              >
                <Image
                  src="/images/logo-clean.webp"
                  alt={siteConfig.name}
                  fill
                  className="object-contain"
                  sizes="72px"
                  priority
                />
              </Link>
            </div>

            {shopOpen && (
              <div className="absolute left-0 right-0 top-full z-40 hidden lg:block">
                <ShopMegaMenu onNavigate={() => setShopOpen(false)} />
              </div>
            )}
          </div>
        </div>
      </div>

      {shopOpen && (
        <button
          type="button"
          aria-label="Close shop menu"
          className="fixed inset-0 z-40 hidden bg-black/20 lg:block"
          onClick={() => setShopOpen(false)}
        />
      )}

      {drawerOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close menu"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className="absolute left-0 top-0 flex h-full w-[min(100%,20rem)] flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-line px-4 py-4">
              <div className="relative h-12 w-12 overflow-hidden rounded-full">
                <Image
                  src="/images/logo-clean.webp"
                  alt=""
                  fill
                  className="object-contain"
                  sizes="48px"
                />
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="rounded-full p-2 hover:bg-surface"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-col gap-1 p-4">
              {leftLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setDrawerOpen(false)}
                  className="rounded-xl px-3 py-3 text-sm font-semibold uppercase tracking-wide text-[#1f4d3a] hover:bg-surface"
                >
                  {l.label}
                </Link>
              ))}
              <p className="mt-3 px-3 text-xs font-semibold uppercase tracking-wider text-muted">
                Categories
              </p>
              {categories.map((c) => (
                <Link
                  key={c.id}
                  href={c.href}
                  onClick={() => setDrawerOpen(false)}
                  className="rounded-xl px-3 py-2.5 text-sm hover:bg-surface"
                >
                  {c.name}
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
