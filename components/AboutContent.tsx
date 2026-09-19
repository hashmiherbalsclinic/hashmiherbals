import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Heart, Phone, Shield } from "lucide-react";
import { CertificatesGallery } from "@/components/CertificatesGallery";
import { Reveal } from "@/components/Reveal";
import { siteConfig } from "@/lib/catalog";

/** Update these with your father's real details when ready */
const hakeem = {
  name: "Syed Mubashar Akhtar Hashmi",
  title: "Unani Practitioner & Herbal Formulator",
  experience: "25+ years",
  focus: "Traditional Unani care, herbal compounding & patient guidance",
  clinic: "Hashmi Herbal Clinic",
  image: "/images/mubashar-akhtar.webp",
  bio: [
    "For more than two decades, Syed Mubashar Akhtar Hashmi has served families through traditional Unani medicine, combining classical herbal knowledge with careful, patient-first care at the Hashmi Herbal Clinic.",
    "Alongside consultations, he prepares and supervises herbal formulas, oils, majoons, powders, and salajeet so every product leaving our shop reflects the same standard he expects for his own patients.",
    "Hashmi Herbals continues that trust online: authentic botanicals, clear guidance, and Cash on Delivery across Pakistan, rooted in a living clinic tradition.",
  ],
  highlights: [
    { label: "Experience", value: "25+ years" },
    { label: "Practice", value: "Unani Tibb" },
    { label: "Focus", value: "Clinic + formulations" },
  ],
};

const pillars = [
  {
    icon: Shield,
    title: "Patient-first formulas",
    text: "Products prepared with the same care used in clinic guidance.",
  },
  {
    icon: BadgeCheck,
    title: "Trusted sourcing",
    text: "Botanicals chosen for authenticity, clarity, and everyday use.",
  },
  {
    icon: Heart,
    title: "Family legacy",
    text: "A Hashmi household tradition of Unani herbal service.",
  },
];

export function AboutContent() {
  return (
    <div className="bg-white">
      {/* Section 1 - Cinematic editorial hero */}
      <section className="relative flex min-h-[440px] items-center justify-center overflow-hidden lg:min-h-[500px]">
        <Image
          src="/images/about-hero.jpg"
          alt=""
          fill
          priority
          className="absolute inset-0 h-full w-full object-cover object-center"
          sizes="100vw"
          aria-hidden
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-r from-[#1B4332]/90 via-[#1B4332]/80 to-[#1B4332]/90 backdrop-brightness-90"
        />

        <Reveal className="relative z-10 mx-auto max-w-4xl px-6 py-16 text-center">
          <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium tracking-wide text-emerald-100 backdrop-blur-md">
            Our Story &amp; Heritage
          </span>
          <h1 className="font-display mb-4 mt-6 text-3xl font-bold tracking-tight text-white drop-shadow-sm md:text-5xl">
            A clinic tradition, brought to your home.
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-base font-light leading-relaxed text-emerald-50/90 md:text-lg">
            {siteConfig.name} grows from {siteConfig.hakeemName}&apos;s Unani practice: honest
            botanicals, careful formulas, and guidance you can trust.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/shop"
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#1B4332] shadow-lg transition-all hover:scale-[1.03] hover:bg-emerald-50 active:scale-[0.97]"
            >
              Shop Remedies →
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition-all hover:scale-[1.03] hover:bg-white/20 active:scale-[0.97]"
            >
              Contact Clinic
            </Link>
          </div>
        </Reveal>
      </section>

      {/* Section 2 - Practitioner profile */}
      <section className="bg-[#FAF8F5] py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-12 lg:px-8">
          <Reveal className="relative lg:col-span-5">
            <div className="overflow-hidden rounded-3xl border border-stone-200 shadow-xl">
              <div className="relative aspect-[4/5] bg-[#EDE9E0]">
                <Image
                  src={hakeem.image}
                  alt={hakeem.name}
                  fill
                  className="object-cover object-top"
                  sizes="(max-width:1024px) 90vw, 420px"
                  priority
                />
                <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/25 bg-white/85 px-5 py-4 shadow-lg backdrop-blur-md">
                  <p className="font-display text-xl font-bold text-[#141414]">
                    {hakeem.name}
                  </p>
                  <p className="mt-0.5 text-sm text-[#1B4332]/80">{hakeem.title}</p>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.08} className="lg:col-span-7">
            <h2 className="font-display text-3xl font-bold tracking-tight text-[#141414] sm:text-4xl">
              Guidance rooted in Unani care.
            </h2>
            <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-stone-700 sm:text-base">
              {hakeem.bio.map((para) => (
                <p key={para.slice(0, 40)}>{para}</p>
              ))}
            </div>

            <dl className="mt-8 grid gap-3 sm:grid-cols-3">
              {hakeem.highlights.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-stone-200/80 bg-white px-4 py-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                >
                  <dt className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#1B4332]/65">
                    {item.label}
                  </dt>
                  <dd className="mt-1.5 font-display text-lg font-bold text-[#141414]">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>

            <a
              href={`tel:${siteConfig.hakeemPhoneRaw}`}
              className="mt-6 flex items-center gap-3 rounded-2xl border border-[#1B4332]/15 bg-white px-4 py-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition hover:border-[#1B4332]/30 hover:shadow-md"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1B4332]/10 text-[#1B4332]">
                <Phone className="h-4 w-4" strokeWidth={1.75} />
              </span>
              <span>
                <span className="block text-[11px] font-bold uppercase tracking-[0.14em] text-[#1B4332]/65">
                  {siteConfig.hakeemName}
                </span>
                <span className="mt-0.5 block text-sm font-semibold text-[#141414]">
                  {siteConfig.hakeemPhone}
                </span>
              </span>
            </a>

            <p className="mt-6 text-sm text-stone-600">
              <span className="font-semibold text-[#141414]">{hakeem.clinic}</span>
              <span className="mx-2 text-[#1B4332]/30">·</span>
              {hakeem.focus}
            </p>
          </Reveal>
        </div>
      </section>

      {/* Section 3 - Brand pillars */}
      <section className="border-y border-stone-200/60 bg-white py-20">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#1B4332]/65">
                What we stand for
              </p>
              <h2 className="font-display mt-3 text-3xl font-bold text-[#141414] sm:text-4xl">
                Clinic standards, shop honesty
              </h2>
            </div>
          </Reveal>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {pillars.map((item, i) => (
              <Reveal key={item.title} delay={i * 0.08}>
                <div className="rounded-2xl border border-stone-200/80 bg-[#FDFBF7] p-8 shadow-sm transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-md">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1B4332]/10 text-[#1B4332] transition-transform duration-300 group-hover:scale-[1.08]">
                    <item.icon className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <h3 className="font-display mb-2 mt-5 text-lg font-bold text-[#1B4332]">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-stone-600">{item.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#F4F1EA] py-20">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#1B4332]/65">
                Credentials
              </p>
              <h2 className="font-display mt-3 text-3xl font-bold text-[#141414] sm:text-4xl">
                Licenses &amp; Credentials
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-stone-600 sm:text-base">
                Verified clinic license by Punjab Healthcare Commission &amp; National Council
                for Tibb. Click any image to view it larger.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <CertificatesGallery />
          </Reveal>
        </div>
      </section>
    </div>
  );
}
