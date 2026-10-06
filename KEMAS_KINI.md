# Semua Boleh PDF — 47 alat, editor visual dan pemprosesan baharu

Dikemas kini pada 6 Oktober 2026. Kod ini menambah fungsi setara pada projek sedia ada menggunakan komponen PDF sumber terbuka. Ia bukan kod sumber PDF24. Jenama, reka bentuk, akaun pengguna dan panel pentadbir dikekalkan.

## Tujuh pembaikan dalam kemas kini ini

| Permintaan | Perubahan dan cara guna |
| --- | --- |
| Potong PDF | PDF dipaparkan. Seret kawasan yang hendak dikekalkan, kemudian alih kotak atau tarik penjuru untuk melaras. Boleh pilih kawasan berlainan setiap halaman atau gunakan satu kawasan pada semua halaman. |
| Tandatangan | Muat naik PNG/JPG tandatangan sedia ada atau lukis. Letakkan pada halaman pilihan, kemudian pilih **Alih / ubah saiz** untuk seret dan besarkan/kecilkan. PNG dengan latar telus sesuai untuk tandatangan. |
| Tambah Gambar | Pilih PDF, muat naik gambar dalam editor dan letakkan terus pada halaman. Boleh tambah beberapa gambar, alih, ubah saiz, padam atau tukar halaman. Had setiap gambar 3 MB. |
| OCR | Semak bahasa OCR yang dipasang dan pulangkan ralat jelas jika tiada. Pilih bahasa, mod langkau teks/ulang OCR/paksa OCR dan julat halaman jika perlu. Output PDF biasa mengelakkan kerja penukaran PDF/A dan pengoptimuman gambar yang tidak diperlukan. |
| PDF kepada Teks / Bandingkan PDF | Teks mengekalkan baris, blok, lajur dan pemisah halaman, dengan pratonton serta Salin teks. Perbandingan menjadi laporan HTML sebelah menyebelah: teks dibuang merah, ditambah hijau, dan bahagian sama boleh dikembangkan. |
| Proses lama | Muat naik diikuti kerja latar dengan status serta masa berlalu. Bar kemajuan hanya menunjukkan kemajuan upload. Kerja berat dan ringan mempunyai slot berasingan; hasil tidak lagi menunggu log pangkalan data. |
| Isi Borang | Medan teks, kotak semak dan senarai pilihan muncul terus di atas halaman borang. Boleh isi medan, tambah teks/gambar, sunting atau padam teks asal, kemudian simpan sekali. PDF tanpa medan boleh menggunakan Tambah teks. |

Crop mengubah kawasan halaman yang dipaparkan; kandungan di luar kawasan masih boleh berada dalam fail. Gunakan **Sensor PDF** untuk membuang kandungan sulit.

Perbandingan ialah perubahan **teks**, bukan perbandingan piksel gambar. Muat turun laporan `.html` dan buka dalam pelayar. Susunan teks pada jadual atau reka letak yang sangat rumit masih perlu disemak.

OCR pada PDF imbasan sebenar dengan bahasa Inggeris lulus ujian. Imej Docker menyediakan bahasa Melayu, Indonesia dan Tamil; enjin bahasa ini perlu tersedia dalam deployment baharu. Kualiti hasil bergantung pada imbasan dan bahasa. Mesej kegagalan deployment lama belum tersedia untuk mengesahkan punca tunggalnya.

Kerja latar disimpan dalam memori pelayan. Jika pelayan dimulakan semula, jalankan semula kerja. OCR atau penukaran Office yang besar masih boleh mengambil masa; gunakan julat halaman lebih kecil apabila sesuai.

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

