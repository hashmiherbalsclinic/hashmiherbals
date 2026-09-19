import { Suspense } from "react";
import { HomePage } from "@/components/HomePage";

export const revalidate = 60;

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-7xl animate-pulse px-6 py-16">
          <div className="h-72 rounded-2xl bg-stone-100" />
          <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] rounded-2xl bg-stone-100" />
            ))}
          </div>
        </div>
      }
    >
      <HomePage />
    </Suspense>
  );
}
