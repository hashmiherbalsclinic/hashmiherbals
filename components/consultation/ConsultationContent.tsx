"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  Clock,
  MessageCircle,
  Package,
  Star,
  Stethoscope,
  UserRound,
  Video,
} from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { Reveal } from "@/components/Reveal";
import { siteConfig } from "@/lib/catalog";

type ConsultMode = "online" | "clinic";
type TimeSlot = "morning" | "afternoon" | "evening";

const concerns = [
  "Men's Vitality",
  "Women's Wellness",
  "Digestion & Liver",
  "Hair & Skin",
  "Joint / Body Pain",
  "General Wellness",
] as const;

const faqs = [
  {
    q: "How does an online consultation work over WhatsApp?",
    a: `After you submit a request, our clinic team confirms a time slot and connects you with ${siteConfig.hakeemName} via WhatsApp voice/video or phone. You'll discuss symptoms, history, and lifestyle before a tailored Unani plan is prepared.`,
  },
  {
    q: "How will I receive my prescribed herbal remedies?",
    a: "Custom oils, majoons, powders, or salajeet are prepared after consultation and shipped nationwide. Tracking details are shared once your order is dispatched.",
  },
  {
    q: "Can I pay Cash on Delivery (COD) for prescribed remedies?",
    a: "Yes. Cash on Delivery is available across Pakistan for prescribed herbal remedies, so you can pay when the package arrives.",
  },
  {
    q: "What are the clinic timings for in-person visits?",
    a: "Hashmi Herbal Clinic welcomes in-person visits Mon–Sat, 10:00 AM – 8:00 PM PKT. Online consultations can be scheduled within the same window based on availability.",
  },
];

const journey = [
  {
    step: "01",
    title: "Book Request",
    text: "Submit your health concerns and preferred time slot online or via WhatsApp.",
  },
  {
    step: "02",
    title: "1-on-1 Consultation",
    text: `Speak directly with ${siteConfig.hakeemName} to assess root causes and health history.`,
  },
  {
    step: "03",
    title: "Tailored Formulation",
    text: "Receive a custom Unani prescription made from pure, carefully sourced botanicals.",
  },
  {
    step: "04",
    title: "Delivery & Follow-Up",
    text: "Remedies delivered to your doorstep (COD available) with ongoing clinic follow-up guidance.",
  },
];

const field =
  "h-12 min-h-12 w-full rounded-xl border border-stone-300/80 bg-[#FDFBF7] px-4 text-sm text-[#141414] outline-none transition-all duration-200 ease-in-out placeholder:text-stone-400 focus:border-[#1B4332] focus:ring-2 focus:ring-[#1B4332]/10";

