import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { siteConfig } from "@/lib/catalog";

export function WhatsAppButton() {
  const href = `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(
    "Assalamualaikum! I have a question about Hashmi Herbals."
  )}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105"
      aria-label="WhatsApp"
    >
      <WhatsAppIcon className="h-7 w-7" title="" />
    </a>
  );
}
