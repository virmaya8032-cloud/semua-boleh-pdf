import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";
import { mulaSapuanBerkala } from "./utils/files.js";
import authRoutes from "./routes/auth.js";
import toolRoutes from "./routes/tools.js";
import usageRoutes from "./routes/usage.js";
import adminRoutes from "./routes/admin.js";
import mesejRoutes from "./routes/mesej.js";
import { tidakDijumpai, pengendaliRalat } from "./middleware/error.js";

const app = express();
app.set("trust proxy", 1);

// Keselamatan asas
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

// CORS terkawal
app.use(cors({
  origin(origin, cb) {
    if (!origin) return cb(null, true); // alat baris arahan / same-origin
    if (env.CORS_ORIGINS.includes(origin)) return cb(null, true);
    cb(new Error("Origin tidak dibenarkan oleh dasar CORS."));
  },
  credentials: true,
}));

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

// Had kadar global
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ralat: "Terlalu banyak permintaan. Sila cuba sebentar lagi." },
}));

// Semakan kesihatan
app.get("/api/kesihatan", (_req, res) => res.json({ status: "ok", masa: new Date().toISOString() }));

// Laluan
app.use("/api/auth", authRoutes);
app.use("/api/alat", toolRoutes);
app.use("/api/penggunaan", usageRoutes);
app.use("/api/pentadbir", adminRoutes);
app.use("/api/mesej", mesejRoutes);

// 404 & ralat
app.use("/api", tidakDijumpai);
app.use(pengendaliRalat);

mulaSapuanBerkala();

app.listen(env.PORT, () => {
  console.log(`Semua Boleh PDF — backend berjalan di port ${env.PORT} (${env.NODE_ENV})`);
});
