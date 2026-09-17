import { PolicyPage } from "@/components/PolicyPage";
import { siteConfig } from "@/lib/catalog";

export const metadata = { title: "Shipping policy" };

export default function ShippingPolicyPage() {
  return (
    <PolicyPage title="Shipping policy" eyebrow="Help & support">
      <p>
        {siteConfig.name} delivers herbal products across Pakistan with Cash on Delivery available
        nationwide.
      </p>
      <p>
        <strong className="font-semibold text-ink">Delivery time.</strong> Most orders are
        dispatched within 1-2 business days. Delivery typically takes 2-5 business days depending
        on your city. Remote areas may take longer.
      </p>
      <p>
        <strong className="font-semibold text-ink">Shipping fees.</strong> A flat shipping fee of
        PKR {siteConfig.shippingFee.toLocaleString()} applies to orders under PKR{" "}
        {siteConfig.freeShippingMin.toLocaleString()}. Orders of PKR{" "}
        {siteConfig.freeShippingMin.toLocaleString()}+ qualify for free shipping.
      </p>
      <p>
        <strong className="font-semibold text-ink">Tracking & updates.</strong> After dispatch, we
        may share courier details by phone or WhatsApp. Please keep your phone reachable on the
        delivery day.
      </p>
      <p>
        <strong className="font-semibold text-ink">Failed delivery.</strong> If the courier cannot
        reach you after reasonable attempts, the order may be returned. Re-delivery or cancellation
        will be arranged with our team.
      </p>
      <p>
        Need help with an order in transit? Call{" "}
        <a href={`tel:${siteConfig.phone}`} className="font-medium text-ink hover:text-green">
          {siteConfig.phone}
        </a>
        .
      </p>
    </PolicyPage>
  );
}
