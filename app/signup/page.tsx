import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SignupForm } from "@/components/auth/SignupForm";
import { getSessionUser } from "@/lib/auth/customer";
import { siteConfig } from "@/lib/catalog";

export const metadata = {
  title: "Create account",
  description: `Create your ${siteConfig.name} account.`,
};

export default async function SignupPage({
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
          <h1 className="font-display mt-2 text-3xl font-bold text-[#1B4332]">
            Create account
          </h1>
          <p className="mt-2 text-sm text-stone-600">
            Save your details for faster COD checkout.
          </p>
        </div>

        <div className="mt-8 rounded-3xl border border-stone-200/80 bg-white p-6 shadow-sm sm:p-8">
          <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-stone-100" />}>
            <SignupForm />
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
