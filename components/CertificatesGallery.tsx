"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { certificates, type Certificate } from "@/lib/certificates";

export function CertificatesGallery() {
  const [active, setActive] = useState<Certificate | null>(null);
  const [broken, setBroken] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [active]);

  return (
    <>
      <div className="mx-auto mt-12 grid max-w-4xl gap-8 md:grid-cols-2">
        {certificates.map((cert) => {
          const missing = broken[cert.id];
          return (
            <button
              key={cert.id}
              type="button"
              onClick={() => !missing && setActive(cert)}
              className="group text-left transition-all"
            >
              <div className="rounded-2xl border border-stone-300/60 bg-white p-4 shadow-md transition-all duration-300 group-hover:shadow-xl">
                <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-[#FAF8F5]">
                  {!missing ? (
                    <>
                      <Image
                        src={cert.image}
                        alt={cert.title}
                        fill
                        className="object-contain p-2 transition-transform duration-500 group-hover:scale-[1.02]"
                        sizes="(max-width:768px) 100vw, 400px"
                        onError={() =>
                          setBroken((prev) => ({ ...prev, [cert.id]: true }))
                        }
                      />
                      <span className="absolute inset-x-3 bottom-3 flex items-center justify-center gap-1.5 rounded-full border border-stone-200/80 bg-white/90 px-3 py-2 text-[11px] font-semibold text-[#1B4332] opacity-90 shadow-sm backdrop-blur-sm transition group-hover:opacity-100">
                        <Search className="h-3.5 w-3.5" strokeWidth={2} />
                        Click to Expand / View Full License
                      </span>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center">
                      <div className="h-16 w-12 rounded border-2 border-dashed border-[#1B4332]/25 bg-white/60" />
                      <p className="text-xs font-semibold text-[#1B4332]">Add image</p>
                      <p className="text-[10px] leading-snug text-stone-500">
                        {cert.image.replace("/images/certificates/", "")}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 px-1">
                {cert.year && (
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#1B4332]/65">
                    {cert.year}
                  </p>
                )}
                <p className="mt-1 font-display text-lg font-bold leading-snug text-[#141414]">
                  {cert.title}
                </p>
                {cert.issuer && (
                  <p className="mt-0.5 text-xs text-stone-500">{cert.issuer}</p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {active && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-8">
          <button
            type="button"
            className="absolute inset-0 bg-black/70"
            aria-label="Close certificate"
            onClick={() => setActive(null)}
          />
          <div className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3">
              <div>
                <p className="font-display text-lg font-bold text-[#141414]">
                  {active.title}
                </p>
                {active.issuer && (
                  <p className="text-xs text-stone-500">{active.issuer}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setActive(null)}
                className="rounded-full p-2 hover:bg-stone-100"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="relative min-h-[50vh] flex-1 bg-[#FAF8F5]">
              <Image
                src={active.image}
                alt={active.title}
                fill
                className="object-contain p-4 sm:p-6"
                sizes="(max-width:768px) 100vw, 768px"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
