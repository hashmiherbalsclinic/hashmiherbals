"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  CheckCircle2,
  Clock,
  FlaskConical,
  Loader2,
  Mail,
  MapPin,
  Package,
  Phone,
  Send,
  Stethoscope,
} from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { Reveal } from "@/components/Reveal";
import { submitContactMessage } from "@/lib/admin/actions";
import { siteConfig } from "@/lib/catalog";

type Props = {
  /** `page` = full contact page; `home` = homepage embed */
  variant?: "home" | "page";
};

const field =
  "h-12 min-h-12 w-full rounded-xl border border-stone-300/80 bg-[#FDFBF7] px-4 text-sm text-[#141414] outline-none transition-all duration-200 ease-in-out placeholder:text-stone-400 focus:border-[#1B4332] focus:ring-2 focus:ring-[#1B4332]/10";

const textareaField =
  "w-full resize-none rounded-xl border border-stone-300/80 bg-[#FDFBF7] px-4 py-3.5 text-sm text-[#141414] outline-none transition-all duration-200 ease-in-out placeholder:text-stone-400 focus:border-[#1B4332] focus:ring-2 focus:ring-[#1B4332]/10";

const glassCard =
  "flex items-center gap-4 rounded-2xl border border-white/10 bg-white/10 p-4 transition-shadow duration-300 hover:border-white/25 hover:bg-white/15 hover:shadow-[0_0_24px_-8px_rgba(110,231,183,0.35)]";

const helpCategories = [
  {
    icon: Package,
    title: "Orders & COD",
    text: "Questions about delivery status, dispatch, or Cash on Delivery coverage.",
  },
  {
    icon: FlaskConical,
    title: "Product & Dosage Guidance",
    text: "Need help choosing the right majoon, oil, or customized herb pack?",
  },
  {
    icon: Stethoscope,
    title: "Clinic Consultations",
    text: `General Unani care guidance directly supervised by ${siteConfig.hakeemName}.`,
  },
];

