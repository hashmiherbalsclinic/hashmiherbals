import Image from "next/image";
import Link from "next/link";
import { Phone } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { categories, siteConfig } from "@/lib/catalog";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M14 13.5h2.5l.5-3H14V8.75c0-.83.17-1.25 1.34-1.25H17V5.1C16.67 5.06 15.77 5 14.7 5 12.31 5 10.5 6.42 10.5 9.15V10.5H8v3h2.5V19h3.5v-5.5z" />
    </svg>
  );
}

const navLinks = [
  { href: "/shop", label: "Shop" },
  { href: "/consultation", label: "Consultation" },
  { href: "/about", label: "About" },
  { href: "/blogs", label: "Blogs" },
  { href: "/contact", label: "Contact" },
];

const helpLinks = [
  { href: "/login", label: "Sign in" },
  { href: "/signup", label: "Create account" },
  { href: "/account", label: "My account" },
  { href: "/terms", label: "Terms & conditions" },
  { href: "/shipping-policy", label: "Shipping policy" },
  { href: "/refund-policy", label: "Refund policy" },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-[#0f2a22] text-white">
      <div className="container-page py-14 sm:py-16">
        <div className="grid gap-12 lg:grid-cols-[1.35fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <Image
                src="/images/logo-clean.webp"
                alt={siteConfig.name}
                width={52}
                height={52}
                className="h-12 w-12 rounded-full object-cover ring-2 ring-white/15"
              />
              <span>
                <span className="font-display block text-xl font-bold tracking-tight">
                  {siteConfig.name}
                </span>
                <span className="text-xs font-medium uppercase tracking-[0.16em] text-[#b8d4a8]">
                  {siteConfig.tagline}
                </span>
              </span>
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/60">
              {siteConfig.description}
            </p>

            <div className="mt-6 flex flex-wrap gap-2.5">
              <a
                href={`https://wa.me/${siteConfig.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 transition hover:border-[#25D366]/50 hover:bg-[#25D366]/15 hover:text-[#25D366]"
              >
                <WhatsAppIcon className="h-4 w-4" title="" />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 transition hover:border-white/40 hover:text-white"
              >
                <InstagramIcon className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="Facebook"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 transition hover:border-white/40 hover:text-white"
              >
                <FacebookIcon className="h-4 w-4" />
              </a>
              <a
                href={`tel:${siteConfig.phone}`}
                aria-label="Call us"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 transition hover:border-[#74a13a]/50 hover:text-[#b8d4a8]"
              >
                <Phone className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#b8d4a8]">
              Links
            </h3>
            <ul className="mt-5 space-y-2.5">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-white/65 transition hover:text-white"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#b8d4a8]">
              Categories
            </h3>
            <ul className="mt-5 space-y-2.5">
              {categories.map((c) => (
                <li key={c.id}>
                  <Link
                    href={c.href}
                    className="text-sm text-white/65 transition hover:text-white"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help & support */}
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#b8d4a8]">
              Help & support
            </h3>
            <ul className="mt-5 space-y-2.5">
              {helpLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-white/65 transition hover:text-white"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-white/55">
              <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">
                Orders &amp; queries
              </span>
              <a href={`tel:${siteConfig.phone}`} className="font-semibold text-white hover:text-[#c5e0a8]">
                {siteConfig.phone}
              </a>
              <a
                href={`mailto:${siteConfig.email}`}
                className="mt-1 block font-semibold text-white hover:text-[#c5e0a8]"
              >
                {siteConfig.email}
              </a>
              <span className="mt-1 block text-xs text-white/45">Sun-Thu · 10am - 8pm</span>
            </p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10 bg-[#0b211a]">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-5 text-center text-xs text-white/40 sm:flex-row sm:text-left">
          <p>
            © {year} {siteConfig.name}. All rights reserved.
          </p>
          <p className="max-w-md sm:text-right">
            Traditional herbal products are not a substitute for professional medical advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
