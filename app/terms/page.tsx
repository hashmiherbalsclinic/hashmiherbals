import { PolicyPage } from "@/components/PolicyPage";
import { siteConfig } from "@/lib/catalog";

export const metadata = { title: "Terms & conditions" };

export default function TermsPage() {
  return (
    <PolicyPage title="Terms & conditions" eyebrow="Help & support">
      <p>
        By browsing or placing an order on {siteConfig.name}, you agree to these terms. Please read
        them carefully before checkout.
      </p>
      <p>
        <strong className="font-semibold text-ink">Products.</strong> Our herbal oils, majoons,
        powders, seeds, and salajeet are traditional wellness products. They are not a substitute
        for professional medical advice, diagnosis, or treatment. If you are pregnant, nursing, or
        taking medication, consult a qualified practitioner before use.
      </p>
      <p>
        <strong className="font-semibold text-ink">Orders.</strong> Orders are confirmed subject to
        product availability. We may contact you by phone or WhatsApp to verify details before
        dispatch. Prices are listed in Pakistani Rupees (PKR) and may change without prior notice.
      </p>
      <p>
        <strong className="font-semibold text-ink">Payment.</strong> We currently offer Cash on
        Delivery (COD) nationwide. Payment is collected upon delivery of your order.
      </p>
      <p>
        <strong className="font-semibold text-ink">Accuracy.</strong> You are responsible for
        providing a correct name, phone number, and delivery address. Incorrect details may delay
        or cancel delivery.
      </p>
      <p>
        For questions, call{" "}
        <a href={`tel:${siteConfig.phone}`} className="font-medium text-ink hover:text-green">
          {siteConfig.phone}
        </a>{" "}
        or message us on WhatsApp.
      </p>
    </PolicyPage>
  );
}
