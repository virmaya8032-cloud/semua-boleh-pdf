import path from "path";
import { jadualPadam, padamFail } from "./files.js";

// Peta: namaRawak -> { path, filename, mime }
const daftar = new Map();

export function daftarOutput(hasil) {
  const nama = path.basename(hasil.path);
  daftar.set(nama, hasil);
  // Padam automatik selepas tempoh TTL walaupun tidak dimuat turun.
  jadualPadam(hasil.path);
  setTimeout(() => daftar.delete(nama), 60 * 60 * 1000).unref?.();
  return nama;
}

export function ambilOutput(nama) {
  // Hanya benarkan nama fail asas (elak laluan traversal).
  if (nama !== path.basename(nama)) return null;
  return daftar.get(nama) || null;
}

export function buangOutput(nama) {
  const h = daftar.get(nama);
  if (h) { padamFail(h.path); daftar.delete(nama); }
}
