import jwt from "jsonwebtoken";

const COOKIE_NAME = "coopers_token";

export function getCookieName() {
  return COOKIE_NAME;
}

export function signUserToken(userId) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET não definido no .env");
  }
  return jwt.sign({ sub: userId }, secret, { expiresIn: "7d" });
}

export function verifyUserToken(token) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET não definido no .env");
  }
  const payload = jwt.verify(token, secret);
  if (typeof payload === "string" || !payload.sub) {
    return null;
  }
  return payload.sub;
}
