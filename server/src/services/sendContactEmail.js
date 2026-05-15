import nodemailer from "nodemailer";

function hasSmtpConfig() {
  return Boolean(process.env.SMTP_HOST?.trim());
}

export function isContactEmailConfigured() {
  return hasSmtpConfig();
}

export async function sendContactEmail(payload) {
  const to = process.env.CONTACT_TO_EMAIL?.trim() || "coopers@coopers.pro";
  const { name, email, phone, message } = payload;

  const text = [
    "Novo contato pelo site Coopers",
    "",
    `Nome: ${name}`,
    `Email: ${email}`,
    `Telefone: ${phone}`,
    "",
    "Mensagem:",
    message,
  ].join("\n");

  const html = `
    <h2>Novo contato — Coopers</h2>
    <p><strong>Nome:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Telefone:</strong> ${escapeHtml(phone)}</p>
    <p><strong>Mensagem:</strong></p>
    <p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
  `;

  if (!hasSmtpConfig()) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Envio de e-mail não configurado no servidor");
    }
    console.info("[contact] SMTP não configurado — mensagem registrada no log:");
    console.info(text);
    return { mode: "log" };
  }

  const port = Number(process.env.SMTP_PORT || 587);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: process.env.SMTP_SECURE === "true" || port === 465,
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          }
        : undefined,
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM?.trim() || process.env.SMTP_USER || "coopers@coopers.pro",
    to,
    replyTo: email,
    subject: `[Coopers] Contato de ${name}`,
    text,
    html,
  });

  return { mode: "smtp" };
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
