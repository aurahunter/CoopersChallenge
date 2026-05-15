import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { getCorsOrigin } from "./config/cors.js";
import authRoutes from "./routes/auth.js";
import contactRoutes from "./routes/contact.js";
import taskRoutes from "./routes/tasks.js";

const app = express();
const PORT = process.env.PORT || 4000;

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.use(
  cors({
    origin: getCorsOrigin(),
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "coopers-server" });
});

app.use("/api/auth", authRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/tasks", taskRoutes);

app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});
