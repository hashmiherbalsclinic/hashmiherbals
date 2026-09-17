import { AboutContent } from "@/components/AboutContent";
import { siteConfig } from "@/lib/catalog";

export const metadata = {
  title: "About",
  description: `Meet ${siteConfig.hakeemName} and the story behind ${siteConfig.name}: Unani care, herbal formulas, and trusted products for Pakistani homes.`,
};

export default function AboutPage() {
  return <AboutContent />;
}