- **Edit PDF terus:** PDF dipaparkan dengan perkataan boleh diklik. Klik perkataan atau seluruh baris dan terus taip untuk menggantikan teks asal. Boleh padam teks asal, pilih saiz/font/warna/tebal/condong, tambah teks/gambar/lukisan/sorotan, cari perkataan pada halaman, zoom, Undo/Redo dan lompat halaman. Teks asal yang dipilih benar-benar dibuang daripada kandungan PDF hasil. Maksimum 1000 perubahan bagi satu simpanan.
- **Sensor PDF:** pilih kawasan pada pratonton. Pemprosesan membuang teks, grafik dan piksel imej dalam kawasan itu daripada PDF hasil, serta menulis dokumen baharu tanpa objek lama. Kandungan di luar kawasan kekal. Sensor ini tidak memadam salinan maklumat yang berada pada halaman lain atau salinan fail asal.
- **Tandatangan:** lukis tandatangan atau letak gambar melalui editor. Ini tandatangan visual, tanpa sijil digital.
- **PDF kepada Word:** menghasilkan teks yang boleh diedit; bukan susun atur Word yang sama tepat dengan PDF asal.
- **PDF kepada Excel:** jadual yang dikenal pasti diekstrak; jika tiada jadual, teks halaman dimasukkan ke helaian.
- **PDF kepada PowerPoint:** halaman menjadi slaid bergambar; teks tidak boleh diedit pada slaid. Nisbah halaman dikekalkan.
- **Banding PDF:** laporan HTML perubahan teks mengikut halaman, dipaparkan sebelah menyebelah. Bukan perbandingan visual gambar.
- **Gambar kepada PDF:** pilihan saiz asal/A4/Letter, orientasi dan margin.
- **Putar PDF:** pilihan semua halaman atau julat tertentu.
- **Tambah Gambar:** muat naik dan letak pada pratonton PDF; seret, ubah saiz dan pilih halaman.
- **PDF kepada JPG/PNG:** 72/150/300 DPI dan urutan halaman yang betul.
- **Isi Borang:** medan dikesan secara automatik dan diisi terus pada pratonton PDF. Boleh tambah/padam teks, kekalkan medan boleh diedit atau flatten.
- **Alat halaman:** padam, ekstrak, putar dan susun kini mempunyai kad pratonton. Klik halaman untuk memilih; gunakan anak panah atau seret untuk susun. Dokumen panjang dipaparkan 20 kad pada satu masa.
- **Pisah PDF:** pilihan terus untuk menjadikan setiap halaman satu PDF, atau masukkan kumpulan julat sendiri.
- **Invois:** tambah/buang baris item, kuantiti dan harga menggunakan medan biasa; jumlah RM dikira semasa mengisi.
- **Hasil:** pratonton PDF hasil sebelum muat turun, paparan saiz fail serta peratus perubahan bagi mampatan, dan butang Sambung edit/Ubah tetapan. Fail hasil dicache dalam pelayar selepas diterima supaya boleh dimuat turun tanpa memproses semula.
- **Upload:** format fail diterima dipaparkan, fail salah jenis ditolak, dan butang anak panah disediakan untuk menyusun fail.
- Arahan sistem tidak lagi menggunakan shell; kata laluan dihantar sebagai argumen literal. Penukaran LibreOffice menggunakan profil sementara berasingan.
- Laluan publish Netlify dibetulkan kepada `dist` apabila base ialah `frontend`.
- Skema pangkalan data turut dibekalkan dalam backend supaya migrasi tersedia dalam imej Docker.

## Cara guna editor baharu

1. Buka **Edit PDF** dan pilih PDF. Dokumen terus dipaparkan.
2. Dalam mod **Edit perkataan**, klik perkataan pada halaman dan terus taip teks baharu. Pilih **Seluruh baris** untuk menggantikan satu baris.
3. Panel di sebelah kanan (di bawah pada telefon) membolehkan anda ubah saiz huruf, warna, font, tebal/condong dan lebar kawasan. **Padam perkataan / baris** membuang teks asal.
4. Untuk kandungan baharu, pilih **Tambah teks**, **Gambar**, **Lukis**, **Sorotan** atau **Kotak** dan klik/seret pada halaman.
5. Gunakan **Undo/Redo**, senarai perubahan atau **Buang** jika mahu membatalkan perubahan. Sebelum menukar pilihan daripada perkataan kepada seluruh baris yang sama, buang perubahan perkataan itu untuk mengelakkan pertindihan.
6. Klik **Simpan PDF**. Semak pratonton hasil dan klik **Muat Turun PDF**. **Sambung edit** mengekalkan senarai perubahan pada dokumen asal.

### Had yang perlu diketahui

- Perkataan boleh disunting apabila PDF mengandungi teks yang dapat dikenal pasti. PDF imbasan/gambar perlu melalui **OCR** dahulu.
- Bagi teks OCR tersembunyi di atas gambar imbasan, gambar dalam kawasan perkataan dipadam dan diganti dengan latar putih. Semak dokumen yang mempunyai kertas berwarna/gambar di belakang teks.
- Font asal dipadankan kepada font standard yang hampir sama. Sesetengah aksara/font khas tidak disokong dan akan memulangkan ralat; bentuk huruf asal mungkin berubah.
- Suntingan ialah perkataan/baris pada kedudukan asal. Teks panjang dikecilkan untuk muat; boleh besarkan lebar kawasan atau pilih seluruh baris. Perenggan tidak mengalir semula seperti Word. Teks yang dilukis sebagai bentuk atau bersudut bebas tidak boleh dipilih dalam mod perkataan.
- Pratonton edit ialah anggaran. Pratonton **PDF hasil** selepas simpan menunjukkan dokumen sebenar, termasuk perubahan pada latar/putaran/font.
- PDF berkunci perlu dibuka kunci dahulu. Isi Borang menyokong medan AcroForm teks, kotak semak dan senarai pilihan; gunakan Tambah teks bagi PDF tanpa medan. Borang XFA tidak disokong.
- Muat turun hasil sebelum menutup atau memuat semula tab. Sejarah Undo/Redo hanya untuk sesi editor semasa; senarai perubahan dikekalkan apabila Sambung edit.

