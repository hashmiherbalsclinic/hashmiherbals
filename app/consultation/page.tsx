import { ConsultationContent } from "@/components/consultation/ConsultationContent";
import { siteConfig } from "@/lib/catalog";

export const metadata = {
  title: "Consultation",
  description: `Book an online Unani consultation or in-clinic visit with ${siteConfig.name}. WhatsApp, video, and face-to-face herbal care with ${siteConfig.hakeemName}.`,
};

export default function ConsultationPage() {
  return <ConsultationContent />;
}
