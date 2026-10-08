// Peta alat untuk backend: slug -> metadata pemprosesan.
// nama = nama paparan Bahasa Melayu (untuk rekod penggunaan).
export const ALAT = {
  "gabung-pdf":        { op: "gabung", nama: "Gabung PDF", multiple: true, min: 2 },
  "pisah-pdf":         { op: "pisah", nama: "Pisah PDF" },
  "padam-halaman":     { op: "padam-halaman", nama: "Padam Halaman PDF" },
  "ekstrak-halaman":   { op: "ekstrak-halaman", nama: "Ekstrak Halaman PDF" },
  "susun-halaman":     { op: "susun-halaman", nama: "Susun Halaman PDF" },
  "putar-pdf":         { op: "putar", nama: "Putar PDF" },
  "nombor-halaman":    { op: "nombor-halaman", nama: "Tambah Nombor Halaman" },
  "tera-air":          { op: "tera-air", nama: "Tambah Tera Air" },
  "potong-pdf":        { op: "potong", nama: "Potong PDF" },

  "mampat-pdf":        { op: "mampat", nama: "Mampat PDF" },
  "baiki-pdf":         { op: "baiki", nama: "Baiki PDF" },
  "optimize-pdf":      { op: "optimize", nama: "Optimakan PDF" },

  "word-ke-pdf":       { op: "office-ke-pdf", nama: "Word kepada PDF" },
  "excel-ke-pdf":      { op: "office-ke-pdf", nama: "Excel kepada PDF" },
  "powerpoint-ke-pdf": { op: "office-ke-pdf", nama: "PowerPoint kepada PDF" },
  "jpg-ke-pdf":        { op: "imej-ke-pdf", nama: "JPG kepada PDF", multiple: true, min: 1 },
  "png-ke-pdf":        { op: "imej-ke-pdf", nama: "PNG kepada PDF", multiple: true, min: 1 },
  "html-ke-pdf":       { op: "html-ke-pdf", nama: "HTML kepada PDF" },

  "pdf-ke-word":       { op: "pdf-ke-office", nama: "PDF kepada Word" },
  "pdf-ke-excel":      { op: "pdf-ke-excel", nama: "PDF kepada Excel" },
  "pdf-ke-powerpoint": { op: "pdf-ke-pptx", nama: "PDF kepada PowerPoint" },
  "pdf-ke-jpg":        { op: "pdf-ke-imej", nama: "PDF kepada JPG", format: "jpg" },
  "pdf-ke-png":        { op: "pdf-ke-imej", nama: "PDF kepada PNG", format: "png" },
  "pdf-ke-teks":       { op: "pdf-ke-teks", nama: "PDF kepada Teks" },

  "lindungi-pdf":      { op: "lindungi", nama: "Lindungi PDF" },
  "buka-kunci-pdf":    { op: "buka-kunci", nama: "Buka Kunci PDF" },
  "padam-kata-laluan": { op: "buka-kunci", nama: "Padam Kata Laluan PDF" },
  "tandatangan-pdf":   { op: "edit", nama: "Tandatangan PDF" },
  "sensor-pdf":        { op: "sensor", nama: "Sensor PDF" },

  "imbas-ke-pdf":      { op: "imej-ke-pdf", nama: "Imbas kepada PDF", multiple: true, min: 1 },
  "ocr-pdf":           { op: "ocr", nama: "OCR PDF" },
  "banding-pdf":       { op: "banding", nama: "Bandingkan PDF", multiple: true, min: 2, max: 2 },
  "tambah-teks-pdf":   { op: "tambah-teks", nama: "Tambah Teks ke PDF" },
  "tambah-gambar-pdf": { op: "tambah-gambar", nama: "Tambah Gambar ke PDF", multiple: true, min: 2, max: 2 },
  "edit-pdf":          { op: "edit", nama: "Edit PDF" },
  "isi-borang-pdf":    { op: "isi-borang", nama: "Isi Borang PDF" },
  "pdf-a":             { op: "pdf-a", nama: "Tukar kepada PDF/A" },
};

Object.assign(ALAT, {
  "ekstrak-gambar-pdf": {
    "op": "ekstrak-gambar",
    "nama": "Ekstrak Gambar PDF"
  },
  "overlay-pdf": {
    "op": "overlay",
    "nama": "Tindih PDF",
    "min": 2,
    "max": 2,
    "multiple": true
  },
  "halaman-per-helaian": {
    "op": "nup",
    "nama": "Halaman per Helaian"
  },
  "saiz-halaman-pdf": {
    "op": "saiz-halaman",
    "nama": "Tukar Saiz Halaman"
  },
  "edit-metadata-pdf": {
    "op": "edit-metadata",
    "nama": "Edit Metadata PDF"
  },
  "buang-metadata-pdf": {
    "op": "buang-metadata",
    "nama": "Buang Metadata PDF"
  },
  "flatten-pdf": {
    "op": "flatten",
    "nama": "Flatten PDF"
  },
  "cipta-borang-pdf": {
    "op": "cipta-borang",
    "nama": "Cipta Borang PDF",
    "min": 0,
    "max": 1
  },
  "cipta-invois": {
    "op": "invois",
    "nama": "Cipta Invois",
    "min": 0,
    "max": 0
  },
  "permohonan-kerja-pdf": {
    "op": "permohonan-kerja",
    "nama": "Permohonan Kerja PDF",
    "min": 0,
    "max": 0
  }
});

Object.assign(ALAT["tambah-gambar-pdf"], {min:1,max:2});

Object.assign(ALAT, {
 'aliran-kerja':{op:'workflow',nama:'Aliran Kerja PDF'},
 'urus-halaman':{op:'urus-halaman',nama:'Urus Halaman PDF',multiple:true,min:1,max:30},
 'proses-kelompok':{op:'batch',nama:'Proses Banyak Fail',multiple:true,min:1,max:30},
 'scan-kamera':{op:'scan-kamera',nama:'Scan Kamera ke PDF',multiple:true,min:1,max:30},
 'cari-ganti':{op:'cari-ganti',nama:'Cari dan Ganti Teks'},
 'tandatangan-telus':{op:'tandatangan-telus',nama:'Buang Latar Tandatangan'},
 'mampat-sasaran':{op:'mampat-sasaran',nama:'Mampat Ikut Saiz'},
 'automasi-dokumen':{op:'automasi',nama:'Automasi Dokumen',multiple:true,min:1,max:30},
 'ai-pdf':{op:'ai-pdf',nama:'AI untuk PDF'}
});
