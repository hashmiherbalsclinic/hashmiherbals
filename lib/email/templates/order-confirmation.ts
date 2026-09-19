import { formatPrice, siteConfig } from "@/lib/catalog";

type OrderConfirmationItem = {
  product_title: string;
  size_label?: string;
  unit_price: number;
  quantity: number;
};

type OrderConfirmationData = {
  orderNumber: string;
  customerName: string;
  phone: string;
  address: string;
  city?: string;
  subtotal: number;
  shippingFee: number;
  total: number;
  items: OrderConfirmationItem[];
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Customer-facing COD order confirmation — table-based, mobile-safe HTML. */
export function buildOrderConfirmationHtml(order: OrderConfirmationData) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hashmiherbals.com";
  const waHref = `https://wa.me/${siteConfig.whatsapp}`;
  const shippingLabel =
    order.shippingFee === 0 ? "Free" : formatPrice(order.shippingFee);
  const addressLine = [order.address, order.city].filter(Boolean).join(", ");
  const preheader = `Order ${order.orderNumber} confirmed - Total ${formatPrice(order.total)} COD`;

  const itemRows = order.items
    .map((item) => {
      const detail = [
        escapeHtml(item.product_title),
        item.size_label ? escapeHtml(item.size_label) : null,
        `Qty ${item.quantity}`,
      ]
        .filter(Boolean)
        .join(" - ");
      const line = formatPrice(item.unit_price * item.quantity);
      return `<tr>
        <td style="padding:12px 0;border-bottom:1px solid #E7E5E4;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.45;color:#1C1917;">
          ${detail}
        </td>
        <td style="padding:12px 0;border-bottom:1px solid #E7E5E4;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:#1B4332;text-align:right;white-space:nowrap;vertical-align:top;">
          ${line}
        </td>
      </tr>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Order confirmed - ${escapeHtml(order.orderNumber)}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td { font-family: Arial, Helvetica, sans-serif !important; }
  </style>
  <![endif]-->
  <style type="text/css">
    @media only screen and (max-width: 600px) {
      .email-shell { padding: 16px 10px !important; }
      .email-card { width: 100% !important; border-radius: 12px !important; }
      .email-pad { padding-left: 16px !important; padding-right: 16px !important; }
      .email-header { padding: 28px 16px !important; }
      .email-headline { font-size: 22px !important; }
      .email-ref { margin: 16px !important; }
      .email-block { margin-left: 16px !important; margin-right: 16px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#FAF8F5;font-family:Arial,Helvetica,sans-serif;color:#1C1917;-webkit-font-smoothing:antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">
    ${escapeHtml(preheader)}
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#FAF8F5;">
    <tr>
      <td align="center" class="email-shell" style="padding:28px 16px;">
        <table role="presentation" class="email-card" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;margin:0 auto;background:#FFFFFF;border:1px solid #E5E2D9;border-radius:16px;overflow:hidden;">

          <!-- A. Header -->
          <tr>
            <td class="email-header" align="center" style="background:#1B4332;padding:32px 24px;text-align:center;">
              <p style="margin:0 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#E8F5E9;">
                ${escapeHtml(siteConfig.name)}
              </p>
              <span style="display:inline-block;background:rgba(255,255,255,0.15);color:#E8F5E9;font-size:11px;padding:4px 12px;border-radius:20px;font-weight:600;text-transform:uppercase;font-family:Arial,Helvetica,sans-serif;letter-spacing:0.06em;">
                ORDER CONFIRMED
              </span>
              <h1 class="email-headline" style="margin:12px 0 0;font-family:Georgia,'Times New Roman',serif;color:#FFFFFF;font-size:26px;font-weight:700;line-height:1.25;">
                Shukriya for your order!
              </h1>
              <p style="margin:12px 0 0;font-family:Arial,Helvetica,sans-serif;color:#E2E8F0;font-size:14px;font-weight:400;line-height:1.55;">
                Assalamu Alaikum ${escapeHtml(order.customerName)} - your Cash on Delivery order is received and being prepared.
              </p>
            </td>
          </tr>

          <!-- B. Order reference -->
          <tr>
            <td class="email-pad" style="padding:0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td class="email-ref" style="padding:24px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F4F6F3;border:1px solid #E0E7DF;border-radius:12px;">
                      <tr>
                        <td style="padding:16px 20px;">
                          <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#57534E;">
                            Order number
                          </p>
                          <p style="margin:6px 0 0;font-family:Arial,Helvetica,sans-serif;color:#1B4332;font-size:18px;font-weight:700;">
                            Order #${escapeHtml(order.orderNumber)}
                          </p>
                          <p style="margin:8px 0 0;font-family:Arial,Helvetica,sans-serif;color:#57534E;font-size:13px;">
                            Payment Method: Cash on Delivery (COD)
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- C. Order summary -->
          <tr>
            <td class="email-pad email-block" style="padding:0 24px 8px;">
              <p style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;color:#1B4332;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">
                Order Summary
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;">
                ${itemRows}
              </table>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:8px;border-collapse:collapse;">
                <tr>
                  <td style="padding:10px 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#57534E;">Subtotal</td>
                  <td style="padding:10px 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#1C1917;text-align:right;">${formatPrice(order.subtotal)}</td>
                </tr>
                <tr>
                  <td style="padding:4px 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#57534E;">Shipping (Nationwide COD)</td>
                  <td style="padding:4px 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#1C1917;text-align:right;">${shippingLabel}</td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#EAF0EC;border-radius:8px;">
                <tr>
                  <td style="padding:12px 16px;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:700;color:#1B4332;">
                    Total (COD)
                  </td>
                  <td style="padding:12px 16px;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:700;color:#1B4332;text-align:right;">
                    ${formatPrice(order.total)}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- D. Delivery details -->
          <tr>
            <td class="email-pad" style="padding:24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #E7E5E4;border-radius:12px;background:#FFFFFF;">
                <tr>
                  <td style="padding:16px;">
                    <p style="margin:0 0 10px;font-family:Arial,Helvetica,sans-serif;color:#1B4332;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">
                      Delivery Details
                    </p>
                    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.7;color:#1C1917;">
                      <strong style="color:#1C1917;">${escapeHtml(order.customerName)}</strong><br />
                      ${escapeHtml(addressLine)}<br />
                      Phone: ${escapeHtml(order.phone)}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- E. WhatsApp CTA + footer -->
          <tr>
            <td class="email-pad" align="center" style="padding:0 24px 28px;text-align:center;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 16px;">
                <tr>
                  <td align="center" style="border-radius:24px;background:#25D366;">
                    <a href="${waHref}" style="display:inline-block;padding:12px 28px;border-radius:24px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:#FFFFFF;text-decoration:none;">
                      Track Order on WhatsApp
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 20px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:#57534E;">
                We will confirm your order shortly by phone or WhatsApp. Keep your phone reachable on delivery day.
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="border-top:1px solid #E7E5E4;padding-top:18px;text-align:center;">
                    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.7;color:#78716C;">
                      <a href="tel:${escapeHtml(siteConfig.phone.replace(/\s+/g, ""))}" style="color:#78716C;text-decoration:none;">${escapeHtml(siteConfig.phone)}</a>
                      &nbsp;|&nbsp;
                      <a href="mailto:${escapeHtml(siteConfig.email)}" style="color:#78716C;text-decoration:none;">${escapeHtml(siteConfig.email)}</a>
                    </p>
                    <p style="margin:10px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#78716C;">
                      <a href="${escapeHtml(siteUrl)}" style="color:#1B4332;text-decoration:none;font-weight:600;">${escapeHtml(siteConfig.name)}</a>
                      - Traditional Unani Care
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