## Upload ke GitHub — langkah mudah

1. Simpan salinan folder projek lama sebagai sandaran.
2. Extract ZIP ini dan buka folder `semua-boleh-pdf-main`.
3. Salin **kandungan di dalam folder itu**: `backend`, `frontend`, `database` dan fail konfigurasi.
4. GitHub Desktop → pilih repo `semua-boleh-pdf` → Show in Explorer.
5. Paste kandungan tadi ke folder repo dan pilih Replace apabila diminta. Jangan salin keseluruhan folder luar sehingga menjadi folder bersarang.
6. GitHub Desktop → Summary: `Baiki crop, tandatangan, borang, OCR dan laporan PDF` → Commit to main → Push origin.
7. Deploy semula **backend Render** dan **frontend Netlify**. Jika kedua-duanya disambung ke GitHub dengan auto deploy, push akan memulakan deployment.

ZIP hanya mengandungi kod sumber. Jangan upload folder `node_modules` atau fail `.env` sebenar.

## Keperluan deployment

- Frontend: base `frontend`; build `npm run build`; publish `dist`; `VITE_API_URL` ialah URL backend.
- Backend: root `backend`; Docker; Python dipasang melalui `requirements.txt`. Dockerfile menetapkan `PYTHON_BIN`. Deploy semula Docker untuk memasang enjin OCR, termasuk Tamil. Frontend baharu memerlukan laluan API kerja latar daripada backend baharu.
- Kekalkan `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGINS` dan butiran pentadbir sedia ada.
- Jika deploy baharu, ikut `DEPLOYMENT.md`. Jangan reset pangkalan data untuk kemas kini ini.
- Uji satu fail contoh selepas deploy. Alat berat memerlukan RAM yang mencukupi.

## Pengesahan dalam persekitaran pembangunan

- Katalog frontend dan backend sepadan: 47 alat.
- 77 ujian backend lulus: operasi 37 alat, suntingan teks asal, perkataan bersebelahan/latar/gambar, baris berbilang font, putaran 90°/180°/270°, halaman crop, piksel teks OCR, borang automatik dan input tidak sah. Ujian baharu turut meliputi crop empat putaran, gambar tegak pada empat putaran, isi borang bersama suntingan teks, urutan dua lajur, laporan HTML dan OCR pada PDF imej sebenar.
- 14 ujian interaksi frontend dalam DOM lulus: klik/taip/padam, Undo/Redo, pilihan halaman, susunan, item invois, borang automatik, fail salah jenis dan sambung edit; termasuk seret crop, letak/alih tandatangan, isi pada PDF dan pratonton teks.
- 3 ujian klien API lulus: menunggu kerja selesai, mesej kegagalan dan berhenti meminta status apabila meninggalkan halaman.
- Empat aliran API terdahulu lulus: cipta invois, editor, sensor, cipta borang; termasuk muat turun hasil.
- API baharu turut lulus: kenal pasti perkataan → ganti teks → muat turun; kenal pasti medan → isi borang → muat turun; input tiada fail dan anotasi terlalu besar ditolak.
- API kerja latar lulus untuk crop, gambar visual melebihi 1 MB, isi borang dengan teks, TXT, laporan HTML dan kegagalan kerja. Respons pemprosesan terus tidak tersekat walaupun sambungan pangkalan data ujian sengaja tidak menjawab.
- Frontend berjaya dibina untuk produksi.
- Ujian DOM tidak menggantikan semakan pelayar sebenar. Ujian Chromium/paparan fizikal belum dijalankan kerana pelayar tidak tersedia; semak pada komputer/telefon selepas deploy.
- Penukaran Office→PDF, PDF/A dan fungsi qpdf perlu diuji selepas deploy Docker; binari LibreOffice/qpdf tidak tersedia dalam persekitaran ujian ini. OCR bahasa Inggeris diuji pada PDF imbasan imej tanpa teks asal; bahasa Melayu/Tamil belum diuji dalam persekitaran tempatan ini.
- Akaun/log masuk, pangkalan data sebenar dan deployment ke hos anda tidak diuji dalam sesi ini.

## Kebergantungan

Kod menggunakan pdf-lib, PDF.js, PyMuPDF, python-docx, openpyxl, python-pptx dan alat sistem yang disenaraikan dalam Dockerfile. Lesen komponen masing-masing kekal terpakai; PyMuPDF/MuPDF menggunakan AGPL atau lesen komersial. Rujukan: https://pymupdf.readthedocs.io/en/latest/about.html dan https://github.com/pymupdf/PyMuPDF.
