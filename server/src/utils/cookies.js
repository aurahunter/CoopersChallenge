export function getAuthCookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  const crossSite =
    isProd || process.env.COOKIE_CROSS_SITE === "true";

  return {
    httpOnly: true,
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    secure: crossSite,
    sameSite: crossSite ? "none" : "lax",
  };
}
