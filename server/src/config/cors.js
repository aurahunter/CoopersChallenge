export function getCorsOrigin() {
  const raw = process.env.CLIENT_ORIGIN?.trim();
  if (!raw) {
    return "http://localhost:5173";
  }

  const origins = raw
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  if (origins.length === 1) {
    return origins[0];
  }

  return (origin, callback) => {
    if (!origin || origins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(null, false);
  };
}
