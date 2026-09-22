import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/catalog";
import { isMaintenanceMode } from "@/lib/site-settings";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Under construction",
  robots: { index: false, follow: false },
};

export const revalidate = 15;

export default async function UnderConstructionPage() {
  const locked = await isMaintenanceMode();
  if (!locked) {
    redirect("/");
  }

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(114,166,56,0.18), transparent 55%), linear-gradient(165deg, #fafaf8 0%, #eef2ea 45%, #e4ebe0 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 opacity-40"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231b4d3e' fill-opacity='0.06'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        }}
      />

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <p className="font-display text-4xl font-semibold tracking-tight text-forest sm:text-5xl md:text-6xl">
          {siteConfig.name}
        </p>
        <div className="mt-8 h-px w-16 bg-green/50" />
        <h1 className="mt-8 max-w-md font-display text-2xl font-medium text-ink sm:text-3xl">
          Website under construction
        </h1>
        <p className="mt-4 max-w-sm text-base leading-relaxed text-muted">
          We&apos;re refreshing the store for a better experience. Please check
          back soon.
        </p>
        <p className="mt-10 text-sm text-muted/80">
          Staff?{" "}
          <Link
            href="/admin/login"
            className="font-medium text-forest underline-offset-4 transition hover:text-green hover:underline"
          >
            Admin sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
