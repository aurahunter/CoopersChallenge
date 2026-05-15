const base = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace(/\/$/, "");

/**
 * Chama a API com cookies (sessão JWT httpOnly).
 * @param {string} path - ex: "/api/auth/me"
 * @param {RequestInit} options
 */
export async function api(path, options = {}) {
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
  const headers = {
    Accept: "application/json",
    ...(options.body && typeof options.body === "string"
      ? { "Content-Type": "application/json" }
      : {}),
    ...options.headers,
  };

  const res = await fetch(url, {
    ...options,
    credentials: "include",
    headers,
  });

  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text || res.statusText };
    }
  }

  if (!res.ok) {
    const msg = data?.error || res.statusText || "Erro na requisição";
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }

  return data;
}
