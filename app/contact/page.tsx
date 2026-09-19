import { ContactMap } from "@/components/ContactMap";
import { ContactSection } from "@/components/ContactSection";
import { siteConfig } from "@/lib/catalog";

export const metadata = {
  title: "Contact",
  description: `Contact ${siteConfig.name} by phone, WhatsApp, or message. Nationwide COD support across Pakistan.`,
};

export default function ContactPage() {
  return (
    <div className="bg-white">
      {/* Section 1 - Editorial hero */}
      <section className="border-b border-stone-200/60 bg-[#FAF8F5] px-6 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <span className="mb-4 inline-block rounded-full border border-[#1B4332]/10 bg-[#1B4332]/5 px-3.5 py-1 text-xs font-semibold tracking-wide text-[#1B4332]">
            We&apos;re Here to Help
          </span>
          <h1 className="font-display mb-4 text-3xl font-bold tracking-tight text-[#1B4332] md:text-5xl">
            Get in Touch with Hashmi Herbals
          </h1>
          <p className="mx-auto max-w-xl text-base leading-relaxed text-stone-600 md:text-lg">
            Have questions about a traditional Unani remedy, dosage, or your Cash on Delivery
            order? Our clinic team is here to assist you.
          </p>
        </div>
      </section>

      <ContactSection variant="page" />
      <ContactMap />
    </div>
  );
}
