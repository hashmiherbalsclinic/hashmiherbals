import nodemailer from "nodemailer";

function required(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing env: ${name}`);
  return value;
}

function stripWrappingQuotes(value: string) {
  const v = value.trim();
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    return v.slice(1, -1).trim();
  }
  return v;
}

export function getMailer() {
  const user = required("SMTP_USER");
  const pass = required("SMTP_PASS").replace(/\s+/g, "");
  const host = process.env.SMTP_HOST?.trim() || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || "465");

  // Fresh transport per send — reused pooled connections were dropping
  // the first (customer) message for some Gmail recipients.
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    pool: false,
  });
}

export function mailFrom() {
  const user = process.env.SMTP_USER?.trim() || "admin@hashmiherbals.com";
  const raw = process.env.SMTP_FROM?.trim();
  if (raw) return stripWrappingQuotes(raw);
  return `Hashmi Herbals <${user}>`;
}

export function orderNotifyEmail() {
  return (
    process.env.ORDER_NOTIFY_EMAIL?.trim() ||
    process.env.SMTP_USER?.trim() ||
    "admin@hashmiherbals.com"
  );
}

export async function sendMail(opts: {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}) {
  const recipients = (Array.isArray(opts.to) ? opts.to : [opts.to])
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean);

  if (recipients.length === 0) throw new Error("Missing mail recipient");

  const transporter = getMailer();
  try {
    const info = await transporter.sendMail({
      from: mailFrom(),
      to: recipients.join(", "),
      replyTo: opts.replyTo?.trim() || orderNotifyEmail(),
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
      headers: {
        "X-Hashmi-Mail": "order",
      },
    });

    const rejected = info.rejected ?? [];
    if (rejected.length > 0) {
      throw new Error(`SMTP rejected recipient(s): ${rejected.join(", ")}`);
    }

    const accepted = (info.accepted ?? []).map(String);
    const missing = recipients.filter(
      (r) => !accepted.some((a) => a.toLowerCase().includes(r))
    );
    if (missing.length > 0) {
      throw new Error(`SMTP did not accept: ${missing.join(", ")}`);
    }

    console.info("[mailer] sent", {
      to: recipients,
      messageId: info.messageId,
      accepted: info.accepted,
      response: info.response,
    });

    return info;
  } finally {
    transporter.close();
  }
}
