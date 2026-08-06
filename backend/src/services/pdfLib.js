import fs from "fs";
import { PDFDocument, StandardFonts, rgb, degrees } from "pdf-lib";
import { huraiJulat } from "../utils/files.js";

const baca = (p) => fs.readFileSync(p);

async function muat(path) {
  return PDFDocument.load(baca(path), { ignoreEncryption: false });
}

// Gabung beberapa PDF menjadi satu.
export async function gabung(inputs) {
  const keluar = await PDFDocument.create();
  for (const p of inputs) {
    const doc = await muat(p);
    const halaman = await keluar.copyPages(doc, doc.getPageIndices());
    halaman.forEach((h) => keluar.addPage(h));
  }
  return keluar.save();
}

// Pisah kepada kumpulan berdasarkan julat. Pulangkan [{nama, bytes}].
export async function pisah(input, julatText) {
  const doc = await muat(input);
  const jumlah = doc.getPageCount();
  const kumpulan = [];

  if (julatText && julatText.trim()) {
    // Setiap kumpulan dipisah koma menjadi satu fail.
    const bahagian = julatText.split(",").map((s) => s.trim()).filter(Boolean);
    let idx = 1;
    for (const b of bahagian) {
      const indeks = huraiJulat(b, jumlah).map((n) => n - 1);
      if (indeks.length === 0) continue;
      const keluar = await PDFDocument.create();
      const hal = await keluar.copyPages(doc, indeks);
      hal.forEach((h) => keluar.addPage(h));
      kumpulan.push({ nama: `bahagian-${idx}.pdf`, bytes: await keluar.save() });
      idx++;
    }
  } else {
    // Tiada julat: pisah setiap halaman.
    for (let i = 0; i < jumlah; i++) {
      const keluar = await PDFDocument.create();
      const [h] = await keluar.copyPages(doc, [i]);
      keluar.addPage(h);
      kumpulan.push({ nama: `halaman-${i + 1}.pdf`, bytes: await keluar.save() });
    }
  }
  if (kumpulan.length === 0) throw new Error("Tiada halaman untuk dipisah.");
  return kumpulan;
}

export async function padamHalaman(input, halamanText) {
  const doc = await muat(input);
  const jumlah = doc.getPageCount();
  const buang = new Set(huraiJulat(halamanText, jumlah));
  if (buang.size === 0) throw new Error("Sila nyatakan halaman untuk dipadam.");
  if (buang.size >= jumlah) throw new Error("Tidak boleh memadam semua halaman.");
  // Padam dari belakang supaya indeks tidak beralih.
  for (let i = jumlah; i >= 1; i--) if (buang.has(i)) doc.removePage(i - 1);
  return doc.save();
}

export async function ekstrakHalaman(input, halamanText) {
  const doc = await muat(input);
  const jumlah = doc.getPageCount();
  const ambil = huraiJulat(halamanText, jumlah).map((n) => n - 1);
  if (ambil.length === 0) throw new Error("Sila nyatakan halaman untuk diekstrak.");
  const keluar = await PDFDocument.create();
  const hal = await keluar.copyPages(doc, ambil);
  hal.forEach((h) => keluar.addPage(h));
  return keluar.save();
}

export async function susunHalaman(input, susunanText) {
  const doc = await muat(input);
  const jumlah = doc.getPageCount();
  const urutan = susunanText.split(",").map((s) => parseInt(s.trim(), 10));
  if (urutan.some((n) => isNaN(n) || n < 1 || n > jumlah)) {
    throw new Error(`Susunan mesti nombor antara 1 dan ${jumlah}.`);
  }
  const keluar = await PDFDocument.create();
  const hal = await keluar.copyPages(doc, urutan.map((n) => n - 1));
  hal.forEach((h) => keluar.addPage(h));
  return keluar.save();
}

export async function putar(input, sudut) {
  const doc = await muat(input);
  const d = parseInt(sudut, 10) || 90;
  doc.getPages().forEach((h) => {
    const semasa = h.getRotation().angle || 0;
    h.setRotation(degrees((semasa + d) % 360));
  });
  return doc.save();
}

export async function nomborHalaman(input, kedudukan = "bawah-tengah") {
  const doc = await muat(input);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const halaman = doc.getPages();
  halaman.forEach((h, i) => {
    const { width, height } = h.getSize();
    const teks = `${i + 1} / ${halaman.length}`;
    const saiz = 10;
    const lebar = font.widthOfTextAtSize(teks, saiz);
    let x = (width - lebar) / 2;
    let y = 18;
    if (kedudukan === "bawah-kanan") { x = width - lebar - 30; y = 18; }
    if (kedudukan === "atas-tengah") { y = height - 26; }
    h.drawText(teks, { x, y, size: saiz, font, color: rgb(0.25, 0.25, 0.25) });
  });
  return doc.save();
}

