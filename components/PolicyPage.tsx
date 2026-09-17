import Link from "next/link";

export function PolicyPage({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-line bg-cream py-14 sm:py-20">
      <div className="container-page max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-forest">{eyebrow}</p>
        <h1 className="font-display mt-3 text-4xl font-bold sm:text-5xl">{title}</h1>
        <div className="mt-8 space-y-5 text-[15px] leading-relaxed text-muted sm:text-base">
          {children}
        </div>
        <Link href="/contact" className="btn-primary mt-10 inline-flex">
          Contact us
        </Link>
      </div>
    </section>
  );
}