export function ContactSection({ variant = "home" }: Props) {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [justSucceeded, setJustSucceeded] = useState(false);
  const waHref = `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(
    "Assalamualaikum! I have a question about Hashmi Herbals."
  )}`;
  const isPage = variant === "page";
  const mapsHref =
    siteConfig.mapsUrl ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      siteConfig.mapsQuery || `${siteConfig.address} ${siteConfig.addressDetail}`
    )}`;

  const contactCard = (
    <div className="mx-auto my-12 grid max-w-6xl overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-xl shadow-stone-900/5 lg:grid-cols-12">
      <aside className="relative flex flex-col justify-between overflow-hidden bg-[#1B4332] p-8 text-white lg:col-span-5 lg:p-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-emerald-400/10 blur-3xl"
        />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300/80">
            Get Direct Support
          </p>
          <h2 className="font-display mb-2 mt-3 text-2xl font-bold text-white">
            Talk to Our Team
          </h2>
          <span className="mt-3 inline-flex items-center rounded-full border border-emerald-400/25 bg-emerald-500/15 px-3 py-1.5 text-[11px] font-semibold text-emerald-100">
            Clinic Open · Sun–Thu (10 AM – 8 PM PKT)
          </span>

          <ul className="mt-8 space-y-3">
            <li>
              <motion.a
                href={`tel:${siteConfig.phone}`}
                className={glassCard}
                whileHover={{ x: 6 }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10">
                  <Phone className="h-4 w-4" />
                </span>
                <span>
                  <span className="block text-[11px] font-medium uppercase tracking-wide text-white/50">
                    Orders &amp; Queries
                  </span>
                  <span className="mt-0.5 block text-sm font-semibold">{siteConfig.phone}</span>
                  <span className="block text-xs text-white/45">Tap to call</span>
                </span>
              </motion.a>
            </li>
            <li>
              <motion.a
                href={`mailto:${siteConfig.email}`}
                className={glassCard}
                whileHover={{ x: 6 }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10">
                  <Mail className="h-4 w-4" />
                </span>
                <span>
                  <span className="block text-[11px] font-medium uppercase tracking-wide text-white/50">
                    Email
                  </span>
                  <span className="mt-0.5 block text-sm font-semibold">{siteConfig.email}</span>
                </span>
              </motion.a>
            </li>
            <li>
              <motion.a
                href={mapsHref}
                target="_blank"
                rel="noopener noreferrer"
                className={glassCard}
                whileHover={{ x: 6 }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10">
                  <MapPin className="h-4 w-4" />
                </span>
                <span>
                  <span className="block text-[11px] font-medium uppercase tracking-wide text-white/50">
                    Clinic Hours &amp; Location
                  </span>
                  <span className="mt-0.5 block text-sm font-semibold">
                    {siteConfig.address}
                    {siteConfig.addressDetail ? `, ${siteConfig.addressDetail}` : ""}
                  </span>
                  <span className="mt-0.5 flex items-center gap-1.5 text-xs text-white/50">
                    <Clock className="h-3 w-3" />
                    Sun–Thu · 10am – 8pm PKT
                  </span>
                </span>
              </motion.a>
            </li>
          </ul>
        </div>

        <p className="relative mt-8 text-xs leading-relaxed text-white/55">
          We usually reply within a few hours during clinic opening hours.
        </p>
      </aside>

      <div className="bg-white p-8 lg:col-span-7 lg:p-10">
        <h3 className="font-display mb-1 text-2xl font-semibold text-[#1B4332]">
          Send a Message
        </h3>
        <p className="text-sm leading-relaxed text-stone-500">
          Fill out the form below and our team will get back to you promptly.
        </p>

        <AnimatePresence mode="wait">
          {sent ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="mt-8 rounded-2xl border border-[#1B4332]/12 bg-[#FDFBF7] px-6 py-8"
            >
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 320, damping: 18 }}
              >
                <CheckCircle2 className="h-8 w-8 text-[#1B4332]" />
              </motion.div>
              <p className="font-display mt-4 text-2xl font-bold text-[#141414]">
                Message received
              </p>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">
                Thanks for writing in. We&apos;ll reply soon.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-medium text-white"
                >
                  <WhatsAppIcon className="h-4 w-4" title="" />
                  WhatsApp us
                </a>
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="inline-flex items-center rounded-full border border-stone-300 px-5 py-3 text-sm font-medium text-[#1B4332]"
                >
                  Send another
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              className="mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={async (e) => {
                e.preventDefault();
                setError(null);
                setLoading(true);
                const form = e.currentTarget;
                const result = await submitContactMessage(new FormData(form));
                if (result.error) {
                  setLoading(false);
                  setError(result.error);
                  return;
                }
                setJustSucceeded(true);
                window.setTimeout(() => {
                  form.reset();
                  setLoading(false);
                  setJustSucceeded(false);
                  setSent(true);
                }, 450);
              }}
            >
              {error && (
                <p className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </p>
              )}

              <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block text-left">
                  <span className="mb-1.5 block text-xs font-semibold text-stone-600">Name</span>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Your full name"
                    className={field}
                  />
                </label>
                <label className="block text-left">
                  <span className="mb-1.5 block text-xs font-semibold text-stone-600">Email</span>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="you@email.com"
                    className={field}
                  />
                </label>
              </div>

              <label className="mb-4 block text-left">
                <span className="mb-1.5 block text-xs font-semibold text-stone-600">
                  WhatsApp Phone
                </span>
                <input
                  type="tel"
                  name="phone"
                  placeholder="+92 300 0000000"
                  className={field}
                />
              </label>

              <label className="mb-6 block text-left">
                <span className="mb-1.5 block text-xs font-semibold text-stone-600">Message</span>
                <textarea
                  name="message"
                  required
                  rows={5}
                  placeholder="Ask about a product, order, or pack size…"
                  className={textareaField}
                />
              </label>

              <div className="flex flex-wrap items-center gap-3">
                <motion.button
                  type="submit"
                  disabled={loading || justSucceeded}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center justify-center gap-2 rounded-full bg-[#1B4332] px-8 py-3.5 text-sm font-medium text-white shadow-md transition-all hover:bg-[#143326] disabled:opacity-80"
                >
                  {loading && !justSucceeded ? (
                    <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
                  ) : justSucceeded ? (
                    <Check className="h-4 w-4" strokeWidth={2.5} />
                  ) : (
                    <Send className="h-4 w-4" strokeWidth={2} />
                  )}
                  {justSucceeded ? "Sent" : loading ? "Sending…" : "Send Message"}
                </motion.button>
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-full border border-[#25D366] px-6 py-3.5 text-sm font-medium text-[#1B4332] transition-all duration-200 hover:bg-[#25D366]/10"
                >
                  <WhatsAppIcon className="h-4 w-4 text-[#25D366]" title="" />
                  WhatsApp
                </a>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  if (isPage) {
    return (
      <>
        <section className="bg-[#FAF8F5] px-6">
          <Reveal>{contactCard}</Reveal>
        </section>

        <section className="bg-[#F7F4EE] px-6 py-16">
          <Reveal>
            <div className="mx-auto mb-10 max-w-2xl text-center">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#1B4332]/65">
                Quick Help
              </p>
              <h2 className="font-display mt-2 text-2xl font-bold text-[#1B4332] sm:text-3xl">
                How can we assist you?
              </h2>
            </div>
          </Reveal>
          <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
            {helpCategories.map((item, i) => (
              <Reveal key={item.title} delay={i * 0.08}>
                <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-md">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1B4332]/8 text-[#1B4332]">
                    <item.icon className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <h3 className="font-display mt-4 text-lg font-bold text-[#1B4332]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-stone-600">{item.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      </>
    );
  }

  return (
    <section className="relative overflow-hidden bg-[#EDE9E0] py-20">
      <div
        aria-hidden
        className="absolute -right-24 bottom-0 -z-10 h-96 w-96 rounded-full bg-emerald-900/5 blur-3xl"
      />
      <div className="relative z-[1] px-4 sm:px-8">
        <Reveal>
          <div className="mx-auto mb-2 max-w-6xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#1B4332]/65">
              Talk To Our Team
            </p>
            <h2 className="font-display mt-2 text-3xl font-bold text-[#141414] sm:text-4xl">
              Contact Hashmi Herbals
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#6b7280] sm:text-base">
              Order help, product guidance, or clinic questions - we&apos;re here for you.
            </p>
          </div>
        </Reveal>
        <Reveal delay={0.08}>{contactCard}</Reveal>
      </div>
    </section>
  );
}
