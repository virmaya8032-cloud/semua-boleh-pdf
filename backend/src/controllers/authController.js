import bcrypt from "bcryptjs";
import { query } from "../config/db.js";
import { janaToken } from "../middleware/auth.js";

const emelSah = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

export async function daftar(req, res) {
  const { nama, emel, kata_laluan, sahkan_kata_laluan, setuju } = req.body || {};

  if (!nama || !emel || !kata_laluan) {
    return res.status(400).json({ ralat: "Sila lengkapkan nama, e-mel dan kata laluan." });
  }
  if (!emelSah(emel)) return res.status(400).json({ ralat: "Alamat e-mel tidak sah." });
  if (kata_laluan.length < 8) {
    return res.status(400).json({ ralat: "Kata laluan mesti sekurang-kurangnya 8 aksara." });
  }
  if (sahkan_kata_laluan !== undefined && kata_laluan !== sahkan_kata_laluan) {
    return res.status(400).json({ ralat: "Kata laluan dan pengesahan tidak sepadan." });
  }
  if (setuju === false) {
    return res.status(400).json({ ralat: "Anda perlu bersetuju dengan terma penggunaan." });
  }

  const wujud = await query("SELECT id FROM pengguna WHERE emel = $1", [emel.toLowerCase()]);
  if (wujud.rowCount > 0) {
    return res.status(409).json({ ralat: "E-mel ini sudah didaftarkan." });
  }

  const hash = await bcrypt.hash(kata_laluan, 12);
  const hasil = await query(
    `INSERT INTO pengguna (nama, emel, kata_laluan) VALUES ($1, $2, $3)
     RETURNING id, nama, emel, peranan, dicipta_pada`,
    [nama.trim(), emel.toLowerCase(), hash]
  );
  const p = hasil.rows[0];
  const token = janaToken(p);
  res.status(201).json({ mesej: "Pendaftaran berjaya.", token, pengguna: p });
}

export async function logMasuk(req, res) {
  const { emel, kata_laluan } = req.body || {};
  if (!emel || !kata_laluan) {
    return res.status(400).json({ ralat: "Sila masukkan e-mel dan kata laluan." });
  }
  const hasil = await query("SELECT * FROM pengguna WHERE emel = $1", [emel.toLowerCase()]);
  if (hasil.rowCount === 0) {
    return res.status(401).json({ ralat: "E-mel atau kata laluan salah." });
  }
  const p = hasil.rows[0];
  if (!p.aktif) return res.status(403).json({ ralat: "Akaun anda telah disekat." });

  const padan = await bcrypt.compare(kata_laluan, p.kata_laluan);
  if (!padan) return res.status(401).json({ ralat: "E-mel atau kata laluan salah." });

  const token = janaToken(p);
  res.json({
    mesej: "Log masuk berjaya.",
    token,
    pengguna: { id: p.id, nama: p.nama, emel: p.emel, peranan: p.peranan, dicipta_pada: p.dicipta_pada },
  });
}

export async function saya(req, res) {
  const hasil = await query(
    "SELECT id, nama, emel, peranan, dicipta_pada FROM pengguna WHERE id = $1",
    [req.pengguna.id]
  );
  if (hasil.rowCount === 0) return res.status(404).json({ ralat: "Pengguna tidak dijumpai." });
  res.json({ pengguna: hasil.rows[0] });
}

export async function kemasKiniProfil(req, res) {
  const { nama } = req.body || {};
  if (!nama || !nama.trim()) return res.status(400).json({ ralat: "Nama tidak boleh kosong." });
  const hasil = await query(
    "UPDATE pengguna SET nama = $1 WHERE id = $2 RETURNING id, nama, emel, peranan, dicipta_pada",
    [nama.trim(), req.pengguna.id]
  );
  res.json({ mesej: "Profil dikemas kini.", pengguna: hasil.rows[0] });
}

export async function tukarKataLaluan(req, res) {
  const { kata_laluan_lama, kata_laluan_baharu } = req.body || {};
  if (!kata_laluan_baharu || kata_laluan_baharu.length < 8) {
    return res.status(400).json({ ralat: "Kata laluan baharu mesti sekurang-kurangnya 8 aksara." });
  }
  const hasil = await query("SELECT kata_laluan FROM pengguna WHERE id = $1", [req.pengguna.id]);
  const padan = await bcrypt.compare(kata_laluan_lama || "", hasil.rows[0].kata_laluan);
  if (!padan) return res.status(401).json({ ralat: "Kata laluan lama salah." });

  const hash = await bcrypt.hash(kata_laluan_baharu, 12);
  await query("UPDATE pengguna SET kata_laluan = $1 WHERE id = $2", [hash, req.pengguna.id]);
  res.json({ mesej: "Kata laluan berjaya ditukar." });
}
