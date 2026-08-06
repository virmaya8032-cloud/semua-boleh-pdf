import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { env } from "../config/env.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const UPLOAD_DIR = path.resolve(__dirname, "../../uploads");
export const OUTPUT_DIR = path.resolve(__dirname, "../../outputs");

for (const dir of [UPLOAD_DIR, OUTPUT_DIR]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// Nama fail rawak yang selamat (tiada input pengguna dalam nama).
export function namaRawak(ext = "") {
  const id = crypto.randomBytes(16).toString("hex");
  return ext ? `${id}.${ext.replace(/^\./, "")}` : id;
}

export function laluanOutput(ext) {
  return path.join(OUTPUT_DIR, namaRawak(ext));
}

// Hurai "1-3, 5, 8-10" -> [1,2,3,5,8,9,10] (1-diasaskan), tanpa pendua, tersusun.
export function huraiJulat(teks, maxHalaman) {
  if (!teks || !String(teks).trim()) return [];
  const set = new Set();
  for (const bahagian of String(teks).split(",")) {
    const t = bahagian.trim();
    if (!t) continue;
    const m = t.match(/^(\d+)\s*-\s*(\d+)$/);
    if (m) {
      let a = parseInt(m[1], 10);
      let b = parseInt(m[2], 10);
      if (a > b) [a, b] = [b, a];
      for (let i = a; i <= b; i++) if (i >= 1 && i <= maxHalaman) set.add(i);
    } else if (/^\d+$/.test(t)) {
      const n = parseInt(t, 10);
      if (n >= 1 && n <= maxHalaman) set.add(n);
    } else {
      throw new Error(`Format julat tidak sah: "${t}"`);
    }
  }
  return [...set].sort((a, b) => a - b);
}

// Padam senarai fail secara senyap.
export function padamFail(...laluan) {
  for (const p of laluan.flat()) {
    if (p && fs.existsSync(p)) {
      try { fs.unlinkSync(p); } catch { /* abaikan */ }
    }
  }
}

// Jadualkan pemadaman fail output selepas tempoh TTL.
export function jadualPadam(laluan, minit = env.FILE_TTL_MIN) {
  const ms = Math.max(1, minit) * 60 * 1000;
  setTimeout(() => padamFail(laluan), ms).unref?.();
}

// Sapuan berkala: buang fail lama dalam uploads/outputs yang tertinggal.
export function mulaSapuanBerkala() {
  const jalankan = () => {
    const hadUsia = env.FILE_TTL_MIN * 60 * 1000;
    for (const dir of [UPLOAD_DIR, OUTPUT_DIR]) {
      let entri = [];
      try { entri = fs.readdirSync(dir); } catch { continue; }
      for (const nama of entri) {
        if (nama === ".gitkeep") continue;
        const p = path.join(dir, nama);
        try {
          const st = fs.statSync(p);
          if (Date.now() - st.mtimeMs > hadUsia) fs.unlinkSync(p);
        } catch { /* abaikan */ }
      }
    }
  };
  jalankan();
  setInterval(jalankan, 10 * 60 * 1000).unref?.();
}
