import multer from "multer";
import path from "path";
import fs from "fs";
import { fileTypeFromFile } from "file-type";
import { UPLOAD_DIR, namaRawak, padamFail } from "../utils/files.js";
import { env } from "../config/env.js";

// Simpan dengan nama rawak; kekalkan sambungan asal untuk pengesanan jenis.
const storan = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase().replace(/[^a-z0-9.]/g, "");
    cb(null, namaRawak(ext.replace(/^\./, "")));
  },
});

// Sambungan yang dibenarkan mengikut jenis input.
const DIBENARKAN = new Set([
  ".pdf", ".jpg", ".jpeg", ".png",
  ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx",
  ".html", ".htm",
]);

function saringSambungan(_req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!DIBENARKAN.has(ext)) {
    return cb(new Error(`Jenis fail "${ext || "tidak diketahui"}" tidak disokong.`));
  }
  cb(null, true);
}

export const muatNaik = multer({
  storage: storan,
  fileFilter: saringSambungan,
  limits: { fileSize: env.MAX_FILE_MB * 1024 * 1024, files: 30 },
});

// Tanda tangan bait sebenar yang dibenarkan (magic numbers).
const TANDA_SAH = {
  pdf: ["application/pdf"],
  jpg: ["image/jpeg"],
  jpeg: ["image/jpeg"],
  png: ["image/png"],
  // Format Office & lama dikesan sebagai zip/cfb; kita benarkan tanpa semakan bait ketat.
};

// Sahkan kandungan bait sebenar untuk PDF & imej (elak fail menyamar).
export async function sahkanKandungan(req, res, next) {
  const fail = req.files || (req.file ? [req.file] : []);
  try {
    for (const f of fail) {
      const ext = path.extname(f.originalname).toLowerCase().replace(".", "");
      const perluSemak = TANDA_SAH[ext];
      if (!perluSemak) continue; // office/html — langkau semakan bait
      const jenis = await fileTypeFromFile(f.path);
      if (!jenis || !perluSemak.includes(jenis.mime)) {
        padamFail(fail.map((x) => x.path));
        return res.status(400).json({
          ralat: `Fail "${f.originalname}" nampaknya bukan fail ${ext.toUpperCase()} yang sah.`,
        });
      }
    }
    next();
  } catch (e) {
    padamFail(fail.map((x) => x.path));
    res.status(400).json({ ralat: "Gagal mengesahkan fail yang dimuat naik." });
  }
}
