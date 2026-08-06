# Semua Boleh PDF

Platform alat PDF dalam talian, **sepenuhnya dalam Bahasa Melayu** — gabung, pisah, mampat, tukar, lindungi dan banyak lagi. Dibina sebagai aplikasi web penuh (full-stack) yang berfungsi, dengan **37 alat PDF**, papan pemuka pengguna & pentadbir, dan pemprosesan fail sebenar di pelayan.

> Reka bentuk, kod dan jenama adalah tersendiri. Ia bukan salinan mana-mana produk lain — hanya diilhamkan oleh konsep "koleksi alat PDF".

---

## Kandungan

- `frontend/` — Antara muka React (Vite + Tailwind CSS)
- `backend/` — Pelayan API Node.js (Express) + pemprosesan PDF
- `database/` — Skema PostgreSQL
- `netlify.toml`, `render.yaml` — Konfigurasi penggunaan
- `DEPLOYMENT.md` — Panduan langkah demi langkah untuk melancarkan ke internet

---

## Ciri-ciri

**Alat PDF (37)** merentasi 6 kategori:
- **Pengurusan** — gabung, pisah, padam/ekstrak/susun halaman, putar, nombor halaman, tera air, potong
- **Mampatan & pembaikan** — mampat, baiki, optimakan
- **Tukar kepada PDF** — Word, Excel, PowerPoint, JPG, PNG, HTML
- **Tukar daripada PDF** — Word, Excel, PowerPoint, JPG, PNG, teks
- **Keselamatan** — lindungi/buka kunci kata laluan, tandatangan, sensor (redaction)
- **Tambahan** — imbas ke PDF, OCR, banding, tambah teks/gambar, edit, isi borang, PDF/A

**Sistem penuh:**
- Pendaftaran & log masuk (JWT, kata laluan di-hash dengan bcrypt)
- Papan pemuka pengguna — statistik, sejarah penggunaan, kemas kini profil, tukar kata laluan
- Panel pentadbir — statistik keseluruhan, urus pengguna (sekat/padam), log aktiviti, eksport CSV, status sistem
- Muat naik selamat (semakan jenis fail), had saiz, pemadaman fail automatik
- Antara muka responsif (telefon, tablet, komputer), 100% Bahasa Melayu

---

## Menjalankan Secara Tempatan

### Keperluan
- **Node.js 18+**
- **PostgreSQL** (atau akaun percuma [Neon](https://neon.tech))
- Untuk alat berasaskan binari (mampat, tukar Office, dsb.): **Ghostscript, qpdf, LibreOffice, Poppler, OCRmyPDF, Tesseract**. Ini dipasang secara automatik dalam Docker (lihat `backend/Dockerfile`) apabila di-deploy.

### 1) Backend

```bash
cd backend
cp .env.example .env        # kemudian isikan DATABASE_URL, JWT_SECRET, dll.
npm install
npm run migrate             # cipta jadual + akaun pentadbir pertama
npm run dev                 # pelayan di http://localhost:4000
```

### 2) Frontend

```bash
cd frontend
cp .env.example .env        # biarkan VITE_API_URL kosong untuk pembangunan tempatan
npm install
npm run dev                 # laman di http://localhost:5173
```

Frontend memproksi `/api` ke `http://localhost:4000` secara automatik semasa pembangunan.

### Log masuk pentadbir
Selepas `npm run migrate`, akaun pentadbir pertama dicipta menggunakan nilai `ADMIN_EMAIL` / `ADMIN_PASSWORD` dalam `.env`. Log masuk dengannya untuk mengakses `/pentadbir`.

---

## Nota Penting tentang Alat

Alat dibahagikan kepada dua jenis dari segi teknikal:

1. **Tulen JavaScript** (berfungsi serta-merta, tanpa binari luar) — gabung, pisah, padam/ekstrak/susun halaman, putar, nombor halaman, tera air, potong, imej→PDF, tandatangan, sensor, tambah teks/gambar, isi borang, ekstrak teks, banding.

2. **Berasaskan binari sistem** (memerlukan perisian dipasang — disertakan dalam Docker) — mampat & PDF/A (Ghostscript/LibreOffice), baiki/optimakan/lindungi/buka kunci (qpdf), tukar Office↔PDF (LibreOffice), PDF→imej (Poppler), OCR (Tesseract).

Alat kumpulan (2) akan berjalan apabila backend di-deploy melalui `Dockerfile` yang disediakan (Render, atau mana-mana hos Docker). Jika binari tidak dipasang, alat tersebut memulangkan mesej ralat Bahasa Melayu yang jelas dan bukannya ranap.

**Ketepatan penukaran:** penukaran seperti PDF→Excel / PDF→PowerPoint bergantung pada LibreOffice dan bersifat "usaha terbaik" — hasil mungkin berbeza mengikut struktur dokumen asal.

---

## Privasi & Keselamatan

- Sambungan disulitkan (HTTPS di produksi)
- Fail input dipadam sejurus selepas diproses; fail output dipadam selepas dimuat turun atau selepas tempoh TTL (lalai 30 minit)
- Pangkalan data hanya menyimpan **metadata** penggunaan (jenis alat, saiz, status) — **bukan** kandungan dokumen
- Kata laluan di-hash (bcrypt), token JWT, had kadar permintaan, pengesahan jenis fail (magic bytes)

---

## Deploy ke Internet

Lihat **[DEPLOYMENT.md](./DEPLOYMENT.md)** untuk panduan penuh: GitHub → Neon (pangkalan data) → Render (backend Docker) → Netlify (frontend).

---

## Lesen

Projek ini disediakan untuk kegunaan anda. Semua reka bentuk dan kod adalah tersendiri.
