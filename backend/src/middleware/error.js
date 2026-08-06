import multer from "multer";
import { env } from "../config/env.js";

export function tidakDijumpai(_req, res) {
  res.status(404).json({ ralat: "Laluan API tidak dijumpai." });
}

export function pengendaliRalat(err, _req, res, _next) {
  // Ralat khusus multer (saiz/bilangan fail)
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ ralat: `Saiz fail melebihi had ${env.MAX_FILE_MB} MB.` });
    }
    if (err.code === "LIMIT_FILE_COUNT" || err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({ ralat: "Terlalu banyak fail dimuat naik." });
    }
    return res.status(400).json({ ralat: `Ralat muat naik: ${err.message}` });
  }

  const status = err.status || 400;
  if (env.NODE_ENV !== "production") console.error("Ralat:", err);
  res.status(status).json({ ralat: err.message || "Ralat pelayan dalaman." });
}
