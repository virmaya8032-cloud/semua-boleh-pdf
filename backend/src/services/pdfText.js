import fs from "fs";

// Guna binaan "legacy" pdfjs untuk keserasian Node.js.
async function ambilPdfjs() {
  const mod = await import("pdfjs-dist/legacy/build/pdf.mjs");
  return mod;
}

export async function ekstrakTeks(input) {
  const pdfjs = await ambilPdfjs();
  const data = new Uint8Array(fs.readFileSync(input));
  const doc = await pdfjs.getDocument({ data, useSystemFonts: true }).promise;
  let teks = "";
  for (let i = 1; i <= doc.numPages; i++) {
    const halaman = await doc.getPage(i);
    const kandungan = await halaman.getTextContent();
    const baris = kandungan.items.map((it) => it.str).join(" ");
    teks += `--- Halaman ${i} ---\n${baris}\n\n`;
  }
  await doc.destroy();
  return Buffer.from(teks, "utf8");
}

