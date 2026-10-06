import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";
import { pathToFileURL } from "url";
import { OUTPUT_DIR, namaRawak } from "../utils/files.js";

// Jalankan arahan tanpa shell (elak suntikan). Pulangkan {code, stdout, stderr}.
function jalan(cmd, args, opsyen = {}) {
  return new Promise((resolve, reject) => {
    const { timeoutMs = 120000, ...spawnOptions } = opsyen;
    const anak = spawn(cmd, args, { ...spawnOptions, shell: false });
    const timeout = setTimeout(() => { anak.kill("SIGKILL"); reject(new Error("Pemprosesan terlalu lama. Cuba fail yang lebih kecil atau beberapa halaman sahaja.")); }, timeoutMs);
    let out = "", err = "";
    anak.stdout?.on("data", (d) => (out += d));
    anak.stderr?.on("data", (d) => (err += d));
    anak.on("error", (e) => {
      clearTimeout(timeout);
      if (e.code === "ENOENT") {
        reject(new Error(`Alat sistem "${cmd}" tidak dipasang pada pelayan. Sila pasang melalui Docker.`));
      } else reject(e);
    });
    anak.on("close", (code) => {
      clearTimeout(timeout);
      if (code === 0 || (cmd === "qpdf" && code === 3)) resolve({ code, out, err });
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
  const args = ["--headless", "--norestore", `-env:UserInstallation=${pathToFileURL(path.join(kerja,"profile")).href}`];
  if (infilter) args.push(`--infilter=${infilter}`);
  args.push("--convert-to", targetFilter, "--outdir", kerja, input);
  try {
  await jalan("libreoffice", args, {timeoutMs:300000});

  const dihasilkan = fs.readdirSync(kerja).find((f) => f.toLowerCase().endsWith("." + extKeluar));
  if (!dihasilkan) throw new Error("Penukaran gagal — tiada fail hasil dijana.");
  const out = outPath(extKeluar);
  fs.copyFileSync(path.join(kerja, dihasilkan), out);
  return out;
  } finally { fs.rmSync(kerja, { recursive: true, force: true }); }
}

export const officeKePdf = (input) => libreConvert(input, "pdf", "pdf");
export const htmlKePdf = (input) => libreConvert(input, "pdf", "pdf");
export const pdfA = (input) =>
  libreConvert(input, 'pdf:draw_pdf_Export:{"SelectPdfVersion":{"type":"long","value":"1"}}', "pdf", "draw_pdf_import");

// ---------- Poppler: PDF -> imej (dizipkan oleh lapisan proses) ----------
export async function pdfKeImej(input, format = "png", dpi = "150") {
  const resolution = Number(dpi);
  if (![72, 150, 300].includes(resolution)) throw new Error("Resolusi imej tidak sah.");
  const kerja = fs.mkdtempSync(path.join(os.tmpdir(), "sbp-img-"));
  const prefix = path.join(kerja, "hal");
  const flag = format === "jpg" ? "-jpeg" : "-png";
  try { await jalan("pdftoppm", [flag, "-r", String(resolution), input, prefix]); } catch (error) { fs.rmSync(kerja, {recursive:true,force:true}); throw error; }
  const fail = fs.readdirSync(kerja)
    .filter((f) => f.startsWith("hal"))
    .sort((a,b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((f) => path.join(kerja, f));
  if (fail.length === 0) { fs.rmSync(kerja, { recursive: true, force: true }); throw new Error("Tiada halaman ditukar."); }
  return { dir: kerja, fail };
}

// ---------- OCRmyPDF: jadikan PDF boleh dicari ----------
export async function ocr(input, bahasa = "eng", opts = {}) {
  if (!['eng','msa','ind','msa+eng','tam','tam+eng'].includes(bahasa)) throw new Error('Bahasa OCR tidak sah.');
  const langs = await jalan('tesseract', ['--list-langs']);
  const available = new Set((langs.out+'\n'+langs.err).split(/\r?\n/).map(s=>s.trim()));
  if (bahasa.split('+').some(lang=>!available.has(lang))) throw new Error(`Data bahasa OCR ${bahasa} belum dipasang pada backend. Deploy semula Docker atau pilih bahasa Inggeris jika sesuai.`);
  const out = outPath("pdf");
  const mode = ({skip:'--skip-text',redo:'--redo-ocr',force:'--force-ocr'})[opts.mod || 'skip'];
  if (!mode) throw new Error('Mod OCR tidak sah.');
  const args=['-l',bahasa,mode,'--output-type','pdf','--optimize','0','--jobs','1','--tesseract-timeout','90'];
  if (opts.halaman) {
    if (!/^\d+(?:-\d+)?(?:,\d+(?:-\d+)?)*$/.test(String(opts.halaman).replace(/\s/g,''))) throw new Error('Julat halaman OCR tidak sah.');
    args.push('--pages',String(opts.halaman).replace(/\s/g,''));
  }
  args.push(input,out);
  try {
    await jalan('ocrmypdf',args,{timeoutMs:540000});
    return out;
  } catch (error) {
    fs.rmSync(out,{force:true});
    if (/encrypted|password/i.test(error.message)) throw new Error('PDF berkunci. Buka kunci PDF sebelum OCR.');
    if (/timeout|timed out/i.test(error.message)) throw new Error('OCR mengambil masa terlalu lama. Cuba julat halaman lebih kecil atau imej yang lebih jelas.');
    throw error;
  }
}

export { jalan };
