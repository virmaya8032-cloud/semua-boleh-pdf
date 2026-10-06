import fs from "fs";
import path from "path";
import archiver from "archiver";
import * as PL from "./pdfLib.js";
import * as PT from "./pdfText.js";
import * as BIN from "./binary.js";
import { pythonPdf } from "./pythonPdf.js";
import { OUTPUT_DIR, namaRawak, laluanOutput } from "../utils/files.js";

function simpanBytes(bytes, ext = "pdf") {
  const out = laluanOutput(ext);
  fs.writeFileSync(out, Buffer.from(bytes));
  return out;
}

// Zip senarai {nama, bytes} ATAU senarai laluan fail -> pulangkan laluan zip.
function buatZip(entri) {
  return new Promise((resolve, reject) => {
    const out = path.join(OUTPUT_DIR, namaRawak("zip"));
    const stream = fs.createWriteStream(out);
    const arkib = archiver("zip", { zlib: { level: 9 } });
    stream.on("close", () => resolve(out));
    arkib.on("error", reject);
    arkib.pipe(stream);
    for (const e of entri) {
      if (e.bytes) arkib.append(Buffer.from(e.bytes), { name: e.nama });
      else arkib.file(e.laluan, { name: e.nama });
    }
    arkib.finalize();
  });
}

const MIME = {
  pdf: "application/pdf",
  zip: "application/zip",
  txt: "text/plain; charset=utf-8",
  html: "text/html; charset=utf-8",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
};

function hasil(laluan, ext, namaMesra) {
  return { path: laluan, filename: `${namaMesra}.${ext}`, mime: MIME[ext] || "application/octet-stream" };
}

// paths: laluan fail input; opts: objek pilihan.
export async function proses(op, paths, opts = {}) {
  const p0 = paths[0];
  switch (op) {
    case "gabung":
      return hasil(simpanBytes(await PL.gabung(paths)), "pdf", "gabungan");
    case "pisah": {
      const kumpulan = await PL.pisah(p0, opts.julat);
      if (kumpulan.length === 1) return hasil(simpanBytes(kumpulan[0].bytes), "pdf", "pisahan");
      return hasil(await buatZip(kumpulan), "zip", "pisahan");
    }
    case "padam-halaman":
      return hasil(simpanBytes(await PL.padamHalaman(p0, opts.halaman)), "pdf", "dokumen-dipadam");
    case "ekstrak-halaman":
      return hasil(simpanBytes(await PL.ekstrakHalaman(p0, opts.halaman)), "pdf", "halaman-diekstrak");
    case "susun-halaman":
      return hasil(simpanBytes(await PL.susunHalaman(p0, opts.susunan)), "pdf", "dokumen-disusun");
    case "putar":
      return hasil(simpanBytes(await PL.putar(p0, opts.sudut, opts.halaman)), "pdf", "dokumen-diputar");
    case "nombor-halaman":
      return hasil(simpanBytes(await PL.nomborHalaman(p0, opts.kedudukan)), "pdf", "dokumen-bernombor");
    case "tera-air":
      return hasil(simpanBytes(await PL.teraAir(p0, opts.teks)), "pdf", "dokumen-tera-air");
    case "potong":
      if (opts.anotasi) return hasil(await pythonPdf('crop',paths,opts),'pdf','dokumen-dipotong');
      return hasil(simpanBytes(await PL.potong(p0, opts.margin)), "pdf", "dokumen-dipotong");
    case "imej-ke-pdf":
      return hasil(simpanBytes(await PL.imejKePdf(paths, opts)), "pdf", "imej-ke-pdf");
    case "tandatangan":
      return hasil(simpanBytes(await PL.tandatangan(p0, opts.nama)), "pdf", "dokumen-ditandatangani");
    case "sensor":
      return hasil(await pythonPdf("sensor", paths, opts), "pdf", "dokumen-disensor");
    case "tambah-teks":
      return hasil(simpanBytes(await PL.tambahTeks(p0, opts.teks, opts.halaman, opts.x, opts.y, opts.saiz)), "pdf", "dokumen-diedit");
    case "tambah-gambar":
      if (opts.anotasi) return hasil(await pythonPdf('edit',paths,opts),'pdf','dokumen-bergambar');
      return hasil(simpanBytes(await PL.tambahGambar(paths, opts)), "pdf", "dokumen-bergambar");
    case "isi-borang":
      if (opts.anotasi !== undefined) return hasil(await pythonPdf('fill-edit',paths,opts),'pdf','borang-diisi');
      return hasil(simpanBytes(await PL.isiBorang(p0, opts.data, opts.flatten, opts.field_values)), "pdf", "borang-diisi");
    case "pdf-ke-teks":
      return hasil(await pythonPdf('teks-kemas',paths,opts,'txt'),'txt','teks-diekstrak');
    case "banding":
      return hasil(await pythonPdf("banding", paths, opts, "html"), "html", "laporan-perbandingan");

    // --- Binari sistem ---
    case "mampat":
      return hasil(await BIN.mampat(p0, opts.tahap), "pdf", "dokumen-dimampat");
    case "baiki":
      return hasil(await BIN.baiki(p0), "pdf", "dokumen-dibaiki");
    case "optimize":
      return hasil(await BIN.optimize(p0), "pdf", "dokumen-dioptimakan");
    case "lindungi":
      return hasil(await BIN.lindungi(p0, opts.kata_laluan), "pdf", "dokumen-dilindungi");
    case "buka-kunci":
      return hasil(await BIN.bukaKunci(p0, opts.kata_laluan), "pdf", "dokumen-dibuka");
    case "office-ke-pdf":
      return hasil(await BIN.officeKePdf(p0), "pdf", "dokumen");
    case "html-ke-pdf":
      return hasil(await BIN.htmlKePdf(p0), "pdf", "dokumen");
    case "pdf-ke-office":
      return hasil(await pythonPdf("pdf-ke-word", paths, opts, "docx"), "docx", "dokumen");
    case "pdf-ke-excel":
      return hasil(await pythonPdf("pdf-ke-excel", paths, opts, "xlsx"), "xlsx", "dokumen");
    case "pdf-ke-pptx":
      return hasil(await pythonPdf("pdf-ke-powerpoint", paths, opts, "pptx"), "pptx", "dokumen");
    case "pdf-a":
      return hasil(await BIN.pdfA(p0), "pdf", "dokumen-pdfa");
    case "ocr":
      return hasil(await BIN.ocr(p0, opts.bahasa, opts), "pdf", "dokumen-ocr");
    case "pdf-ke-imej": {
      const { dir, fail } = await BIN.pdfKeImej(p0, opts._format || "png", opts.dpi || "150");
      const ext = (opts._format || "png") === "jpg" ? "jpg" : "png";
      const entri = fail.map((f, i) => ({ laluan: f, nama: `halaman-${i + 1}.${ext}` }));
      const zip = await buatZip(entri);
      fs.rmSync(dir, { recursive: true, force: true });
      return hasil(zip, "zip", "halaman-imej");
    }

    case "ekstrak-gambar":
      return hasil(await pythonPdf(op, paths, opts, "zip"), "zip", "gambar-pdf");
    case "overlay": case "nup": case "saiz-halaman": case "edit-metadata":
    case "buang-metadata": case "flatten": case "cipta-borang":
    case "invois": case "permohonan-kerja": case "edit":
      return hasil(await pythonPdf(op, paths, opts), "pdf", `hasil-${op}`);
    default:
      throw new Error(`Operasi tidak dikenali: ${op}`);
  }
}
