import fs from "fs";
import path from "path";
import { ALAT } from "../config/tools.js";
import { proses } from "../services/process.js";
import { padamFail } from "../utils/files.js";
import { daftarOutput, ambilOutput, buangOutput } from "../utils/outputs.js";
import {env} from "../config/env.js";
import { query } from "../config/db.js";
import { pythonPdf } from "../services/pythonPdf.js";
import { periksaBorang } from "../services/pdfLib.js";

export async function periksaPdf(req, res) {
  const files = req.files || [];
  let output;
  try {
    if (files.length !== 1 || path.extname(files[0].originalname).toLowerCase() !== '.pdf') throw new Error('Pilih satu fail PDF.');
    if (req.body.mode === 'forms') {
      res.setHeader('Cache-Control', 'no-store');
      return res.json(await periksaBorang(files[0].path));
    }
    output = await pythonPdf('inspect', [files[0].path], { halaman: req.body.halaman || 1, mode: req.body.mode }, 'json');
    res.setHeader('Cache-Control', 'no-store');
    res.json(JSON.parse(fs.readFileSync(output, 'utf8')));
  } catch (error) {
    res.status(400).json({ ralat: error.message });
  } finally {
    padamFail([...files.map(f => f.path), ...(output ? [output] : [])]);
  }
}

async function logPenggunaan({ penggunaId, slug, meta, saiz, status, mesej }) {
  if (!env.DATABASE_URL) return;
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
    if (fail.length === 0 && (meta.min ?? 1) > 0) { return res.status(400).json({ ralat: "Sila muat naik sekurang-kurangnya satu fail." }); }

    const min = meta.min ?? 1;
    const max = meta.max ?? (meta.multiple ? 30 : 1);
    if (fail.length < min) { bersih(); return res.status(400).json({ ralat: `Alat ini memerlukan sekurang-kurangnya ${min} fail.` }); }
    if (fail.length > max) { bersih(); return res.status(400).json({ ralat: `Alat ini menerima maksimum ${max} fail.` }); }

    const types = fail.map((f) => path.extname(f.originalname).toLowerCase());
    const imageTypes = [".jpg", ".jpeg", ".png"];
    let allowed = [".pdf"];
    if (meta.op === "imej-ke-pdf") allowed = imageTypes;
    if (meta.op === "office-ke-pdf") allowed = slug === "word-ke-pdf" ? [".doc", ".docx"] : slug === "excel-ke-pdf" ? [".xls", ".xlsx"] : [".ppt", ".pptx"];
    if (meta.op === "html-ke-pdf") allowed = [".html", ".htm"];
    if (meta.op === "tambah-gambar") allowed = [".pdf", ...imageTypes];
    if (types.some((ext) => !allowed.includes(ext))) {
      bersih(); return res.status(400).json({ ralat: "Jenis fail tidak sesuai untuk alat ini." });
    }
    if (meta.op === "tambah-gambar" && !req.body.anotasi && (types.filter((ext) => ext === ".pdf").length !== 1 || types.filter((ext) => imageTypes.includes(ext)).length !== 1)) {
      bersih(); return res.status(400).json({ ralat: "Pilih satu fail PDF dan satu gambar JPG/PNG." });
    }
    if (meta.op === "tambah-gambar" && req.body.anotasi && (types.length!==1||types[0]!=='.pdf')) {
      bersih(); return res.status(400).json({ralat:'Pilih satu PDF dan muat naik gambar melalui editor.'});
    }
    // Kumpul pilihan daripada borang; suntik format untuk PDF->imej.
    const opts = { ...req.body };
    if (meta.format) opts._format = meta.format;

    const hasil = await proses(meta.op, laluan, opts);
    bersih(); // padam input serta-merta selepas diproses

    const nama = daftarOutput(hasil);
    void logPenggunaan({ penggunaId, slug, meta, saiz: jumlahSaiz, status: "berjaya" });

    res.json({
      mesej: "Fail berjaya diproses.",
      muat_turun: `/api/alat/muat-turun/${nama}`,
      nama_fail: hasil.filename,
    });
  } catch (e) {
    bersih();
    void logPenggunaan({ penggunaId, slug, meta: meta || { nama: slug }, saiz: jumlahSaiz, status: "gagal", mesej: e.message });
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
