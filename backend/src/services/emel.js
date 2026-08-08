import { env } from "../config/env.js";

// Hantar e-mel melalui Resend REST API (guna fetch — tiada pakej tambahan).
// Jika RESEND_API_KEY tidak ditetapkan, fungsi ini tidak buat apa-apa (senyap).
async function hantarEmel({ kepada, subjek, html }) {
  if (!env.RESEND_API_KEY) return { dilangkau: true };
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: env.EMEL_DARI, to: kepada, subject: subjek, html }),
    });
    if (!res.ok) {
      const t = await res.text();
      console.error("Resend gagal:", res.status, t);
      return { ralat: true };
    }
    return { berjaya: true };
  } catch (e) {
    console.error("Ralat hantar e-mel:", e.message);
    return { ralat: true };
  }
}

const esc = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Auto-reply kepada pengguna yang menghantar borang.
export function emelTerimaKasih(nama, emel, mesejAsal) {
  const html = `
  <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#1A2749">
    <div style="height:6px;background:linear-gradient(90deg,#1A2749,#E12128);border-radius:6px"></div>
    <h2 style="color:#1A2749">Terima kasih, ${esc(nama)}!</h2>
    <p>Terima kasih kerana menghubungi <strong>Semua Boleh PDF</strong> dan menggunakan perkhidmatan kami.</p>
    <p>Kami telah menerima mesej anda dan akan membalas secepat mungkin. Ini balasan automatik — anda tidak perlu membalas e-mel ini.</p>
    <div style="background:#F7F8FA;border-left:4px solid #E12128;padding:12px 16px;margin:16px 0;border-radius:4px">
      <p style="margin:0;color:#5b6472;font-size:14px"><em>Mesej anda:</em></p>
      <p style="margin:8px 0 0;white-space:pre-wrap">${esc(mesejAsal)}</p>
    </div>
    <p>Sementara menunggu, jelajahi lebih 30 alat PDF percuma kami di
      <a href="https://www.semuabolehpdf.com" style="color:#E12128;font-weight:bold">semuabolehpdf.com</a>.</p>
    <p style="margin-top:24px;color:#5b6472;font-size:13px">— Pasukan Semua Boleh PDF</p>
    <hr style="border:none;border-top:1px solid #eee;margin:20px 0">
    <p style="color:#9aa0a6;font-size:12px">© 2026 Semua Boleh PDF oleh Veramuthu Timrayan. Hak cipta terpelihara.</p>
  </div>`;
  return hantarEmel({ kepada: emel, subjek: "Terima kasih kerana menghubungi Semua Boleh PDF", html });
}

// Pemberitahuan kepada pentadbir bahawa ada mesej baru.
export function emelPemberitahuanPentadbir(nama, emel, mesejAsal) {
  if (!env.EMEL_PENTADBIR) return Promise.resolve({ dilangkau: true });
  const html = `
  <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#1A2749">
    <h2 style="color:#1A2749">Mesej baharu daripada pengguna</h2>
    <p><strong>Nama:</strong> ${esc(nama)}<br>
       <strong>E-mel:</strong> <a href="mailto:${esc(emel)}">${esc(emel)}</a></p>
    <div style="background:#F7F8FA;border-left:4px solid #1A2749;padding:12px 16px;margin:16px 0;border-radius:4px">
      <p style="margin:0;white-space:pre-wrap">${esc(mesejAsal)}</p>
    </div>
    <p><a href="https://www.semuabolehpdf.com/pentadbir" style="color:#E12128;font-weight:bold">Buka Panel Pentadbir</a></p>
  </div>`;
  return hantarEmel({ kepada: env.EMEL_PENTADBIR, subjek: `Mesej baharu daripada ${nama}`, html });
}
