import { formatPrice, siteConfig } from "@/lib/catalog";
import { orderNotifyEmail, sendMail } from "@/lib/email/mailer";

export type OrderEmailItem = {
  product_title: string;
  size_label?: string;
  unit_price: number;
  quantity: number;
};

export type OrderEmailData = {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  phone: string;
  address: string;
  city?: string;
  notes?: string;
  subtotal: number;
  shippingFee: number;
  total: number;
  items: OrderEmailItem[];
};

const C = {
  forest: "#163c2f",
  green: "#1f5c45",
  lime: "#74a13a",
  mint: "#b8d4a8",
  cream: "#f6f4ef",
  surface: "#f3f6f2",
  line: "#e2e8e0",
  muted: "#6b7280",
  ink: "#111111",
  white: "#ffffff",
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function itemsRows(items: OrderEmailItem[]) {
  return items
    .map((item, i) => {
      const size = item.size_label ? ` · ${escapeHtml(item.size_label)}` : "";
      const line = item.unit_price * item.quantity;
      const bg = i % 2 === 0 ? C.white : C.cream;
      return `<tr>
        <td style="padding:14px 16px;background:${bg};border-bottom:1px solid ${C.line};font-size:14px;color:${C.ink};">
          <strong style="display:block;font-size:14px;">${escapeHtml(item.product_title)}</strong>
          <span style="color:${C.muted};font-size:12px;">Qty ${item.quantity}${size}</span>
        </td>
        <td style="padding:14px 16px;background:${bg};border-bottom:1px solid ${C.line};font-size:14px;font-weight:700;color:${C.forest};text-align:right;white-space:nowrap;">
          ${formatPrice(line)}
        </td>
      </tr>`;
    })
    .join("");
}

function itemsText(items: OrderEmailItem[]) {
  return items
    .map((item) => {
      const size = item.size_label ? ` (${item.size_label})` : "";
      return `- ${item.product_title}${size} × ${item.quantity} = ${formatPrice(item.unit_price * item.quantity)}`;
    })
    .join("\n");
}

function totalsBlock(order: OrderEmailData, shippingLabel: string) {
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;border-collapse:collapse;">
    <tr>
      <td style="padding:8px 0;font-size:14px;color:${C.muted};">Subtotal</td>
      <td style="padding:8px 0;font-size:14px;color:${C.ink};text-align:right;">${formatPrice(order.subtotal)}</td>
    </tr>
    <tr>
      <td style="padding:8px 0;font-size:14px;color:${C.muted};">Shipping</td>
      <td style="padding:8px 0;font-size:14px;color:${C.ink};text-align:right;">${shippingLabel}</td>
    </tr>
    <tr>
      <td colspan="2" style="padding-top:10px;border-top:2px solid ${C.forest};"></td>
    </tr>
    <tr>
      <td style="padding:12px 0 4px;font-size:15px;font-weight:700;color:${C.forest};">Total (COD)</td>
      <td style="padding:12px 0 4px;font-size:20px;font-weight:700;color:${C.forest};text-align:right;">${formatPrice(order.total)}</td>
    </tr>
  </table>`;
}

function emailShell(opts: {
  preheader: string;
  badge: string;
  title: string;
  subtitle?: string;
  body: string;
  footerNote: string;
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hashmiherbals.com";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(opts.title)}</title>
</head>
<body style="margin:0;padding:0;background:${C.surface};font-family:Georgia,'Times New Roman',serif;color:${C.ink};-webkit-font-smoothing:antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(opts.preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.surface};padding:28px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:${C.white};border-radius:20px;overflow:hidden;border:1px solid ${C.line};box-shadow:0 18px 40px rgba(22,60,47,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,${C.forest} 0%,${C.green} 100%);padding:28px 28px 24px;">
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:${C.mint};">
                ${escapeHtml(siteConfig.name)}
              </p>
              <p style="margin:10px 0 0;font-family:Arial,Helvetica,sans-serif;display:inline-block;background:rgba(255,255,255,0.12);color:${C.mint};font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;padding:6px 12px;border-radius:999px;">
                ${escapeHtml(opts.badge)}
              </p>
              <h1 style="margin:14px 0 0;font-size:28px;line-height:1.2;font-weight:700;color:${C.white};">
                ${escapeHtml(opts.title)}
              </h1>
              ${
                opts.subtitle
                  ? `<p style="margin:10px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.55;color:rgba(255,255,255,0.78);">${opts.subtitle}</p>`
                  : ""
              }
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:28px 24px 8px;font-family:Arial,Helvetica,sans-serif;">
              ${opts.body}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:8px 24px 28px;font-family:Arial,Helvetica,sans-serif;">
              <div style="margin-top:12px;padding-top:20px;border-top:1px solid ${C.line};">
                <p style="margin:0;font-size:13px;line-height:1.6;color:${C.muted};">${opts.footerNote}</p>
                <p style="margin:14px 0 0;font-size:12px;color:${C.muted};">
                  ${escapeHtml(siteConfig.phone)} ·
                  <a href="mailto:${escapeHtml(siteConfig.email)}" style="color:${C.green};text-decoration:none;">${escapeHtml(siteConfig.email)}</a>
                </p>
                <p style="margin:8px 0 0;font-size:11px;color:#9ca3af;">
                  <a href="${escapeHtml(siteUrl)}" style="color:${C.green};text-decoration:none;">${escapeHtml(siteConfig.name)}</a>
                  · Traditional Unani care · Nationwide COD
                </p>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function sectionCard(title: string, content: string) {
  return `
  <div style="margin:0 0 18px;border:1px solid ${C.line};border-radius:14px;overflow:hidden;background:${C.white};">
    <div style="padding:10px 16px;background:${C.cream};border-bottom:1px solid ${C.line};">
      <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${C.green};">${title}</p>
    </div>
    <div style="padding:14px 16px;">${content}</div>
  </div>`;
}

export async function sendOrderEmails(order: OrderEmailData) {
  const shippingLabel =
    order.shippingFee === 0 ? "Free" : formatPrice(order.shippingFee);
  const addressLine = [order.address, order.city].filter(Boolean).join(", ");
  const waHref = `https://wa.me/${siteConfig.whatsapp}`;

  const orderItemsCard = sectionCard(
    "Order items",
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
      ${itemsRows(order.items)}
    </table>
    ${totalsBlock(order, shippingLabel)}`
  );

  // Customer confirmation
  if (order.customerEmail) {
    const customerHtml = emailShell({
      preheader: `Order ${order.orderNumber} confirmed · Total ${formatPrice(order.total)} COD`,
      badge: "Order confirmed",
      title: "Shukriya for your order",
      subtitle: `Assalamualaikum ${escapeHtml(order.customerName)} — your Cash on Delivery order is received.`,
      body: `
        <div style="margin:0 0 20px;padding:16px 18px;border-radius:14px;background:${C.cream};border:1px solid ${C.line};">
          <p style="margin:0;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${C.green};">Order number</p>
          <p style="margin:6px 0 0;font-size:22px;font-weight:700;color:${C.forest};letter-spacing:0.02em;">${escapeHtml(order.orderNumber)}</p>
          <p style="margin:8px 0 0;font-size:13px;color:${C.muted};">Payment: Cash on Delivery</p>
        </div>

        ${orderItemsCard}

        ${sectionCard(
          "Delivery details",
          `<p style="margin:0;font-size:14px;line-height:1.7;color:${C.ink};">
            <strong>${escapeHtml(order.customerName)}</strong><br/>
            ${escapeHtml(addressLine)}<br/>
            Phone: ${escapeHtml(order.phone)}
          </p>`
        )}

        <table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 6px;">
          <tr>
            <td style="border-radius:999px;background:${C.green};">
              <a href="${waHref}" style="display:inline-block;padding:12px 22px;font-size:13px;font-weight:700;color:${C.white};text-decoration:none;">
                Chat on WhatsApp
              </a>
            </td>
          </tr>
        </table>
        <p style="margin:12px 0 0;font-size:13px;line-height:1.6;color:${C.muted};">
          We&apos;ll confirm your order shortly by phone or WhatsApp. Keep your phone reachable on delivery day.
        </p>
      `,
      footerNote: `This email confirms your order with ${escapeHtml(siteConfig.name)}. If you did not place this order, reply to this email or WhatsApp us.`,
    });

    await sendMail({
      to: order.customerEmail,
      subject: `Order confirmed · ${order.orderNumber} · ${siteConfig.name}`,
      html: customerHtml,
      text: `Assalamualaikum ${order.customerName},

Thank you for ordering from ${siteConfig.name}.
Order ${order.orderNumber} (COD) is received.

${itemsText(order.items)}

Subtotal: ${formatPrice(order.subtotal)}
Shipping: ${shippingLabel}
Total (COD): ${formatPrice(order.total)}

Delivery: ${addressLine}
Phone: ${order.phone}

We'll confirm by phone or WhatsApp shortly.
${siteConfig.phone} · ${siteConfig.email}`,
    });
  }

  // Admin notification
  const adminHtml = emailShell({
    preheader: `New COD order ${order.orderNumber} · ${formatPrice(order.total)} from ${order.customerName}`,
    badge: "New order alert",
    title: "New COD order received",
    subtitle: `${escapeHtml(order.customerName)} placed an order worth ${formatPrice(order.total)}.`,
    body: `
      <div style="margin:0 0 20px;padding:16px 18px;border-radius:14px;background:${C.forest};color:${C.white};">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td>
              <p style="margin:0;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:${C.mint};">Order</p>
              <p style="margin:6px 0 0;font-size:20px;font-weight:700;">${escapeHtml(order.orderNumber)}</p>
            </td>
            <td style="text-align:right;">
              <p style="margin:0;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:${C.mint};">Total</p>
              <p style="margin:6px 0 0;font-size:20px;font-weight:700;">${formatPrice(order.total)}</p>
            </td>
          </tr>
        </table>
      </div>

      ${sectionCard(
        "Customer",
        `<p style="margin:0;font-size:14px;line-height:1.75;color:${C.ink};">
          <strong>${escapeHtml(order.customerName)}</strong><br/>
          <a href="mailto:${escapeHtml(order.customerEmail || "")}" style="color:${C.green};text-decoration:none;">${escapeHtml(order.customerEmail || "—")}</a><br/>
          <a href="tel:${escapeHtml(order.phone)}" style="color:${C.green};text-decoration:none;">${escapeHtml(order.phone)}</a><br/>
          ${escapeHtml(addressLine)}
          ${
            order.notes
              ? `<br/><br/><span style="color:${C.muted};">Note:</span> ${escapeHtml(order.notes)}`
              : ""
          }
        </p>`
      )}

      ${orderItemsCard}

      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 0;">
        <tr>
          <td style="border-radius:999px;background:${C.lime};">
            <a href="tel:${escapeHtml(order.phone)}" style="display:inline-block;padding:12px 20px;font-size:13px;font-weight:700;color:${C.white};text-decoration:none;">
              Call customer
            </a>
          </td>
          <td width="10"></td>
          <td style="border-radius:999px;background:${C.forest};">
            <a href="https://wa.me/${order.phone.replace(/[^\d]/g, "")}" style="display:inline-block;padding:12px 20px;font-size:13px;font-weight:700;color:${C.white};text-decoration:none;">
              WhatsApp customer
            </a>
          </td>
        </tr>
      </table>
    `,
    footerNote: `Internal alert for ${escapeHtml(siteConfig.name)} · Open admin orders to update status.`,
  });

  await sendMail({
    to: orderNotifyEmail(),
    subject: `New COD order ${order.orderNumber} · ${formatPrice(order.total)}`,
    html: adminHtml,
    text: `New COD order ${order.orderNumber}

Customer: ${order.customerName}
Email: ${order.customerEmail || "—"}
Phone: ${order.phone}
Address: ${addressLine}
${order.notes ? `Notes: ${order.notes}\n` : ""}
${itemsText(order.items)}

Subtotal: ${formatPrice(order.subtotal)}
Shipping: ${shippingLabel}
Total (COD): ${formatPrice(order.total)}`,
  });
}

const STATUS_COPY: Record<
  string,
  { badge: string; title: string; message: string }
> = {
  pending: {
    badge: "Order pending",
    title: "Your order is pending confirmation",
    message:
      "We have received your order and our clinic team will confirm it shortly by phone or WhatsApp.",
  },
  confirmed: {
    badge: "Order confirmed",
    title: "Your order has been confirmed",
    message:
      "Good news — your order is confirmed. We are preparing your herbal remedies for dispatch.",
  },
  shipped: {
    badge: "Order shipped",
    title: "Your order is on the way",
    message:
      "Your package has been handed to the courier. Please keep your phone reachable for Cash on Delivery.",
  },
  delivered: {
    badge: "Order delivered",
    title: "Your order was delivered",
    message:
      "We hope your remedies arrive safely. If you need dosage guidance, reply to this email or WhatsApp us.",
  },
  cancelled: {
    badge: "Order cancelled",
    title: "Your order was cancelled",
    message:
      "This order has been cancelled. If this was unexpected or you need help placing a new order, contact us anytime.",
  },
};

export type OrderStatusEmailData = {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  status: string;
  previousStatus?: string;
  total?: number;
  phone?: string;
};

/** Notify the customer when an admin updates order status */
export async function sendOrderStatusUpdateEmail(data: OrderStatusEmailData) {
  const email = data.customerEmail?.trim();
  if (!email) return { skipped: true as const, reason: "no_email" };

  const copy = STATUS_COPY[data.status] ?? {
    badge: "Order update",
    title: `Your order is now ${data.status}`,
    message: `Your order status has been updated to “${data.status}”.`,
  };

  const statusLabel = data.status.charAt(0).toUpperCase() + data.status.slice(1);
  const waHref = `https://wa.me/${siteConfig.whatsapp}`;

  const html = emailShell({
    preheader: `Order ${data.orderNumber} · Status: ${statusLabel}`,
    badge: copy.badge,
    title: copy.title,
    subtitle: `Assalamualaikum ${escapeHtml(data.customerName)} — update for order ${escapeHtml(data.orderNumber)}.`,
    body: `
      <div style="margin:0 0 20px;padding:16px 18px;border-radius:14px;background:${C.cream};border:1px solid ${C.line};">
        <p style="margin:0;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${C.green};">Order number</p>
        <p style="margin:6px 0 0;font-size:22px;font-weight:700;color:${C.forest};">${escapeHtml(data.orderNumber)}</p>
        <p style="margin:12px 0 0;font-size:13px;color:${C.muted};">
          New status:
          <strong style="color:${C.forest};text-transform:capitalize;">${escapeHtml(data.status)}</strong>
          ${
            data.previousStatus
              ? ` <span style="color:${C.muted};">(was ${escapeHtml(data.previousStatus)})</span>`
              : ""
          }
        </p>
        ${
          typeof data.total === "number"
            ? `<p style="margin:8px 0 0;font-size:13px;color:${C.muted};">Order total (COD): <strong style="color:${C.forest};">${formatPrice(data.total)}</strong></p>`
            : ""
        }
      </div>

      <p style="margin:0 0 18px;font-size:15px;line-height:1.65;color:${C.ink};">
        ${escapeHtml(copy.message)}
      </p>

      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 6px;">
        <tr>
          <td style="border-radius:999px;background:${C.green};">
            <a href="${waHref}" style="display:inline-block;padding:12px 22px;font-size:13px;font-weight:700;color:${C.white};text-decoration:none;">
              Chat on WhatsApp
            </a>
          </td>
        </tr>
      </table>
    `,
    footerNote: `This is an automated status update from ${escapeHtml(siteConfig.name)}. Reply to this email if you have questions.`,
  });

  await sendMail({
    to: email,
    subject: `Order ${data.orderNumber} · ${statusLabel} · ${siteConfig.name}`,
    html,
    text: `Assalamualaikum ${data.customerName},

Your order ${data.orderNumber} status is now: ${statusLabel}.
${data.previousStatus ? `(Previously: ${data.previousStatus})\n` : ""}
${copy.message}

${typeof data.total === "number" ? `Total (COD): ${formatPrice(data.total)}\n` : ""}
WhatsApp: ${siteConfig.phone}
Email: ${siteConfig.email}

— ${siteConfig.name}`,
  });

  return { ok: true as const };
}
