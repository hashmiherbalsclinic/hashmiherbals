import { ExternalLink, MapPin } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { siteConfig } from "@/lib/catalog";

function mapsEmbedSrc() {
  if (siteConfig.mapsEmbedUrl) return siteConfig.mapsEmbedUrl;
  const query = siteConfig.mapsQuery || `${siteConfig.address} ${siteConfig.addressDetail}`;
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=15&output=embed`;
}

function mapsOpenHref() {
  if (siteConfig.mapsUrl) return siteConfig.mapsUrl;
  const query = siteConfig.mapsQuery || `${siteConfig.address} ${siteConfig.addressDetail}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function ContactMap() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <Reveal>
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#1B4332]/65">
                Find Us
              </p>
              <h2 className="font-display mt-2 text-2xl font-bold text-[#1B4332] sm:text-3xl">
                Visit Our Clinic Location
              </h2>
              <p className="mt-2 flex items-start gap-2 text-sm text-stone-600">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#1B4332]" />
                <span>
                  {siteConfig.address}
                  {siteConfig.addressDetail ? `, ${siteConfig.addressDetail}` : ""}
                </span>
              </p>
            </div>
            <a
              href={mapsOpenHref()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-[#1B4332]/20 bg-[#FAF8F5] px-5 py-2.5 text-sm font-semibold text-[#1B4332] transition hover:border-[#1B4332]/40 hover:bg-[#1B4332] hover:text-white"
            >
              Open in Google Maps
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="relative h-[400px] overflow-hidden rounded-3xl border border-stone-300/80 shadow-lg">
            <iframe
              title={`${siteConfig.name} location map`}
              src={mapsEmbedSrc()}
              className="absolute inset-0 h-full w-full border-0"
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