export async function teraAir(input, teks) {
  if (!teks || !teks.trim()) throw new Error("Sila masukkan teks tera air.");
  const doc = await muat(input);
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  doc.getPages().forEach((h) => {
    const { width, height } = h.getSize();
    const saiz = Math.min(width, height) / 8;
    h.drawText(teks, {
      x: width / 2 - (font.widthOfTextAtSize(teks, saiz)) / 2,
      y: height / 2,
      size: saiz,
      font,
      color: rgb(0.85, 0.2, 0.2),
      rotate: degrees(45),
      opacity: 0.25,
    });
  });
  return doc.save();
}

export async function potong(input, marginPct) {
  const doc = await muat(input);
  const p = Math.max(0, Math.min(45, parseFloat(marginPct) || 0)) / 100;
  doc.getPages().forEach((h) => {
    const { width, height } = h.getSize();
    const dx = width * p;
    const dy = height * p;
    h.setCropBox(dx, dy, width - dx * 2, height - dy * 2);
  });
  return doc.save();
}

export async function imejKePdf(inputs) {
  const doc = await PDFDocument.create();
  for (const p of inputs) {
    const bytes = baca(p);
    let img;
    const kepala = bytes.subarray(0, 4).toString("hex");
    if (kepala.startsWith("89504e47")) img = await doc.embedPng(bytes);
    else img = await doc.embedJpg(bytes); // anggap JPEG untuk selainnya
    const halaman = doc.addPage([img.width, img.height]);
    halaman.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
  }
  if (doc.getPageCount() === 0) throw new Error("Tiada imej sah dijumpai.");
  return doc.save();
}

export async function tandatangan(input, nama) {
  if (!nama || !nama.trim()) throw new Error("Sila masukkan nama tandatangan.");
  const doc = await muat(input);
  const font = await doc.embedFont(StandardFonts.HelveticaOblique);
  const halaman = doc.getPages();
  const h = halaman[halaman.length - 1];
  const { width } = h.getSize();
  const teks = `Ditandatangani: ${nama}`;
  h.drawText(teks, { x: width - font.widthOfTextAtSize(teks, 14) - 40, y: 50, size: 14, font, color: rgb(0.1, 0.1, 0.5) });
  return doc.save();
}

export async function sensor(input, halaman, yPct, tinggiPct) {
  const doc = await muat(input);
  const idx = (parseInt(halaman, 10) || 1) - 1;
  const halamanArr = doc.getPages();
  if (idx < 0 || idx >= halamanArr.length) throw new Error("Nombor halaman di luar julat.");
  const h = halamanArr[idx];
  const { width, height } = h.getSize();
  const y = height * (1 - (parseFloat(yPct) || 0) / 100);
  const tinggi = height * ((parseFloat(tinggiPct) || 5) / 100);
  h.drawRectangle({ x: 0, y: y - tinggi, width, height: tinggi, color: rgb(0, 0, 0) });
  return doc.save();
}

export async function tambahTeks(input, teks, halaman, xPct, yPct) {
  if (!teks || !teks.trim()) throw new Error("Sila masukkan teks.");
  const doc = await muat(input);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const idx = (parseInt(halaman, 10) || 1) - 1;
  const halamanArr = doc.getPages();
  if (idx < 0 || idx >= halamanArr.length) throw new Error("Nombor halaman di luar julat.");
  const h = halamanArr[idx];
  const { width, height } = h.getSize();
  const x = width * ((parseFloat(xPct) || 0) / 100);
  const y = height * (1 - (parseFloat(yPct) || 0) / 100);
  h.drawText(teks, { x, y, size: 14, font, color: rgb(0, 0, 0) });
  return doc.save();
}

// inputs: [pdfPath, imagePath] (susunan bebas — kesan mengikut sambungan)
export async function tambahGambar(inputs) {
  const pdfPath = inputs.find((p) => p.toLowerCase().endsWith(".pdf"));
  const imgPath = inputs.find((p) => /\.(png|jpe?g)$/i.test(p));
  if (!pdfPath || !imgPath) throw new Error("Perlu satu fail PDF dan satu fail gambar.");
  const doc = await muat(pdfPath);
  const bytes = baca(imgPath);
  const img = imgPath.toLowerCase().endsWith(".png") ? await doc.embedPng(bytes) : await doc.embedJpg(bytes);
  const h = doc.getPages()[0];
  const { width } = h.getSize();
  const skala = Math.min(1, (width * 0.4) / img.width);
  h.drawImage(img, { x: 30, y: 30, width: img.width * skala, height: img.height * skala });
  return doc.save();
}

export async function isiBorang(input, dataText) {
  const doc = await muat(input);
  const borang = doc.getForm();
  const pasangan = (dataText || "").split(/[;\n]/).map((s) => s.trim()).filter(Boolean);
  if (pasangan.length === 0) throw new Error("Sila masukkan data borang (medan=nilai).");
  let diisi = 0;
  for (const p of pasangan) {
    const [medan, ...rest] = p.split("=");
    const nilai = rest.join("=").trim();
    if (!medan) continue;
    try {
      const f = borang.getTextField(medan.trim());
      f.setText(nilai);
      diisi++;
    } catch { /* medan tidak wujud — langkau */ }
  }
  if (diisi === 0) throw new Error("Tiada medan borang sepadan ditemui dalam PDF.");
  borang.flatten();
  return doc.save();
}
