# Panduan Penggunaan (Deployment)

Panduan ini melancarkan **Semua Boleh PDF** ke internet secara percuma/murah menggunakan:

- **Neon** — pangkalan data PostgreSQL (percuma)
- **Render** — backend (Docker, kerana ia perlukan binari sistem)
- **Netlify** — frontend (laman statik)

Anggaran masa: 20–30 minit.

---

## Langkah 0 — Muat naik ke GitHub

1. Buka [github.com](https://github.com) dan cipta repositori baharu (cth: `semua-boleh-pdf`).
2. Dalam folder projek ini:

```bash
git init
git add .
git commit -m "Semua Boleh PDF - versi pertama"
git branch -M main
git remote add origin https://github.com/NAMA-ANDA/semua-boleh-pdf.git
git push -u origin main
```

---

## Langkah 1 — Pangkalan Data (Neon)

1. Daftar di [neon.tech](https://neon.tech) dan cipta projek baharu.
2. Salin **connection string** (pilih mod *Pooled connection*). Ia kelihatan seperti:
   ```
   postgresql://pengguna:kata_laluan@ep-xxxx-pooler.region.aws.neon.tech/neondb?sslmode=require
   ```
3. Simpan string ini — anda akan menampalnya sebagai `DATABASE_URL` di Render.

---

## Langkah 2 — Backend (Render)

1. Daftar di [render.com](https://render.com) dan sambungkan akaun GitHub anda.
2. Klik **New +** → **Web Service** → pilih repo anda.
3. Tetapan:
   - **Root Directory:** `backend`
   - **Runtime:** `Docker`
   - **Dockerfile Path:** `./Dockerfile`
   - **Plan:** `Starter` (disyorkan — LibreOffice perlukan memori; pelan percuma mungkin kehabisan memori untuk penukaran Office)
   - **Health Check Path:** `/api/kesihatan`
4. Tambah **Environment Variables**:

   | Kunci | Nilai |
   |-------|-------|
   | `NODE_ENV` | `production` |
   | `PORT` | `4000` |
   | `DATABASE_URL` | *(connection string Neon dari Langkah 1)* |
   | `JWT_SECRET` | *(rahsia rawak panjang — cth hasil `openssl rand -base64 48`)* |
   | `JWT_EXPIRES` | `7d` |
   | `CORS_ORIGINS` | *(isi selepas Langkah 3, cth `https://laman-anda.netlify.app`)* |
   | `MAX_FILE_MB` | `50` |
   | `FILE_TTL_MIN` | `30` |
   | `ADMIN_EMAIL` | *(e-mel pentadbir anda)* |
   | `ADMIN_PASSWORD` | *(kata laluan pentadbir yang kukuh)* |
   | `ADMIN_NAMA` | `Pentadbir` |

5. Klik **Create Web Service**. Render akan membina imej Docker (memasang Ghostscript, qpdf, LibreOffice, Poppler, OCRmyPDF, Tesseract) — binaan pertama mengambil masa beberapa minit.
6. Setelah "live", salin URL backend, cth: `https://semua-boleh-pdf-api.onrender.com`.

> **Alternatif:** Repo ini mengandungi `render.yaml`. Anda boleh guna **New + → Blueprint** dan Render membaca konfigurasi itu secara automatik (anda masih perlu isi `DATABASE_URL`, `CORS_ORIGINS`, dan butiran admin).

### Jalankan migrasi pangkalan data

Selepas backend "live", jalankan migrasi sekali untuk mencipta jadual + akaun pentadbir. Di Render, buka tab **Shell** untuk servis tersebut dan jalankan:

```bash
npm run migrate
```

Anda sepatutnya melihat "Skema selesai." dan mesej benih pentadbir.

---

## Langkah 3 — Frontend (Netlify)

1. Daftar di [netlify.com](https://netlify.com) dan sambungkan GitHub.
2. **Add new site** → **Import an existing project** → pilih repo anda.
3. Tetapan binaan:
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `frontend/dist`
   *(Fail `netlify.toml` yang disertakan sudah menetapkan ini secara automatik.)*
4. Tambah **Environment variable**:
   - `VITE_API_URL` = URL backend Render anda (dari Langkah 2), cth `https://semua-boleh-pdf-api.onrender.com`
5. **Deploy**. Setelah siap, anda akan dapat URL seperti `https://laman-anda.netlify.app`.

---

## Langkah 4 — Sambungkan Frontend & Backend (CORS)

1. Kembali ke Render → servis backend → **Environment**.
2. Tetapkan `CORS_ORIGINS` kepada URL Netlify anda, cth:
   ```
   https://laman-anda.netlify.app
   ```
   (Boleh masukkan beberapa origin dipisah koma.)
3. Simpan — Render akan deploy semula secara automatik.

Selesai! Buka URL Netlify anda dan cuba muat naik PDF.

---

## Pengesahan selepas deploy

- Lawati `https://URL-BACKEND/api/kesihatan` → sepatutnya memaparkan `{"status":"ok",...}`
- Daftar akaun baharu di laman anda
- Log masuk sebagai pentadbir (guna `ADMIN_EMAIL`/`ADMIN_PASSWORD`) dan buka `/pentadbir`
- Cuba alat **Gabung PDF** (tulen JS — pasti berfungsi) dan **Mampat PDF** (guna Ghostscript daripada Docker)

---

## Penyelesaian Masalah

| Masalah | Punca & penyelesaian |
|---------|----------------------|
| Ralat CORS di pelayar | `CORS_ORIGINS` di Render tidak sepadan dengan URL Netlify (termasuk `https://`). |
| "Alat memerlukan perisian tambahan…" | Binari tidak dipasang — pastikan backend di-deploy melalui **Docker**, bukan runtime Node biasa. |
| Penukaran Office gagal / kehabisan memori | Naik taraf pelan Render (LibreOffice memerlukan RAM lebih). |
| Log masuk gagal selepas deploy | Migrasi belum dijalankan — jalankan `npm run migrate` melalui Shell Render. |
| Pangkalan data tidak tersambung | Semak `DATABASE_URL` (gunakan connection string *pooled* Neon dengan `sslmode=require`). |
| Fail besar ditolak | Naikkan `MAX_FILE_MB` di Render. |

---

## Nota keselamatan produksi

- Tukar `ADMIN_PASSWORD` kepada kata laluan yang kukuh dan unik.
- Pastikan `JWT_SECRET` ialah rentetan rawak yang panjang dan rahsia.
- Jangan pernah commit fail `.env` sebenar ke GitHub (sudah disekat oleh `.gitignore`).
