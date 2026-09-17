import Image from "next/image";
import Link from "next/link";
import { Beaker, ClipboardCheck, Stethoscope } from "lucide-react";
import { Reveal } from "@/components/Reveal";

const pillars = [
  {
    icon: Beaker,
    title: "Direct Sourcing & Lab Testing",
    text: "Botanicals chosen with care and verified for purity before they reach your shelf.",
  },
  {
    icon: ClipboardCheck,
    title: "Transparent & Honest Dosage Labels",
    text: "Clear guidance on every pack — so traditional formulas feel modern and trustworthy.",
  },
  {
    icon: Stethoscope,
    title: "Dedicated Unani Practitioner Guidance",
    text: "Clinic-rooted support when you need help choosing the right remedy for your home.",
  },
];

export function BrandStory() {
  return (
    <section className="relative overflow-hidden bg-white py-20">
      <div
        aria-hidden
        className="absolute -left-24 bottom-0 -z-10 h-96 w-96 rounded-full bg-emerald-900/5 blur-3xl"
      />
      <div className="relative mx-auto grid max-w-[1280px] items-center gap-12 px-4 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:px-12 xl:px-16">
        <Reveal>
          <div className="relative mx-auto w-full max-w-lg lg:mx-0">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#F5F1E9] shadow-[0_4px_20px_rgba(0,0,0,0.03)] ring-1 ring-stone-200/80">
              <Image
                src="/images/our-promise.webp"
                alt="Herbal oils, honey, and botanicals"
                fill
                className="object-cover transition duration-700 hover:scale-[1.03]"
                sizes="(max-width:1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1B4332]/45 via-transparent to-transparent" />
              <div className="absolute bottom-0 p-6 text-white sm:p-8">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#E8F0E0]">
                  Our promise
                </p>
                <p className="font-display mt-2 text-2xl font-bold sm:text-3xl">
                  Rooted in tradition. Chosen with care.
                </p>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#1B4332]/65">
              Our Philosophy
            </p>
            <h2 className="font-display mt-3 text-3xl font-bold leading-tight text-[#141414] sm:text-4xl">
              Bridging ancient Pansar wisdom with modern purity.
            </h2>
            <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-[#6b7280] sm:text-base">
              Inspired by Pakistan&apos;s pansari heritage and the clarity of modern herbal brands,
              we bring authentic oils, majoons, powders, and salajeet to everyday homes.
            </p>

            <ul className="mt-8 space-y-4">
              {pillars.map(({ icon: Icon, title, text }) => (
                <li
                  key={title}
                  className="flex gap-4 rounded-2xl border border-stone-200/80 bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F4F1EA] text-[#1B4332]">
                    <Icon className="h-4 w-4" strokeWidth={1.75} />
                  </span>
                  <div>
                    <p className="font-semibold text-[#1B4332]">{title}</p>
                    <p className="mt-0.5 text-sm leading-relaxed text-[#6b7280]">{text}</p>
                  </div>
                </li>
              ))}
            </ul>

            <Link
              href="/about"
              className="mt-8 inline-flex h-12 min-h-12 items-center rounded-full bg-[#1B4332] px-6 text-sm font-semibold text-white transition hover:bg-[#143528]"
            >
              Read Our Story →
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
