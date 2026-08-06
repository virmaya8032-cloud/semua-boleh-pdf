import { query, pool } from "../config/db.js";

export async function statistik(_req, res) {
  const [pengguna, fail, hariIni, minggu, bulan, popular, kadar] = await Promise.all([
    query("SELECT COUNT(*)::int AS n FROM pengguna"),
    query("SELECT COUNT(*)::int AS n FROM penggunaan"),
    query("SELECT COUNT(*)::int AS n FROM penggunaan WHERE dicipta_pada >= CURRENT_DATE"),
    query("SELECT COUNT(*)::int AS n FROM penggunaan WHERE dicipta_pada >= NOW() - INTERVAL '7 days'"),
    query("SELECT COUNT(*)::int AS n FROM penggunaan WHERE dicipta_pada >= NOW() - INTERVAL '30 days'"),
    query(`SELECT nama_alat, COUNT(*)::int AS bilangan FROM penggunaan
             GROUP BY nama_alat ORDER BY bilangan DESC LIMIT 10`),
    query(`SELECT status, COUNT(*)::int AS n FROM penggunaan GROUP BY status`),
  ]);

  const kadarMap = Object.fromEntries(kadar.rows.map((r) => [r.status, r.n]));
  res.json({
    jumlah_pengguna: pengguna.rows[0].n,
    jumlah_fail: fail.rows[0].n,
    hari_ini: hariIni.rows[0].n,
    minggu_ini: minggu.rows[0].n,
    bulan_ini: bulan.rows[0].n,
    alat_popular: popular.rows,
    berjaya: kadarMap.berjaya || 0,
    gagal: kadarMap.gagal || 0,
  });
}

export async function senaraiPengguna(req, res) {
  const carian = (req.query.carian || "").trim();
  const params = [];
  let where = "";
  if (carian) {
    params.push(`%${carian}%`);
    where = `WHERE nama ILIKE $1 OR emel ILIKE $1`;
  }
  const hasil = await query(
    `SELECT p.id, p.nama, p.emel, p.peranan, p.aktif, p.dicipta_pada,
            (SELECT COUNT(*)::int FROM penggunaan u WHERE u.pengguna_id = p.id) AS jumlah_guna
       FROM pengguna p ${where}
      ORDER BY p.dicipta_pada DESC LIMIT 200`,
    params
  );
  res.json({ pengguna: hasil.rows });
}

export async function aktiviti(req, res) {
  const { alat, dari, hingga } = req.query;
  const params = [];
  const syarat = [];
  if (alat) { params.push(alat); syarat.push(`p.alat = $${params.length}`); }
  if (dari) { params.push(dari); syarat.push(`p.dicipta_pada >= $${params.length}`); }
  if (hingga) { params.push(hingga); syarat.push(`p.dicipta_pada <= $${params.length}`); }
  const where = syarat.length ? `WHERE ${syarat.join(" AND ")}` : "";

  const hasil = await query(
    `SELECT p.id, p.nama_alat, p.alat, p.saiz_bait, p.status, p.mesej, p.dicipta_pada,
            u.nama AS nama_pengguna, u.emel
       FROM penggunaan p LEFT JOIN pengguna u ON u.id = p.pengguna_id
       ${where}
      ORDER BY p.dicipta_pada DESC LIMIT 300`,
    params
  );
  res.json({ aktiviti: hasil.rows });
}

export async function eksportCsv(req, res) {
  const hasil = await query(
    `SELECT p.id, u.nama AS pengguna, u.emel, p.nama_alat, p.alat,
            p.saiz_bait, p.status, p.dicipta_pada
       FROM penggunaan p LEFT JOIN pengguna u ON u.id = p.pengguna_id
      ORDER BY p.dicipta_pada DESC LIMIT 5000`
  );
  const kepala = ["ID", "Pengguna", "Emel", "Alat", "Slug", "Saiz (bait)", "Status", "Tarikh"];
  const baris = hasil.rows.map((r) =>
    [r.id, r.pengguna || "Tetamu", r.emel || "-", r.nama_alat, r.alat, r.saiz_bait, r.status,
     new Date(r.dicipta_pada).toISOString()]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")
  );
  const csv = [kepala.join(","), ...baris].join("\n");
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="rekod-penggunaan.csv"');
  res.send("\uFEFF" + csv); // BOM untuk Excel
}

export async function tukarStatusPengguna(req, res) {
  const id = parseInt(req.params.id, 10);
  const { aktif } = req.body || {};
  if (id === req.pengguna.id) return res.status(400).json({ ralat: "Anda tidak boleh menyekat akaun sendiri." });
  const hasil = await query(
    "UPDATE pengguna SET aktif = $1 WHERE id = $2 RETURNING id, aktif", [!!aktif, id]
  );
  if (hasil.rowCount === 0) return res.status(404).json({ ralat: "Pengguna tidak dijumpai." });
  res.json({ mesej: aktif ? "Pengguna diaktifkan." : "Pengguna disekat.", pengguna: hasil.rows[0] });
}

export async function padamPengguna(req, res) {
  const id = parseInt(req.params.id, 10);
  if (id === req.pengguna.id) return res.status(400).json({ ralat: "Anda tidak boleh memadam akaun sendiri." });
  const hasil = await query("DELETE FROM pengguna WHERE id = $1 RETURNING id", [id]);
  if (hasil.rowCount === 0) return res.status(404).json({ ralat: "Pengguna tidak dijumpai." });
  res.json({ mesej: "Pengguna telah dipadam." });
}

export async function statusSistem(_req, res) {
  let db = "tidak tersambung";
  try { await query("SELECT 1"); db = "tersambung"; } catch { /* */ }
  res.json({
    backend: "aktif",
    pangkalan_data: db,
    masa_pelayan: new Date().toISOString(),
    kolam_sambungan: { jumlah: pool.totalCount, melahu: pool.idleCount, menunggu: pool.waitingCount },
  });
}
