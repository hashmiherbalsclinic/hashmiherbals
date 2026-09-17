import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import { SiteChrome } from "@/components/SiteChrome";
import { siteConfig } from "@/lib/catalog";
import "./globals.css";

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
});

const body = Outfit({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable} flex min-h-dvh flex-col font-sans`}>
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
