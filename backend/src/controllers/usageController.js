import { query } from "../config/db.js";

export async function ringkasanSaya(req, res) {
  const id = req.pengguna.id;
  const jumlah = await query("SELECT COUNT(*)::int AS n FROM penggunaan WHERE pengguna_id = $1", [id]);
  const berjaya = await query(
    "SELECT COUNT(*)::int AS n FROM penggunaan WHERE pengguna_id = $1 AND status = 'berjaya'", [id]
  );
  const alatPopular = await query(
    `SELECT nama_alat, COUNT(*)::int AS bilangan
       FROM penggunaan WHERE pengguna_id = $1
      GROUP BY nama_alat ORDER BY bilangan DESC LIMIT 5`, [id]
  );
  res.json({
    jumlah_diproses: jumlah.rows[0].n,
    jumlah_berjaya: berjaya.rows[0].n,
    alat_kerap: alatPopular.rows,
  });
}

export async function sejarahSaya(req, res) {
  const id = req.pengguna.id;
  const had = Math.min(parseInt(req.query.had || "50", 10), 200);
  const hasil = await query(
    `SELECT id, nama_alat, alat, saiz_bait, status, dicipta_pada
       FROM penggunaan WHERE pengguna_id = $1
      ORDER BY dicipta_pada DESC LIMIT $2`, [id, had]
  );
  res.json({ sejarah: hasil.rows });
}

export async function padamSejarahSaya(req, res) {
  await query("DELETE FROM penggunaan WHERE pengguna_id = $1", [req.pengguna.id]);
  res.json({ mesej: "Sejarah penggunaan telah dipadam." });
}
