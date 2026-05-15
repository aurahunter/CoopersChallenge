import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { getAuthCookieOptions } from "../utils/cookies.js";
import { signUserToken, verifyUserToken, getCookieName } from "../utils/jwt.js";

const router = Router();

const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
      return res.status(400).json({ error: "Email e senha são obrigatórios" });
    }
    if (!isEmail(String(email).trim())) {
      return res.status(400).json({ error: "Email inválido" });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ error: "Senha deve ter no mínimo 6 caracteres" });
    }
    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return res.status(409).json({ error: "Este email já está cadastrado" });
    }
    const passwordHash = await hashPassword(String(password));
    const user = await prisma.user.create({
      data: { email: normalizedEmail, passwordHash },
      select: { id: true, email: true, createdAt: true },
    });
    const token = signUserToken(user.id);
    res.cookie(getCookieName(), token, getAuthCookieOptions());
    return res.status(201).json({ user });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Erro ao cadastrar" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
      return res.status(400).json({ error: "Email e senha são obrigatórios" });
    }
    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      return res.status(401).json({ error: "Email ou senha incorretos" });
    }
    const ok = await verifyPassword(String(password), user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: "Email ou senha incorretos" });
    }
    const token = signUserToken(user.id);
    res.cookie(getCookieName(), token, getAuthCookieOptions());
    return res.json({
      user: { id: user.id, email: user.email, createdAt: user.createdAt },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Erro ao entrar" });
  }
});

router.post("/logout", (_req, res) => {
  res.clearCookie(getCookieName(), getAuthCookieOptions());
  return res.json({ ok: true });
});

router.get("/me", async (req, res) => {
  const token = req.cookies?.[getCookieName()];
  if (!token) {
    return res.status(401).json({ error: "Não autenticado" });
  }
  try {
    const userId = verifyUserToken(token);
    if (!userId) {
      return res.status(401).json({ error: "Sessão inválida" });
    }
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, createdAt: true },
    });
    if (!user) {
      return res.status(401).json({ error: "Usuário não encontrado" });
    }
    return res.json({ user });
  } catch {
    return res.status(401).json({ error: "Sessão expirada ou inválida" });
  }
});

export default router;
