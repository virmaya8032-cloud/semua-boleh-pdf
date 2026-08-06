import dotenv from "dotenv";
dotenv.config();

export const env = {
  PORT: parseInt(process.env.PORT || "4000", 10),
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL: process.env.DATABASE_URL || "",
  JWT_SECRET: process.env.JWT_SECRET || "tukar-rahsia-ini-dalam-produksi",
  JWT_EXPIRES: process.env.JWT_EXPIRES || "7d",
  // Senarai origin yang dibenarkan, dipisah dengan koma
  CORS_ORIGINS: (process.env.CORS_ORIGINS || "http://localhost:5173")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  // Had saiz fail dalam MB
  MAX_FILE_MB: parseInt(process.env.MAX_FILE_MB || "50", 10),
  // Tempoh fail output disimpan sebelum dipadam automatik (minit)
  FILE_TTL_MIN: parseInt(process.env.FILE_TTL_MIN || "30", 10),
  // Akaun pentadbir pertama (dibenih semasa migrate)
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || "admin@semuabolehpdf.my",
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "admin12345",
  ADMIN_NAMA: process.env.ADMIN_NAMA || "Pentadbir",
};
