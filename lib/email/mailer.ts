import nodemailer from "nodemailer";

function required(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing env: ${name}`);
  return value;
}

export function getMailer() {
  const user = required("SMTP_USER");
  const pass = required("SMTP_PASS").replace(/\s+/g, "");
  const host = process.env.SMTP_HOST?.trim() || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || "465");

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export function mailFrom() {
  return (
    process.env.SMTP_FROM?.trim() ||
    `Hashmi Herbals <${process.env.SMTP_USER?.trim() || "admin@hashmiherbals.com"}>`
  );
}

export function orderNotifyEmail() {
  return (
    process.env.ORDER_NOTIFY_EMAIL?.trim() ||
    process.env.SMTP_USER?.trim() ||
    "admin@hashmiherbals.com"
  );
}

export async function sendMail(opts: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  const transporter = getMailer();
  await transporter.sendMail({
    from: mailFrom(),
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    text: opts.text,
  });
}
