# Semua Boleh PDF — versi 47 alat

Dikemas kini pada 6 Oktober 2026. Kod ini menambah fungsi setara pada projek sedia ada menggunakan komponen PDF sumber terbuka. Ia bukan kod sumber PDF24. Jenama, reka bentuk, akaun pengguna dan panel pentadbir dikekalkan.

## Apa yang ditambah

| Alat baharu | Hasil |
| --- | --- |
| Ekstrak Gambar PDF | Gambar terbenam dalam ZIP PNG, bukan tangkap layar halaman |
| Tindih PDF | Kandungan PDF kedua ditindih pada PDF pertama; halaman kedua boleh diulang |
| Halaman per Helaian | 2, 4, 6, 9 atau 16 halaman pada A4/A3/A5/Letter/Legal |
| Tukar Saiz Halaman | Muatkan kandungan pada saiz kertas baharu |
| Edit Metadata PDF | Tajuk, pengarang, subjek dan kata kunci |
| Buang Metadata PDF | Buang metadata dokumen dan XMP |
| Flatten PDF | Tetapkan rupa medan borang dan anotasi pada halaman |
| Cipta Borang PDF | Medan teks dan kotak semak pada templat atau A4 kosong |
| Cipta Invois | Isi penjual, pelanggan dan item; jumlah dikira secara automatik |
| Permohonan Kerja PDF | Surat daripada butiran dan teks anda; tambah halaman untuk teks panjang |

## Alat sedia ada yang diperbaiki

- **Edit PDF:** pratonton halaman; letak teks, gambar, sorotan, kotak dan lukisan. Seret untuk menentukan saiz kawasan. Boleh buang anotasi sebelum memproses.
- **Sensor PDF:** pilih kawasan pada pratonton. Pemprosesan membuang teks, grafik dan piksel imej dalam kawasan itu daripada PDF hasil, serta menulis dokumen baharu tanpa objek lama. Kandungan di luar kawasan kekal. Sensor ini tidak memadam salinan maklumat yang berada pada halaman lain atau salinan fail asal.
- **Tandatangan:** lukis tandatangan atau letak gambar melalui editor. Ini tandatangan visual, tanpa sijil digital.
- **PDF kepada Word:** menghasilkan teks yang boleh diedit; bukan susun atur Word yang sama tepat dengan PDF asal.
- **PDF kepada Excel:** jadual yang dikenal pasti diekstrak; jika tiada jadual, teks halaman dimasukkan ke helaian.
- **PDF kepada PowerPoint:** halaman menjadi slaid bergambar; teks tidak boleh diedit pada slaid. Nisbah halaman dikekalkan.
- **Banding PDF:** laporan perubahan baris teks, termasuk perubahan urutan. Bukan perbandingan visual gambar.
- **Gambar kepada PDF:** pilihan saiz asal/A4/Letter, orientasi dan margin.
- **Putar PDF:** pilihan semua halaman atau julat tertentu.
- **Tambah Gambar:** pilihan halaman, kedudukan dan lebar.
- **PDF kepada JPG/PNG:** 72/150/300 DPI dan urutan halaman yang betul.
- **Isi Borang:** teks, kotak semak dan pilihan; boleh kekalkan medan boleh diedit atau flatten.
- Arahan sistem tidak lagi menggunakan shell; kata laluan dihantar sebagai argumen literal. Penukaran LibreOffice menggunakan profil sementara berasingan.
- Laluan publish Netlify dibetulkan kepada `dist` apabila base ialah `frontend`.
- Skema pangkalan data turut dibekalkan dalam backend supaya migrasi tersedia dalam imej Docker.

## Cara guna editor

1. Pilih alat Edit PDF, Tandatangan PDF, Sensor PDF atau Cipta Borang PDF.
2. Muat naik PDF; alat Cipta Borang boleh dimulakan tanpa fail.
3. Pilih halaman dan alat. Untuk teks, isi teks dan saiz sebelum meletakkannya.
4. Klik untuk kotak lalai atau seret untuk saiz sendiri. Untuk lukisan, seret pen pada halaman.
5. Klik Proses Fail dan muat turun hasil.

Pratonton kedudukan/teks ialah anggaran. Semak PDF hasil. Editor menambah kandungan; ia tidak menyunting teks asal seperti Microsoft Word. PDF berkunci perlu dibuka menggunakan kata laluan dahulu. PDF imbasan memerlukan OCR sebelum pengekstrakan teks/jadual.

## Upload ke GitHub — langkah mudah

1. Simpan salinan folder projek lama sebagai sandaran.
2. Extract ZIP ini dan buka folder `semua-boleh-pdf-main`.
3. Salin **kandungan di dalam folder itu**: `backend`, `frontend`, `database` dan fail konfigurasi.
4. GitHub Desktop → pilih repo `semua-boleh-pdf` → Show in Explorer.
5. Paste kandungan tadi ke folder repo dan pilih Replace apabila diminta. Jangan salin keseluruhan folder luar sehingga menjadi folder bersarang.
6. GitHub Desktop → Summary: `Tambah alat PDF dan editor visual` → Commit to main → Push origin.
7. Deploy semula **backend Render** dan **frontend Netlify**. Jika kedua-duanya disambung ke GitHub dengan auto deploy, push akan memulakan deployment.

ZIP hanya mengandungi kod sumber. Jangan upload folder `node_modules` atau fail `.env` sebenar.

## Keperluan deployment

- Frontend: base `frontend`; build `npm run build`; publish `dist`; `VITE_API_URL` ialah URL backend.
- Backend: root `backend`; Docker; Python dipasang melalui `requirements.txt`. Dockerfile menetapkan `PYTHON_BIN`.
- Kekalkan `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGINS` dan butiran pentadbir sedia ada.
- Jika deploy baharu, ikut `DEPLOYMENT.md`. Jangan reset pangkalan data untuk kemas kini ini.
- Uji satu fail contoh selepas deploy. Alat berat memerlukan RAM yang mencukupi.

## Pengesahan dalam persekitaran pembangunan

- Katalog frontend dan backend sepadan: 47 alat.
- 40 ujian backend lulus, meliputi 37 alat serta input tidak sah dan penghantaran argumen sistem.
- Empat aliran API lulus: cipta invois, editor, sensor, cipta borang; termasuk muat turun hasil.
- Frontend berjaya dibina untuk produksi.
- Ujian GUI dalam pelayar belum dijalankan kerana pelayar ujian tidak tersedia dalam persekitaran ini.
- Penukaran Office→PDF, PDF/A dan fungsi qpdf perlu diuji selepas deploy Docker; binari LibreOffice/qpdf tidak tersedia dalam persekitaran ujian ini. OCR diuji dengan fail berteks; kualiti OCR pada dokumen imbasan sebenar bergantung pada imej/bahasa.
- Akaun/log masuk, pangkalan data sebenar dan deployment ke hos anda tidak diuji dalam sesi ini.

## Kebergantungan

Kod menggunakan pdf-lib, PDF.js, PyMuPDF, python-docx, openpyxl, python-pptx dan alat sistem yang disenaraikan dalam Dockerfile. Lesen komponen masing-masing kekal terpakai; PyMuPDF/MuPDF menggunakan AGPL atau lesen komersial. Rujukan: https://pymupdf.readthedocs.io/en/latest/about.html dan https://github.com/pymupdf/PyMuPDF.
