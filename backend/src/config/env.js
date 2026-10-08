import dotenv from "dotenv";
dotenv.config();

export const env = {
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
  GEMINI_MODEL: process.env.GEMINI_MODEL || "gemini-2.5-flash-lite",
  AI_ALLOW_PUBLIC: process.env.AI_ALLOW_PUBLIC === "true",
  PORT: parseInt(process.env.PORT || "4000", 10),
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL: process.env.DATABASE_URL || "",
  JWT_SECRET: process.env.JWT_SECRET || "tukar-rahsia-ini-dalam-produksi",
  JWT_EXPIRES: process.env.JWT_EXPIRES || "7d",
  CORS_ORIGINS: (process.env.CORS_ORIGINS || "http://localhost:5173")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  MAX_FILE_MB: parseInt(process.env.MAX_FILE_MB || "50", 10),
  FILE_TTL_MIN: parseInt(process.env.FILE_TTL_MIN || "30", 10),
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || "admin@semuabolehpdf.my",
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "admin12345",
  ADMIN_NAMA: process.env.ADMIN_NAMA || "Pentadbir",
  RESEND_API_KEY: process.env.RESEND_API_KEY || "",
  EMEL_DARI: process.env.EMEL_DARI || "Semua Boleh PDF <onboarding@resend.dev>",
  EMEL_PENTADBIR: process.env.EMEL_PENTADBIR || process.env.ADMIN_EMAIL || "",
};
