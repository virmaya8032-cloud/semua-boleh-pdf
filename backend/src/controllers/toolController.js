import fs from "fs";
import { ALAT } from "../config/tools.js";
import { proses } from "../services/process.js";
import { padamFail } from "../utils/files.js";
import { daftarOutput, ambilOutput, buangOutput } from "../utils/outputs.js";
import { query } from "../config/db.js";

async function logPenggunaan({ penggunaId, slug, meta, saiz, status, mesej }) {
  try {
    await query(
      `INSERT INTO penggunaan (pengguna_id, alat, nama_alat, saiz_bait, status, mesej)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [penggunaId || null, slug, meta.nama, saiz || 0, status, mesej || null]
    );
  } catch (e) {
    // Jangan gagalkan permintaan hanya kerana log gagal.
    console.warn("Gagal log penggunaan:", e.message);
  }
}

export async function prosesFail(req, res) {
  const { slug } = req.params;
  const meta = ALAT[slug];
  const fail = req.files || (req.file ? [req.file] : []);
  const laluan = fail.map((f) => f.path);
  const jumlahSaiz = fail.reduce((s, f) => s + (f.size || 0), 0);
  const penggunaId = req.pengguna?.id || null;

  const bersih = () => padamFail(laluan);

  try {
    if (!meta) { bersih(); return res.status(404).json({ ralat: "Alat tidak dijumpai." }); }
    if (fail.length === 0) { return res.status(400).json({ ralat: "Sila muat naik sekurang-kurangnya satu fail." }); }

    const min = meta.min || 1;
    const max = meta.max || 30;
    if (fail.length < min) { bersih(); return res.status(400).json({ ralat: `Alat ini memerlukan sekurang-kurangnya ${min} fail.` }); }
    if (fail.length > max) { bersih(); return res.status(400).json({ ralat: `Alat ini menerima maksimum ${max} fail.` }); }

    // Kumpul pilihan daripada borang; suntik format untuk PDF->imej.
    const opts = { ...req.body };
    if (meta.format) opts._format = meta.format;

    const hasil = await proses(meta.op, laluan, opts);
    bersih(); // padam input serta-merta selepas diproses

    const nama = daftarOutput(hasil);
    await logPenggunaan({ penggunaId, slug, meta, saiz: jumlahSaiz, status: "berjaya" });

    res.json({
      mesej: "Fail berjaya diproses.",
      muat_turun: `/api/alat/muat-turun/${nama}`,
      nama_fail: hasil.filename,
    });
  } catch (e) {
    bersih();
    await logPenggunaan({ penggunaId, slug, meta: meta || { nama: slug }, saiz: jumlahSaiz, status: "gagal", mesej: e.message });
    res.status(400).json({ ralat: e.message || "Pemprosesan gagal." });
  }
}

export function muatTurun(req, res) {
  const { nama } = req.params;
  const hasil = ambilOutput(nama);
  if (!hasil || !fs.existsSync(hasil.path)) {
    return res.status(404).json({ ralat: "Fail tidak dijumpai atau telah tamat tempoh." });
  }
  res.setHeader("Content-Type", hasil.mime);
  res.setHeader("Content-Disposition", `attachment; filename="${hasil.filename}"`);
  const stream = fs.createReadStream(hasil.path);
  stream.pipe(res);
  stream.on("close", () => buangOutput(nama)); // padam selepas dimuat turun
  stream.on("error", () => { try { res.end(); } catch { /* */ } });
}
