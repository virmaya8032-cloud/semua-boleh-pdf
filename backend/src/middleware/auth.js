import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function janaToken(pengguna) {
  return jwt.sign(
    { id: pengguna.id, emel: pengguna.emel, peranan: pengguna.peranan, nama: pengguna.nama },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES }
  );
}

function ambilToken(req) {
  const kepala = req.headers.authorization || "";
  if (kepala.startsWith("Bearer ")) return kepala.slice(7);
  if (req.cookies?.token) return req.cookies.token;
  return null;
}

// Wajib log masuk.
export function perluAuth(req, res, next) {
  const token = ambilToken(req);
  if (!token) return res.status(401).json({ ralat: "Sila log masuk untuk meneruskan." });
  try {
    req.pengguna = jwt.verify(token, env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ ralat: "Sesi tamat atau tidak sah. Sila log masuk semula." });
  }
}

// Pilihan: isi req.pengguna jika token ada, tetapi tidak menghalang.
export function authPilihan(req, _res, next) {
  const token = ambilToken(req);
  if (token) {
    try { req.pengguna = jwt.verify(token, env.JWT_SECRET); } catch { /* abaikan */ }
  }
  next();
}

// Hanya pentadbir.
export function perluPentadbir(req, res, next) {
  perluAuth(req, res, () => {
    if (req.pengguna?.peranan !== "pentadbir") {
      return res.status(403).json({ ralat: "Akses ditolak. Halaman ini untuk pentadbir sahaja." });
    }
    next();
  });
}
