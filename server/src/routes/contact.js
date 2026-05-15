import { Router } from "express";
import { sendContactEmail } from "../services/sendContactEmail.js";

const router = Router();

const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

function cleanString(value, maxLen) {
  return String(value ?? "").trim().slice(0, maxLen);
}

router.post("/", async (req, res) => {
  try {
    const name = cleanString(req.body?.name, 120);
    const email = cleanString(req.body?.email, 160).toLowerCase();
    const phone = cleanString(req.body?.phone, 40);
    const message = cleanString(req.body?.message, 4000);

    if (name.length < 2) {
      return res.status(400).json({ error: "Informe seu nome" });
    }
    if (!isEmail(email)) {
      return res.status(400).json({ error: "Email inválido" });
    }
    if (phone.length < 8) {
      return res.status(400).json({ error: "Informe um telefone válido" });
    }
    if (message.length < 10) {
      return res.status(400).json({ error: "A mensagem deve ter pelo menos 10 caracteres" });
    }

    const result = await sendContactEmail({ name, email, phone, message });

    return res.status(201).json({
      ok: true,
      message:
        result.mode === "log"
          ? "Mensagem recebida (modo desenvolvimento — configure SMTP para envio real)."
          : "Mensagem enviada com sucesso. Em breve entraremos em contato.",
    });
  } catch (e) {
    console.error(e);
    const msg = e instanceof Error ? e.message : "Erro ao enviar mensagem";
    return res.status(500).json({ error: msg });
  }
});

export default router;
