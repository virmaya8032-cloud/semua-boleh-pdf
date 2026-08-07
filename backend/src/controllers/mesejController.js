import { query } from "../config/db.js";

const emelSah = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

// Awam: pengguna hantar mesej daripada borang "Hubungi Kami".
export async function hantarMesej(req, res) {
  const nama = (req.body?.nama || "").trim();
  const emel = (req.body?.emel || "").trim();
  const mesej = (req.body?.mesej || "").trim();

  if (!nama || !emel || !mesej) {
    return res.status(400).json({ ralat: "Sila lengkapkan nama, e-mel dan mesej." });
  }
  if (nama.length > 120) return res.status(400).json({ ralat: "Nama terlalu panjang." });
  if (!emelSah(emel)) return res.status(400).json({ ralat: "Sila masukkan e-mel yang sah." });
  if (mesej.length > 5000) return res.status(400).json({ ralat: "Mesej terlalu panjang (maks 5000 aksara)." });

  await query(
    "INSERT INTO mesej_hubungi (nama, emel, mesej) VALUES ($1, $2, $3)",
    [nama, emel, mesej]
  );
  res.status(201).json({ mesej: "Mesej anda telah dihantar. Terima kasih!" });
}

// Pentadbir: senarai mesej.
export async function senaraiMesej(_req, res) {
  const r = await query(
    "SELECT id, nama, emel, mesej, dibaca, dicipta_pada FROM mesej_hubungi ORDER BY dicipta_pada DESC LIMIT 200"
  );
  const belum = await query("SELECT COUNT(*)::int AS n FROM mesej_hubungi WHERE dibaca = FALSE");
  res.json({ mesej: r.rows, belum_dibaca: belum.rows[0].n });
}

// Pentadbir: tanda satu mesej sebagai dibaca.
export async function tandaDibaca(req, res) {
  const id = parseInt(req.params.id, 10);
  await query("UPDATE mesej_hubungi SET dibaca = TRUE WHERE id = $1", [id]);
  res.json({ mesej: "Mesej ditanda sebagai dibaca." });
}

// Pentadbir: padam mesej.
export async function padamMesej(req, res) {
  const id = parseInt(req.params.id, 10);
  await query("DELETE FROM mesej_hubungi WHERE id = $1", [id]);
  res.json({ mesej: "Mesej dipadam." });
}
