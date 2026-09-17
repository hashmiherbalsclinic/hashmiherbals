import { PolicyPage } from "@/components/PolicyPage";
import { siteConfig } from "@/lib/catalog";

export const metadata = { title: "Refund policy" };

export default function RefundPolicyPage() {
  return (
    <PolicyPage title="Refund policy" eyebrow="Help & support">
      <p>
        We want you to feel confident ordering from {siteConfig.name}. This policy explains when
        refunds or replacements apply.
      </p>
      <p>
        <strong className="font-semibold text-ink">Damaged or incorrect items.</strong> If your
        order arrives damaged, incomplete, or incorrect, contact us within 48 hours of delivery
        with your order details and a clear photo. We will arrange a replacement or refund where
        appropriate.
      </p>
      <p>
        <strong className="font-semibold text-ink">Opened herbal products.</strong> For hygiene and
        quality reasons, opened or used oils, majoons, powders, and similar products generally
        cannot be returned unless they were defective on arrival.
      </p>
      <p>
        <strong className="font-semibold text-ink">Change of mind.</strong> Unused items in original
        sealed packaging may be eligible for exchange or store credit if reported within 3 days of
        delivery. Shipping fees are non-refundable in change-of-mind cases unless we made an error.
      </p>
      <p>
        <strong className="font-semibold text-ink">How refunds work.</strong> Approved COD refunds
        are typically processed as cash return via courier, bank transfer, or store credit, as
        agreed with you. Processing usually takes 5-10 business days after approval.
      </p>
      <p>
        To start a refund or replacement request, WhatsApp or call{" "}
        <a href={`tel:${siteConfig.phone}`} className="font-medium text-ink hover:text-green">
          {siteConfig.phone}
        </a>
        .
      </p>
    </PolicyPage>
  );
}
