import { verifyUserToken, getCookieName } from "../utils/jwt.js";

export function requireAuth(req, res, next) {
  const token = req.cookies?.[getCookieName()];
  if (!token) {
    return res.status(401).json({ error: "Não autenticado" });
  }
  try {
    const userId = verifyUserToken(token);
    if (!userId) {
      return res.status(401).json({ error: "Sessão inválida" });
    }
    req.userId = userId;
    return next();
  } catch {
    return res.status(401).json({ error: "Sessão expirada ou inválida" });
  }
}
