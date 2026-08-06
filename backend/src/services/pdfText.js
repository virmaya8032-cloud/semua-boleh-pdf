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

// Bandingkan dua PDF pada peringkat baris dan pulangkan laporan teks.
export async function banding(inputs) {
  if (inputs.length < 2) throw new Error("Perlu dua fail PDF untuk dibandingkan.");
  const a = (await ekstrakTeks(inputs[0])).toString("utf8").split(/\s+/);
  const b = (await ekstrakTeks(inputs[1])).toString("utf8").split(/\s+/);

  const setB = new Set(b);
  const setA = new Set(a);
  const hanyaA = a.filter((w) => w && !setB.has(w));
  const hanyaB = b.filter((w) => w && !setA.has(w));

  const laporan =
    "LAPORAN PERBANDINGAN PDF\n" +
    "========================\n\n" +
    `Perkataan hanya dalam Fail 1 (${hanyaA.length}):\n` +
    [...new Set(hanyaA)].slice(0, 500).join(", ") +
    "\n\n" +
    `Perkataan hanya dalam Fail 2 (${hanyaB.length}):\n` +
    [...new Set(hanyaB)].slice(0, 500).join(", ") +
    "\n";
  return Buffer.from(laporan, "utf8");
}