export function ConsultationContent() {
  const [mode, setMode] = useState<ConsultMode>("online");
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
  const [timeSlot, setTimeSlot] = useState<TimeSlot>("morning");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [submitted, setSubmitted] = useState(false);

  const waHref = useMemo(() => {
    const concernText =
      selectedConcerns.length > 0
        ? selectedConcerns.join(", ")
        : "General wellness";
    const modeLabel =
      mode === "online" ? "Online WhatsApp Consultation" : "In-Clinic Visit";
    const msg = `Assalamualaikum! I'd like to book a ${modeLabel} with Hashmi Herbals.\nConcerns: ${concernText}\nPreferred slot: ${timeSlot}.`;
    return `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(msg)}`;
  }, [mode, selectedConcerns, timeSlot]);

  const toggleConcern = (item: string) => {
    setSelectedConcerns((prev) =>
      prev.includes(item) ? prev.filter((c) => c !== item) : [...prev, item]
    );
  };

  return (
    <div className="bg-white">
      {/* Section 1 — Hero */}
      <section className="border-b border-stone-200/60 bg-[#FAF8F5] px-6 py-16">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-12 lg:gap-14">
          <Reveal className="lg:col-span-7">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#1B4332]/10 bg-[#1B4332]/5 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-[#1B4332]">
              <Stethoscope className="h-3.5 w-3.5" strokeWidth={2} />
              Expert Unani Clinic &amp; Online Consultations
            </span>
            <h1 className="font-display text-3xl font-bold leading-[1.12] tracking-tight text-[#1B4332] md:text-5xl">
              Personalized Herbal Care, Supervised by an Experienced Practitioner.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-stone-600 md:text-lg">
              Book a one-on-one session with {siteConfig.hakeemName} — rooted in 20+ years of clinical
              Unani experience, root-cause assessment, tailored herbal compounding, and
              patient-first guidance for your home.
            </p>

            <div className="mt-8 flex flex-wrap gap-2.5">
              {[
                { icon: UserRound, label: "1-on-1 Guidance" },
                { icon: Package, label: "Custom Herbal Remedy Delivery" },
                { icon: MessageCircle, label: "Online & In-Clinic" },
              ].map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-2 rounded-full border border-stone-200/80 bg-white px-3.5 py-2 text-xs font-semibold text-[#1B4332] shadow-sm"
                >
                  <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                  {label}
                </span>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.08} className="lg:col-span-5">
            <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-3xl border border-stone-200 bg-[#EDE9E0] shadow-xl lg:mx-0 lg:max-w-none">
              <div className="relative aspect-[4/5]">
                <Image
                  src="/images/mubashar-akhtar.webp"
                  alt={siteConfig.hakeemName}
                  fill
                  className="object-cover object-top"
                  sizes="(max-width:1024px) 90vw, 420px"
                  priority
                />
                <div className="absolute inset-x-4 bottom-4">
                  <div className="inline-flex max-w-full items-center gap-2 rounded-2xl border border-white/50 bg-white/90 px-3.5 py-2.5 shadow-lg backdrop-blur-md">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F5EFE0] text-[#C89D42]">
                      <Star className="h-3.5 w-3.5 fill-current" />
                    </span>
                    <p className="text-[11px] font-semibold leading-snug text-[#1B4332] sm:text-xs">
                      {siteConfig.hakeemName} · 20+ Years Tibb Experience
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Section 2 — Type selection */}
      <section className="bg-white px-6 py-20">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold text-[#141414] sm:text-4xl">
              Choose How You&apos;d Like to Consult
            </h2>
            <p className="mt-3 text-base text-stone-600">
              Select the consultation method that fits your schedule.
            </p>
          </div>
        </Reveal>

        <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-2">
          <Reveal delay={0.05}>
            <button
              type="button"
              onClick={() => setMode("online")}
              className={`h-full w-full rounded-3xl border bg-[#FDFBF7] p-7 text-left transition-all duration-300 ${
                mode === "online"
                  ? "border-transparent ring-2 ring-[#1B4332] shadow-lg"
                  : "border-stone-200/80 hover:-translate-y-1 hover:shadow-md"
              }`}
            >
              <span className="inline-flex rounded-full bg-[#1B4332]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[#1B4332]">
                Popular · Connect from Anywhere
              </span>
              <span className="mt-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#1B4332]/10 text-[#1B4332]">
                <Video className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <h3 className="font-display mt-4 text-xl font-bold text-[#1B4332]">
                Online Consultation
              </h3>
              <p className="mt-1 text-sm text-stone-500">WhatsApp / Phone / Video</p>
              <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-stone-600">
                <li>Direct 1-on-1 consultation via WhatsApp voice/video or phone call.</li>
                <li>
                  Prescription &amp; customized remedy prepared and shipped nationwide via Cash
                  on Delivery.
                </li>
                <li>Ideal for busy schedules or patients outside Lahore.</li>
              </ul>
              <p className="mt-6 inline-flex rounded-full bg-[#1B4332] px-3.5 py-1.5 text-xs font-semibold text-white">
                Free Initial Assessment
              </p>
            </button>
          </Reveal>

          <Reveal delay={0.12}>
            <button
              type="button"
              onClick={() => setMode("clinic")}
              className={`h-full w-full rounded-3xl border bg-[#FDFBF7] p-7 text-left transition-all duration-300 ${
                mode === "clinic"
                  ? "border-transparent ring-2 ring-[#1B4332] shadow-lg"
                  : "border-stone-200/80 hover:-translate-y-1 hover:shadow-md"
              }`}
            >
              <span className="inline-flex rounded-full bg-[#C89D42]/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[#8a6a1f]">
                Hashmi Herbal Clinic · Lahore
              </span>
              <span className="mt-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#1B4332]/10 text-[#1B4332]">
                <Building2 className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <h3 className="font-display mt-4 text-xl font-bold text-[#1B4332]">
                In-Person Clinic Visit
              </h3>
              <p className="mt-1 text-sm text-stone-500">Face-to-face Unani assessment</p>
              <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-stone-600">
                <li>Face-to-face pulse examination (Nabd) and detailed lifestyle assessment.</li>
                <li>Fresh herbal compounding prepared directly at the clinic.</li>
                <li>
                  Address: {siteConfig.address}
                  {siteConfig.addressDetail ? `, ${siteConfig.addressDetail}` : ""}.
                </li>
              </ul>
              <p className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-[#1B4332]">
                <Clock className="h-3.5 w-3.5" />
                Mon–Sat (10:00 AM – 8:00 PM PKT)
              </p>
            </button>
          </Reveal>
        </div>
      </section>

      {/* Section 3 — Booking form */}
      <section className="bg-[#FAF8F5] px-6 py-8 sm:py-12">
        <Reveal>
          <div className="mx-auto my-8 max-w-4xl rounded-3xl border border-stone-200/80 bg-white p-8 shadow-xl shadow-stone-900/5 lg:p-12">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl font-bold text-[#1B4332] sm:text-3xl">
                  Complete Your Consultation Request
                </h2>
                <p className="mt-2 text-sm text-stone-500">
                  Tell us a little about yourself — we&apos;ll confirm your preferred slot.
                </p>
              </div>
              <span className="rounded-full border border-stone-200 bg-[#FDFBF7] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-[#1B4332]">
                Step 1 of 1 · Booking Details
              </span>
            </div>

            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-10 rounded-2xl border border-[#1B4332]/15 bg-[#FDFBF7] px-6 py-10 text-center"
                >
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#1B4332] text-white">
                    <Check className="h-5 w-5" strokeWidth={2.5} />
                  </span>
                  <p className="font-display mt-4 text-2xl font-bold text-[#141414]">
                    Request received
                  </p>
                  <p className="mx-auto mt-2 max-w-md text-sm text-stone-600">
                    Thank you. For faster confirmation, continue on WhatsApp with your preferred
                    time and concern.
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <a
                      href={waHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-semibold text-white"
                    >
                      <WhatsAppIcon className="h-4 w-4" title="" />
                      Continue on WhatsApp
                    </a>
                    <button
                      type="button"
                      onClick={() => setSubmitted(false)}
                      className="rounded-full border border-stone-300 px-6 py-3 text-sm font-semibold text-[#1B4332]"
                    >
                      Submit another
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mt-10 space-y-8"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSubmitted(true);
                  }}
                >
                  <fieldset>
                    <legend className="text-xs font-bold uppercase tracking-[0.16em] text-[#1B4332]/70">
                      Patient Details
                    </legend>
                    <div className="mt-3 grid gap-4 sm:grid-cols-2">
                      <label className="block sm:col-span-2">
                        <span className="mb-1.5 block text-xs font-semibold text-stone-600">
                          Full Name
                        </span>
                        <input name="name" required placeholder="Your full name" className={field} />
                      </label>
                      <label className="block">
                        <span className="mb-1.5 block text-xs font-semibold text-stone-600">Age</span>
                        <input
                          name="age"
                          type="number"
                          min={1}
                          max={120}
                          required
                          placeholder="e.g. 32"
                          className={field}
                        />
                      </label>
                      <label className="block">
                        <span className="mb-1.5 block text-xs font-semibold text-stone-600">
                          Gender
                        </span>
                        <select name="gender" required defaultValue="" className={field}>
                          <option value="" disabled>
                            Select gender
                          </option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Prefer not to say</option>
                        </select>
                      </label>
                      <label className="block sm:col-span-2">
                        <span className="mb-1.5 block text-xs font-semibold text-stone-600">
                          City / Location
                        </span>
                        <input
                          name="city"
                          required
                          placeholder="Lahore, Karachi, Islamabad…"
                          className={field}
                        />
                      </label>
                    </div>
                  </fieldset>

                  <fieldset>
                    <legend className="text-xs font-bold uppercase tracking-[0.16em] text-[#1B4332]/70">
                      Contact Info
                    </legend>
                    <div className="mt-3 grid gap-4 sm:grid-cols-2">
                      <label className="block">
                        <span className="mb-1.5 block text-xs font-semibold text-stone-600">
                          WhatsApp Phone Number
                        </span>
                        <input
                          name="phone"
                          type="tel"
                          required
                          placeholder="03XX XXXXXXX"
                          className={field}
                        />
                      </label>
                      <label className="block">
                        <span className="mb-1.5 block text-xs font-semibold text-stone-600">
                          Email Address
                        </span>
                        <input
                          name="email"
                          type="email"
                          placeholder="you@email.com"
                          className={field}
                        />
                      </label>
                    </div>
                  </fieldset>

                  <fieldset>
                    <legend className="text-xs font-bold uppercase tracking-[0.16em] text-[#1B4332]/70">
                      Consultation Mode
                    </legend>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {(
                        [
                          {
                            id: "online" as const,
                            label: "Online WhatsApp Consultation",
                            icon: Video,
                          },
                          {
                            id: "clinic" as const,
                            label: "In-Clinic Visit",
                            icon: Stethoscope,
                          },
                        ] as const
                      ).map((opt) => (
                        <label
                          key={opt.id}
                          className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3.5 transition ${
                            mode === opt.id
                              ? "border-[#1B4332] bg-[#1B4332]/5 ring-2 ring-[#1B4332]/20"
                              : "border-stone-200 bg-[#FDFBF7] hover:border-stone-300"
                          }`}
                        >
                          <input
                            type="radio"
                            name="mode"
                            value={opt.id}
                            checked={mode === opt.id}
                            onChange={() => setMode(opt.id)}
                            className="sr-only"
                          />
                          <opt.icon className="h-4 w-4 text-[#1B4332]" strokeWidth={1.75} />
                          <span className="text-sm font-semibold text-[#1B4332]">{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <fieldset>
                    <legend className="text-xs font-bold uppercase tracking-[0.16em] text-[#1B4332]/70">
                      Primary Health Concern
                    </legend>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {concerns.map((item) => {
                        const active = selectedConcerns.includes(item);
                        return (
                          <button
                            key={item}
                            type="button"
                            onClick={() => toggleConcern(item)}
                            className={`rounded-full border px-3.5 py-2 text-xs font-semibold transition ${
                              active
                                ? "border-[#1B4332] bg-[#1B4332] text-white"
                                : "border-stone-200 bg-white text-[#1B4332] hover:border-[#1B4332]/40"
                            }`}
                          >
                            {item}
                          </button>
                        );
                      })}
                    </div>
                    <label className="mt-4 block">
                      <span className="mb-1.5 block text-xs font-semibold text-stone-600">
                        Describe your concern
                      </span>
                      <textarea
                        name="symptoms"
                        required
                        rows={5}
                        placeholder="Briefly describe your health concern, symptoms, or current remedies…"
                        className="w-full resize-none rounded-xl border border-stone-300/80 bg-[#FDFBF7] px-4 py-3.5 text-sm outline-none transition-all duration-200 ease-in-out placeholder:text-stone-400 focus:border-[#1B4332] focus:ring-2 focus:ring-[#1B4332]/10"
                      />
                    </label>
                  </fieldset>

                  <fieldset>
                    <legend className="text-xs font-bold uppercase tracking-[0.16em] text-[#1B4332]/70">
                      Preferred Date &amp; Time
                    </legend>
                    <div className="mt-3 grid gap-4 sm:grid-cols-2">
                      <label className="block">
                        <span className="mb-1.5 block text-xs font-semibold text-stone-600">
                          Preferred Date
                        </span>
                        <span className="relative block">
                          <CalendarDays className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-stone-400" />
                          <input
                            name="date"
                            type="date"
                            required
                            className={`${field} pl-10`}
                          />
                        </span>
                      </label>
                      <div>
                        <span className="mb-1.5 block text-xs font-semibold text-stone-600">
                          Preferred Time Window
                        </span>
                        <div className="grid grid-cols-3 gap-2">
                          {(
                            [
                              ["morning", "Morning"],
                              ["afternoon", "Afternoon"],
                              ["evening", "Evening"],
                            ] as const
                          ).map(([id, label]) => (
                            <button
                              key={id}
                              type="button"
                              onClick={() => setTimeSlot(id)}
                              className={`h-12 rounded-xl border text-xs font-semibold transition ${
                                timeSlot === id
                                  ? "border-[#1B4332] bg-[#1B4332] text-white"
                                  : "border-stone-200 bg-[#FDFBF7] text-[#1B4332] hover:border-[#1B4332]/35"
                              }`}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </fieldset>

                  <div className="flex flex-col gap-3 border-t border-stone-100 pt-6 sm:flex-row sm:flex-wrap sm:items-center">
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="inline-flex h-12 items-center justify-center rounded-full bg-[#1B4332] px-8 text-sm font-semibold text-white shadow-md transition hover:bg-[#143326]"
                    >
                      Request Consultation →
                    </motion.button>
                    <a
                      href={waHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[#25D366] px-6 text-sm font-semibold text-[#1B4332] transition hover:bg-[#25D366]/10"
                    >
                      <WhatsAppIcon className="h-4 w-4 text-[#25D366]" title="" />
                      Chat Directly on WhatsApp for Urgent Booking
                    </a>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </Reveal>
      </section>

      {/* Section 4 — Journey */}
      <section className="bg-[#F4F1EA] px-6 py-20">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold text-[#141414] sm:text-4xl">
              How Your Consultation Works
            </h2>
            <p className="mt-3 text-sm text-stone-600 sm:text-base">
              A clear path from first message to tailored herbal care.
            </p>
          </div>
        </Reveal>
        <div className="mx-auto mt-12 grid max-w-6xl gap-6 md:grid-cols-4">
          {journey.map((item, i) => (
            <Reveal key={item.step} delay={i * 0.08}>
              <div className="h-full rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <p className="font-display text-3xl font-bold text-[#1B4332]/25">{item.step}</p>
                <h3 className="font-display mt-3 text-lg font-bold text-[#1B4332]">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">{item.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Section 5 — FAQ */}
      <section className="bg-white px-6 py-20">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold text-[#141414] sm:text-4xl">
              Frequently Asked Questions
            </h2>
          </div>
        </Reveal>
        <div className="mx-auto mt-10 max-w-3xl space-y-4">
          {faqs.map((item, i) => {
            const open = openFaq === i;
            return (
              <Reveal key={item.q} delay={i * 0.05}>
                <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-[#FDFBF7]">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(open ? null : i)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                    aria-expanded={open}
                  >
                    <span className="font-display text-base font-bold text-[#1B4332] sm:text-lg">
                      {item.q}
                    </span>
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
                        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <p className="border-t border-stone-200/70 px-5 pb-5 pt-3 text-sm leading-relaxed text-stone-600">
                          {item.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={0.15}>
          <div className="mx-auto mt-12 max-w-3xl rounded-2xl border border-stone-200/80 bg-[#FAF8F5] p-6 text-center sm:p-8">
            <p className="font-display text-xl font-bold text-[#1B4332]">
              Prefer to talk first?
            </p>
            <p className="mt-2 text-sm text-stone-600">
              Reach our clinic team for urgent booking on{" "}
              <a href={`tel:${siteConfig.phone}`} className="font-semibold text-[#1B4332]">
                {siteConfig.phone}
              </a>
            </p>
            <Link
              href="/contact"
              className="mt-5 inline-flex text-sm font-semibold text-[#1B4332] underline-offset-4 hover:underline"
            >
              Or visit the Contact page →
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
