import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";
import crypto from "crypto";
import { OUTPUT_DIR, namaRawak } from "../utils/files.js";

// Jalankan arahan tanpa shell (elak suntikan). Pulangkan {code, stdout, stderr}.
function jalan(cmd, args, opsyen = {}) {
  return new Promise((resolve, reject) => {
    const anak = spawn(cmd, args, { shell: true, ...opsyen });
    let out = "", err = "";
    anak.stdout?.on("data", (d) => (out += d));
    anak.stderr?.on("data", (d) => (err += d));
    anak.on("error", (e) => {
      if (e.code === "ENOENT") {
        reject(new Error(`Alat sistem "${cmd}" tidak dipasang pada pelayan. Sila pasang melalui Docker.`));
      } else reject(e);
    });
    anak.on("close", (code) => {
      if (code === 0) resolve({ code, out, err });
      else reject(new Error(err.trim() || `Proses "${cmd}" gagal (kod ${code}).`));
    });
  });
}

function outPath(ext) {
  return path.join(OUTPUT_DIR, namaRawak(ext));
}

// ---------- Ghostscript: mampat ----------
export async function mampat(input, tahap = "sederhana") {
  const peta = { ringan: "/printer", sederhana: "/ebook", kuat: "/screen" };
  const setting = peta[tahap] || "/ebook";
  const out = outPath("pdf");
  await jalan("gs", [
    "-sDEVICE=pdfwrite",
    "-dCompatibilityLevel=1.4",
    `-dPDFSETTINGS=${setting}`,
    "-dNOPAUSE", "-dQUIET", "-dBATCH",
    `-sOutputFile=${out}`,
    input,
  ]);
  return out;
}

// ---------- qpdf: baiki / optimize / lindungi / buka kunci ----------
export async function baiki(input) {
  const out = outPath("pdf");
  await jalan("qpdf", [input, out]); // penulisan semula membaiki isu ringan
  return out;
}

export async function optimize(input) {
  const out = outPath("pdf");
  await jalan("qpdf", ["--linearize", input, out]);
  return out;
}

export async function lindungi(input, kataLaluan) {
  if (!kataLaluan) throw new Error("Sila masukkan kata laluan.");
  const out = outPath("pdf");
  await jalan("qpdf", ["--encrypt", kataLaluan, kataLaluan, "256", "--", input, out]);
  return out;
}

export async function bukaKunci(input, kataLaluan) {
  const out = outPath("pdf");
  await jalan("qpdf", [`--password=${kataLaluan || ""}`, "--decrypt", input, out]);
  return out;
}

// ---------- LibreOffice: penukaran dokumen ----------
async function libreConvert(input, targetFilter, extKeluar, infilter) {
  const kerja = fs.mkdtempSync(path.join(os.tmpdir(), "sbp-"));
  const args = ["--headless", "--norestore"];
  if (infilter) args.push(`--infilter=${infilter}`);
  args.push("--convert-to", targetFilter, "--outdir", kerja, input);
  await jalan("libreoffice", args, { env: { ...process.env, HOME: kerja } });

  const dihasilkan = fs.readdirSync(kerja).find((f) => f.toLowerCase().endsWith("." + extKeluar));
  if (!dihasilkan) throw new Error("Penukaran gagal — tiada fail hasil dijana.");
  const out = outPath(extKeluar);
  fs.copyFileSync(path.join(kerja, dihasilkan), out);
  fs.rmSync(kerja, { recursive: true, force: true });
  return out;
}

export const officeKePdf = (input) => libreConvert(input, "pdf", "pdf");
export const htmlKePdf = (input) => libreConvert(input, "pdf", "pdf");
export const pdfKeWord = (input) => libreConvert(input, 'docx:"MS Word 2007 XML"', "docx", "writer_pdf_import");
export const pdfKeExcel = (input) => libreConvert(input, 'xlsx:"Calc MS Excel 2007 XML"', "xlsx", "calc_pdf_import");
export const pdfKePptx = (input) => libreConvert(input, 'pptx:"Impress MS PowerPoint 2007 XML"', "pptx", "impress_pdf_import");
export const pdfA = (input) =>
  libreConvert(input, 'pdf:writer_pdf_Export:{"SelectPdfVersion":{"type":"long","value":"1"}}', "pdf");

// ---------- Poppler: PDF -> imej (dizipkan oleh lapisan proses) ----------
export async function pdfKeImej(input, format = "png") {
  const kerja = fs.mkdtempSync(path.join(os.tmpdir(), "sbp-img-"));
  const prefix = path.join(kerja, "hal");
  const flag = format === "jpg" ? "-jpeg" : "-png";
  await jalan("pdftoppm", [flag, "-r", "150", input, prefix]);
  const fail = fs.readdirSync(kerja)
    .filter((f) => f.startsWith("hal"))
    .sort()
    .map((f) => path.join(kerja, f));
  if (fail.length === 0) { fs.rmSync(kerja, { recursive: true, force: true }); throw new Error("Tiada halaman ditukar."); }
  return { dir: kerja, fail };
}

// ---------- OCRmyPDF: jadikan PDF boleh dicari ----------
export async function ocr(input, bahasa = "eng") {
  const out = outPath("pdf");
  await jalan("ocrmypdf", ["-l", bahasa, "--skip-text", "--optimize", "1", input, out]);
  return out;
}

export { jalan };
