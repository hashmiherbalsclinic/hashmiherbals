import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { getSessionUser } from "@/lib/auth/customer";
import { siteConfig } from "@/lib/catalog";

export const metadata = {
  title: "Sign in",
  description: `Sign in to your ${siteConfig.name} account.`,
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const user = await getSessionUser();
  const { next } = await searchParams;
  if (user) redirect(next?.startsWith("/") ? next : "/account");

  return (
    <div className="bg-[#FAF8F5]">
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1B4332]/65">
            Account
          </p>
          <h1 className="font-display mt-2 text-3xl font-bold text-[#1B4332]">Sign in</h1>
          <p className="mt-2 text-sm text-stone-600">
            Access your orders and checkout faster.
          </p>
        </div>

        <div className="mt-8 rounded-3xl border border-stone-200/80 bg-white p-6 shadow-sm sm:p-8">
          <Suspense fallback={<div className="h-48 animate-pulse rounded-xl bg-stone-100" />}>
            <LoginForm />
          </Suspense>
        </div>

        <p className="mt-6 text-center text-sm text-stone-500">
          <Link href="/" className="hover:text-[#1B4332] hover:underline">
            ← Back to store
          </Link>
        </p>
      </div>
    </div>
  );
}
