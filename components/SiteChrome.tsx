"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

const CartDrawer = dynamic(
  () => import("@/components/CartDrawer").then((m) => m.CartDrawer),
  { ssr: false }
);

const WhatsAppButton = dynamic(
  () => import("@/components/WhatsAppButton").then((m) => m.WhatsAppButton),
  { ssr: false }
);

const TrackOrderWidget = dynamic(
  () => import("@/components/TrackOrderWidget").then((m) => m.TrackOrderWidget),
  { ssr: false }
);

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const isCheckout = pathname.startsWith("/checkout");
  const isUnderConstruction = pathname === "/under-construction";

  if (isAdmin || isUnderConstruction) {
    return <>{children}</>;
  }

  if (isCheckout) {
    return (
      <>
        <main className="flex-1">{children}</main>
        <TrackOrderWidget />
        <WhatsAppButton />
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <CartDrawer />
      <TrackOrderWidget />
      <WhatsAppButton />
    </>
  );
}
