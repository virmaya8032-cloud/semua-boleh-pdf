// Katalog tunggal semua alat PDF.
// Memacu: grid halaman utama, halaman setiap alat, dan pemetaan ke API backend.

export const CATEGORIES = [
  { id: "urus", nama: "Pengurusan PDF" },
  { id: "mampat", nama: "Mampatan & Pembaikan" },
  { id: "ke-pdf", nama: "Tukar kepada PDF" },
  { id: "dari-pdf", nama: "Tukar daripada PDF" },
  { id: "selamat", nama: "Keselamatan PDF" },
  { id: "tambahan", nama: "Fungsi Tambahan" },
];

// options: senarai medan yang ditunjuk pada halaman alat.
// Jenis: text, password, number, select, range, checkbox.
export const TOOLS = [
  // ---------- Pengurusan PDF ----------
  {
    slug: "gabung-pdf", nama: "Gabung PDF", kategori: "urus", icon: "Combine",
    warna: "#e12128",
    ringkas: "Satukan beberapa fail PDF menjadi satu dokumen.",
    penuh: "Satukan beberapa fail PDF menjadi satu dokumen dengan susunan pilihan anda.",
    accept: ".pdf", multiple: true, op: "gabung",
  },
  {
    slug: "pisah-pdf", nama: "Pisah PDF", kategori: "urus", icon: "Scissors",
    warna: "#e12128",
    ringkas: "Pisahkan satu PDF kepada beberapa fail.",
    penuh: "Pisahkan dokumen PDF mengikut julat halaman menjadi fail berasingan.",
    accept: ".pdf", multiple: false, op: "pisah",
    options: [{ key: "julat", jenis: "text", label: "Julat halaman (cth: 1-3, 5, 8-10)", placeholder: "1-3, 5" }],
  },
  {
    slug: "padam-halaman", nama: "Padam Halaman PDF", kategori: "urus", icon: "FileMinus",
    warna: "#e12128",
    ringkas: "Buang halaman yang tidak dikehendaki.",
    penuh: "Buang halaman tertentu daripada dokumen PDF anda.",
    accept: ".pdf", multiple: false, op: "padam-halaman",
    options: [{ key: "halaman", jenis: "text", label: "Halaman untuk dipadam (cth: 2, 4-6)", placeholder: "2, 4-6" }],
  },
  {
    slug: "ekstrak-halaman", nama: "Ekstrak Halaman PDF", kategori: "urus", icon: "FileOutput",
    warna: "#e12128",
    ringkas: "Ambil halaman tertentu sebagai PDF baharu.",
    penuh: "Ekstrak halaman yang dipilih menjadi satu dokumen PDF baharu.",
    accept: ".pdf", multiple: false, op: "ekstrak-halaman",
    options: [{ key: "halaman", jenis: "text", label: "Halaman untuk diekstrak (cth: 1-3, 7)", placeholder: "1-3, 7" }],
  },
  {
    slug: "susun-halaman", nama: "Susun Halaman PDF", kategori: "urus", icon: "ArrowDownUp",
    warna: "#e12128",
    ringkas: "Susun semula urutan halaman.",
    penuh: "Tetapkan semula urutan halaman mengikut susunan yang anda mahu.",
    accept: ".pdf", multiple: false, op: "susun-halaman",
    options: [{ key: "susunan", jenis: "text", label: "Susunan baharu (cth: 3, 1, 2, 4)", placeholder: "3, 1, 2, 4" }],
  },
  {
    slug: "putar-pdf", nama: "Putar PDF", kategori: "urus", icon: "RotateCw",
    warna: "#e12128",
    ringkas: "Putarkan halaman 90, 180 atau 270 darjah.",
    penuh: "Putarkan semua halaman dokumen PDF mengikut sudut pilihan.",
    accept: ".pdf", multiple: false, op: "putar",
    options: [{ key: "sudut", jenis: "select", label: "Sudut putaran", pilihan: [
      { nilai: "90", teks: "90° ikut jam" },
      { nilai: "180", teks: "180°" },
      { nilai: "270", teks: "270° (90° lawan jam)" },
    ] }],
  },
  {
    slug: "nombor-halaman", nama: "Tambah Nombor Halaman", kategori: "urus", icon: "Hash",
    warna: "#e12128",
    ringkas: "Letakkan nombor pada setiap halaman.",
    penuh: "Tambah nombor halaman pada dokumen PDF di kedudukan pilihan anda.",
    accept: ".pdf", multiple: false, op: "nombor-halaman",
    options: [{ key: "kedudukan", jenis: "select", label: "Kedudukan", pilihan: [
      { nilai: "bawah-tengah", teks: "Bawah tengah" },
      { nilai: "bawah-kanan", teks: "Bawah kanan" },
      { nilai: "atas-tengah", teks: "Atas tengah" },
    ] }],
  },
  {
    slug: "tera-air", nama: "Tambah Tera Air", kategori: "urus", icon: "Stamp",
    warna: "#e12128",
    ringkas: "Letakkan teks tera air pada halaman.",
    penuh: "Tambah teks tera air (watermark) merentasi setiap halaman PDF.",
    accept: ".pdf", multiple: false, op: "tera-air",
    options: [{ key: "teks", jenis: "text", label: "Teks tera air", placeholder: "SULIT" }],
  },
  {
    slug: "potong-pdf", nama: "Potong PDF", kategori: "urus", icon: "Crop",
    warna: "#e12128",
    ringkas: "Potong margin halaman PDF.",
    penuh: "Potong (crop) margin setiap halaman mengikut peratus pilihan.",
    accept: ".pdf", multiple: false, op: "potong",
    options: [{ key: "margin", jenis: "number", label: "Peratus potongan setiap tepi (%)", placeholder: "5", min: 0, max: 45 }],
  },

  // ---------- Mampatan & Pembaikan ----------
  {
    slug: "mampat-pdf", nama: "Mampat PDF", kategori: "mampat", icon: "Minimize2",
    warna: "#16a34a",
    ringkas: "Kecilkan saiz fail PDF.",
    penuh: "Kurangkan saiz fail PDF sambil mengekalkan kualiti yang munasabah.",
    accept: ".pdf", multiple: false, op: "mampat",
    engine: "gs",
    options: [{ key: "tahap", jenis: "select", label: "Tahap mampatan", pilihan: [
      { nilai: "ringan", teks: "Ringan (kualiti tinggi)" },
      { nilai: "sederhana", teks: "Sederhana (disyorkan)" },
      { nilai: "kuat", teks: "Kuat (saiz terkecil)" },
    ] }],
  },
  {
    slug: "baiki-pdf", nama: "Baiki PDF", kategori: "mampat", icon: "Wrench",
    warna: "#16a34a",
    ringkas: "Cuba pulihkan PDF yang rosak.",
    penuh: "Cuba baiki struktur dokumen PDF yang rosak atau tidak sah.",
    accept: ".pdf", multiple: false, op: "baiki", engine: "qpdf",
  },
  {
    slug: "optimize-pdf", nama: "Optimakan PDF", kategori: "mampat", icon: "Gauge",
    warna: "#16a34a",
    ringkas: "Linearkan PDF untuk paparan web pantas.",
    penuh: "Optimakan (linearize) PDF supaya lebih pantas dibuka dalam pelayar.",
    accept: ".pdf", multiple: false, op: "optimize", engine: "qpdf",
  },

  // ---------- Tukar kepada PDF ----------
  {
    slug: "word-ke-pdf", nama: "Word kepada PDF", kategori: "ke-pdf", icon: "FileType",
    warna: "#2563eb",
    ringkas: "Tukar dokumen Word kepada PDF.",
    penuh: "Tukar fail .doc atau .docx kepada dokumen PDF.",
    accept: ".doc,.docx", multiple: false, op: "office-ke-pdf", engine: "libreoffice",
  },
  {
    slug: "excel-ke-pdf", nama: "Excel kepada PDF", kategori: "ke-pdf", icon: "FileSpreadsheet",
    warna: "#2563eb",
    ringkas: "Tukar hamparan Excel kepada PDF.",
    penuh: "Tukar fail .xls atau .xlsx kepada dokumen PDF.",
    accept: ".xls,.xlsx", multiple: false, op: "office-ke-pdf", engine: "libreoffice",
  },
  {
    slug: "powerpoint-ke-pdf", nama: "PowerPoint kepada PDF", kategori: "ke-pdf", icon: "Presentation",
    warna: "#2563eb",
    ringkas: "Tukar slaid PowerPoint kepada PDF.",
    penuh: "Tukar fail .ppt atau .pptx kepada dokumen PDF.",
    accept: ".ppt,.pptx", multiple: false, op: "office-ke-pdf", engine: "libreoffice",
  },
  {
    slug: "jpg-ke-pdf", nama: "JPG kepada PDF", kategori: "ke-pdf", icon: "Image",
    warna: "#2563eb",
    ringkas: "Gabung gambar JPG menjadi PDF.",
    penuh: "Tukar satu atau lebih gambar JPG menjadi satu dokumen PDF.",
    accept: ".jpg,.jpeg", multiple: true, op: "imej-ke-pdf",
  },
  {
    slug: "png-ke-pdf", nama: "PNG kepada PDF", kategori: "ke-pdf", icon: "Image",
    warna: "#2563eb",
    ringkas: "Gabung gambar PNG menjadi PDF.",
    penuh: "Tukar satu atau lebih gambar PNG menjadi satu dokumen PDF.",
    accept: ".png", multiple: true, op: "imej-ke-pdf",
  },
  {
    slug: "html-ke-pdf", nama: "HTML kepada PDF", kategori: "ke-pdf", icon: "Code2",
    warna: "#2563eb",
    ringkas: "Tukar fail HTML kepada PDF.",
    penuh: "Tukar fail .html kepada dokumen PDF.",
    accept: ".html,.htm", multiple: false, op: "html-ke-pdf", engine: "libreoffice",
  },

  // ---------- Tukar daripada PDF ----------
  {
    slug: "pdf-ke-word", nama: "PDF kepada Word", kategori: "dari-pdf", icon: "FileType",
    warna: "#7c3aed",
    ringkas: "Tukar PDF kepada dokumen Word.",
    penuh: "Tukar PDF kepada fail Word .docx yang boleh diedit.",
    accept: ".pdf", multiple: false, op: "pdf-ke-office", engine: "libreoffice",
    outExt: "docx",
  },
  {
    slug: "pdf-ke-excel", nama: "PDF kepada Excel", kategori: "dari-pdf", icon: "FileSpreadsheet",
    warna: "#7c3aed",
    ringkas: "Tukar jadual PDF kepada Excel.",
    penuh: "Ekstrak jadual daripada PDF ke fail Excel .xlsx.",
    accept: ".pdf", multiple: false, op: "pdf-ke-excel", engine: "libreoffice",
    outExt: "xlsx",
  },
  {
    slug: "pdf-ke-powerpoint", nama: "PDF kepada PowerPoint", kategori: "dari-pdf", icon: "Presentation",
    warna: "#7c3aed",
    ringkas: "Tukar PDF kepada slaid PowerPoint.",
    penuh: "Tukar setiap halaman PDF menjadi slaid PowerPoint .pptx.",
    accept: ".pdf", multiple: false, op: "pdf-ke-pptx", engine: "libreoffice",
    outExt: "pptx",
  },
  {
    slug: "pdf-ke-jpg", nama: "PDF kepada JPG", kategori: "dari-pdf", icon: "Image",
    warna: "#7c3aed",
    ringkas: "Tukar setiap halaman kepada JPG.",
    penuh: "Tukar setiap halaman PDF menjadi gambar JPG (dizipkan).",
    accept: ".pdf", multiple: false, op: "pdf-ke-imej", engine: "poppler",
    extra: { format: "jpg" }, outExt: "zip",
  },
  {
    slug: "pdf-ke-png", nama: "PDF kepada PNG", kategori: "dari-pdf", icon: "Image",
    warna: "#7c3aed",
    ringkas: "Tukar setiap halaman kepada PNG.",
    penuh: "Tukar setiap halaman PDF menjadi gambar PNG (dizipkan).",
    accept: ".pdf", multiple: false, op: "pdf-ke-imej", engine: "poppler",
    extra: { format: "png" }, outExt: "zip",
  },
  {
    slug: "pdf-ke-teks", nama: "PDF kepada Teks", kategori: "dari-pdf", icon: "FileText",
    warna: "#7c3aed",
    ringkas: "Ekstrak semua teks daripada PDF.",
    penuh: "Ekstrak kandungan teks daripada PDF ke fail .txt.",
    accept: ".pdf", multiple: false, op: "pdf-ke-teks", outExt: "txt",
  },

  // ---------- Keselamatan PDF ----------
  {
    slug: "lindungi-pdf", nama: "Lindungi PDF", kategori: "selamat", icon: "Lock",
    warna: "#d97706",
    ringkas: "Kunci PDF dengan kata laluan.",
    penuh: "Lindungi PDF dengan kata laluan supaya hanya orang yang tahu boleh membukanya.",
    accept: ".pdf", multiple: false, op: "lindungi", engine: "qpdf",
    options: [{ key: "kata_laluan", jenis: "password", label: "Kata laluan", placeholder: "Masukkan kata laluan" }],
  },
  {
    slug: "buka-kunci-pdf", nama: "Buka Kunci PDF", kategori: "selamat", icon: "LockOpen",
    warna: "#d97706",
    ringkas: "Buang kata laluan (jika anda tahu).",
    penuh: "Buka kunci PDF dengan memasukkan kata laluan semasa untuk membuang perlindungan.",
    accept: ".pdf", multiple: false, op: "buka-kunci", engine: "qpdf",
    options: [{ key: "kata_laluan", jenis: "password", label: "Kata laluan semasa", placeholder: "Kata laluan PDF" }],
  },
  {
    slug: "padam-kata-laluan", nama: "Padam Kata Laluan PDF", kategori: "selamat", icon: "KeyRound",
    warna: "#d97706",
    ringkas: "Tanggalkan kata laluan sepenuhnya.",
    penuh: "Tanggalkan perlindungan kata laluan daripada PDF (perlu kata laluan sedia ada).",
    accept: ".pdf", multiple: false, op: "buka-kunci", engine: "qpdf",
    options: [{ key: "kata_laluan", jenis: "password", label: "Kata laluan semasa", placeholder: "Kata laluan PDF" }],
  },
  {
    slug: "tandatangan-pdf", nama: "Tandatangan PDF", kategori: "selamat", icon: "PenLine",
    warna: "#d97706",
    ringkas: "Letak teks tandatangan pada PDF.",
    penuh: "Tambah teks tandatangan pada kedudukan halaman terakhir dokumen.",
    accept: ".pdf", multiple: false, op: "tandatangan",
    options: [{ key: "nama", jenis: "text", label: "Nama tandatangan", placeholder: "Nama penuh anda" }],
  },
  {
    slug: "sensor-pdf", nama: "Sensor PDF", kategori: "selamat", icon: "EyeOff",
    warna: "#d97706",
    ringkas: "Hitamkan kawasan sulit.",
    penuh: "Hitamkan (redaction) jalur teks pada halaman tertentu untuk melindungi maklumat sulit.",
    accept: ".pdf", multiple: false, op: "sensor",
    options: [
      { key: "halaman", jenis: "number", label: "Nombor halaman", placeholder: "1", min: 1 },
      { key: "y", jenis: "number", label: "Kedudukan menegak dari atas (%)", placeholder: "20", min: 0, max: 100 },
      { key: "tinggi", jenis: "number", label: "Ketinggian jalur (%)", placeholder: "5", min: 1, max: 100 },
    ],
  },

  // ---------- Fungsi Tambahan ----------
  {
    slug: "imbas-ke-pdf", nama: "Imbas kepada PDF", kategori: "tambahan", icon: "ScanLine",
    warna: "#0891b2",
    ringkas: "Gabung imej imbasan menjadi PDF.",
    penuh: "Satukan imej hasil imbasan (JPG/PNG) menjadi satu dokumen PDF.",
    accept: ".jpg,.jpeg,.png", multiple: true, op: "imej-ke-pdf",
  },
  {
    slug: "ocr-pdf", nama: "OCR PDF", kategori: "tambahan", icon: "TextSearch",
    warna: "#0891b2",
    ringkas: "Jadikan PDF imbasan boleh dicari.",
    penuh: "Kenal pasti teks dalam PDF imbasan supaya kandungan boleh dicari dan disalin.",
    accept: ".pdf", multiple: false, op: "ocr", engine: "tesseract",
    options: [{ key: "bahasa", jenis: "select", label: "Bahasa teks", pilihan: [
      { nilai: "msa", teks: "Bahasa Melayu" },
      { nilai: "eng", teks: "Bahasa Inggeris" },
      { nilai: "ind", teks: "Bahasa Indonesia" },
    ] }],
  },
  {
    slug: "banding-pdf", nama: "Bandingkan PDF", kategori: "tambahan", icon: "GitCompare",
    warna: "#0891b2",
    ringkas: "Lihat perbezaan teks dua PDF.",
    penuh: "Bandingkan kandungan teks dua dokumen PDF dan paparkan perbezaannya.",
    accept: ".pdf", multiple: true, minFiles: 2, maxFiles: 2, op: "banding", outExt: "txt",
  },
  {
    slug: "tambah-teks-pdf", nama: "Tambah Teks ke PDF", kategori: "tambahan", icon: "Type",
    warna: "#0891b2",
    ringkas: "Letak teks pada halaman.",
    penuh: "Tambah teks pada kedudukan tertentu dalam halaman PDF.",
    accept: ".pdf", multiple: false, op: "tambah-teks",
    options: [
      { key: "teks", jenis: "text", label: "Teks", placeholder: "Teks untuk ditambah" },
      { key: "halaman", jenis: "number", label: "Nombor halaman", placeholder: "1", min: 1 },
      { key: "x", jenis: "number", label: "Kedudukan mendatar dari kiri (%)", placeholder: "10", min: 0, max: 100 },
      { key: "y", jenis: "number", label: "Kedudukan menegak dari atas (%)", placeholder: "10", min: 0, max: 100 },
    ],
  },
  {
    slug: "tambah-gambar-pdf", nama: "Tambah Gambar ke PDF", kategori: "tambahan", icon: "ImagePlus",
    warna: "#0891b2",
    ringkas: "Letak gambar pada halaman pertama.",
    penuh: "Tambah gambar (JPG/PNG) pada halaman pertama dokumen PDF. Muat naik PDF diikuti gambar.",
    accept: ".pdf,.jpg,.jpeg,.png", multiple: true, minFiles: 2, maxFiles: 2, op: "tambah-gambar",
  },
  {
    slug: "edit-pdf", nama: "Edit PDF", kategori: "tambahan", icon: "PenSquare",
    warna: "#0891b2",
    ringkas: "Tambah teks & anotasi ringkas.",
    penuh: "Edit ringkas: tambah teks pada halaman PDF (sama seperti Tambah Teks).",
    accept: ".pdf", multiple: false, op: "tambah-teks",
    options: [
      { key: "teks", jenis: "text", label: "Teks anotasi", placeholder: "Teks" },
      { key: "saiz", jenis: "number", label: "Saiz teks (pt)", placeholder: "14", min: 6, max: 72 },
      { key: "halaman", jenis: "number", label: "Nombor halaman", placeholder: "1", min: 1 },
      { key: "x", jenis: "number", label: "Kedudukan mendatar (%)", placeholder: "10", min: 0, max: 100 },
      { key: "y", jenis: "number", label: "Kedudukan menegak (%)", placeholder: "10", min: 0, max: 100 },
    ],
  },
  {
    slug: "isi-borang-pdf", nama: "Isi Borang PDF", kategori: "tambahan", icon: "FormInput",
    warna: "#0891b2",
    ringkas: "Isi medan borang PDF secara automatik.",
    penuh: "Isi medan borang (AcroForm) menggunakan pasangan medan=nilai.",
    accept: ".pdf", multiple: false, op: "isi-borang",
    options: [{ key: "data", jenis: "text", label: "Data borang (cth: nama=Ali; umur=30)", placeholder: "nama=Ali; umur=30" }],
  },
  {
    slug: "pdf-a", nama: "Tukar kepada PDF/A", kategori: "tambahan", icon: "Archive",
    warna: "#0891b2",
    ringkas: "Format arkib jangka panjang.",
    penuh: "Tukar PDF kepada format PDF/A untuk pengarkiban jangka panjang.",
    accept: ".pdf", multiple: false, op: "pdf-a", engine: "libreoffice",
  },
];

TOOLS.push(...[
  {
    "slug": "ekstrak-gambar-pdf",
    "nama": "Ekstrak Gambar PDF",
    "op": "ekstrak-gambar",
    "ringkas": "Ambil gambar terbenam sebagai PNG dalam ZIP.",
    "penuh": "Ambil gambar terbenam sebagai PNG dalam ZIP.",
    "kategori": "tambahan",
    "icon": "FileText",
    "warna": "#0891b2",
    "accept": ".pdf",
    "multiple": false,
    "options": [],
    "outExt": "zip"
  },
  {
    "slug": "overlay-pdf",
    "nama": "Tindih PDF",
    "op": "overlay",
    "ringkas": "Letak kandungan PDF kedua di atas PDF pertama. Kawasan putih dalam PDF kedua boleh menutup kandungan di bawah.",
    "penuh": "Letak kandungan PDF kedua di atas PDF pertama. Kawasan putih dalam PDF kedua boleh menutup kandungan di bawah.",
    "kategori": "tambahan",
    "icon": "Combine",
    "warna": "#0891b2",
    "accept": ".pdf",
    "multiple": true,
    "options": [
      {
        "key": "mod",
        "label": "Padanan halaman",
        "jenis": "select",
        "pilihan": [
          {
            "nilai": "ulang",
            "teks": "Ulang halaman PDF kedua"
          },
          {
            "nilai": "sepadan",
            "teks": "Bilangan halaman mesti sama"
          }
        ]
      }
    ],
    "minFiles": 2,
    "maxFiles": 2
  },
  {
    "slug": "halaman-per-helaian",
    "nama": "Halaman per Helaian",
    "op": "nup",
    "ringkas": "Susun 2, 4, 6, 9 atau 16 halaman pada satu helaian.",
    "penuh": "Susun 2, 4, 6, 9 atau 16 halaman pada satu helaian.",
    "kategori": "tambahan",
    "icon": "FileSpreadsheet",
    "warna": "#0891b2",
    "accept": ".pdf",
    "multiple": false,
    "options": [
      {
        "key": "bilangan",
        "label": "Halaman setiap helaian",
        "jenis": "select",
        "pilihan": [
          {
            "nilai": "2",
            "teks": "2"
          },
          {
            "nilai": "4",
            "teks": "4"
          },
          {
            "nilai": "6",
            "teks": "6"
          },
          {
            "nilai": "9",
            "teks": "9"
          },
          {
            "nilai": "16",
            "teks": "16"
          }
        ]
      },
      {
        "key": "saiz_kertas",
        "label": "Saiz kertas",
        "jenis": "select",
        "pilihan": [
          {
            "nilai": "a4",
            "teks": "A4"
          },
          {
            "nilai": "a3",
            "teks": "A3"
          },
          {
            "nilai": "a5",
            "teks": "A5"
          },
          {
            "nilai": "letter",
            "teks": "Letter"
          },
          {
            "nilai": "legal",
            "teks": "Legal"
          }
        ]
      },
      {
        "key": "orientasi",
        "label": "Orientasi",
        "jenis": "select",
        "pilihan": [
          {
            "nilai": "potret",
            "teks": "Potret"
          },
          {
            "nilai": "landskap",
            "teks": "Landskap"
          }
        ]
      },
      {
        "key": "margin_pt",
        "label": "Margin helaian (pt)",
        "jenis": "number",
        "default": 12,
        "min": 0,
        "max": 100
      }
    ]
  },
  {
    "slug": "saiz-halaman-pdf",
    "nama": "Tukar Saiz Halaman",
    "op": "saiz-halaman",
    "ringkas": "Muatkan kandungan PDF pada saiz kertas baharu tanpa memotongnya.",
    "penuh": "Muatkan kandungan PDF pada saiz kertas baharu tanpa memotongnya.",
    "kategori": "tambahan",
    "icon": "Crop",
    "warna": "#0891b2",
    "accept": ".pdf",
    "multiple": false,
    "options": [
      {
        "key": "saiz_kertas",
        "label": "Saiz kertas",
        "jenis": "select",
        "pilihan": [
          {
            "nilai": "a4",
            "teks": "A4"
          },
          {
            "nilai": "a3",
            "teks": "A3"
          },
          {
            "nilai": "a5",
            "teks": "A5"
          },
          {
            "nilai": "letter",
            "teks": "Letter"
          },
          {
            "nilai": "legal",
            "teks": "Legal"
          }
        ]
      },
      {
        "key": "orientasi",
        "label": "Orientasi",
        "jenis": "select",
        "pilihan": [
          {
            "nilai": "potret",
            "teks": "Potret"
          },
          {
            "nilai": "landskap",
            "teks": "Landskap"
          }
        ]
      },
      {
        "key": "margin_pt",
        "label": "Margin (pt)",
        "jenis": "number",
        "default": 12,
        "min": 0,
        "max": 100
      }
    ]
  },
  {
    "slug": "edit-metadata-pdf",
    "nama": "Edit Metadata PDF",
    "op": "edit-metadata",
    "ringkas": "Tetapkan tajuk, pengarang, subjek dan kata kunci PDF.",
    "penuh": "Tetapkan tajuk, pengarang, subjek dan kata kunci PDF.",
    "kategori": "tambahan",
    "icon": "FileText",
    "warna": "#0891b2",
    "accept": ".pdf",
    "multiple": false,
    "options": [
      {
        "key": "title",
        "label": "Tajuk",
        "jenis": "text",
        "default": "",
        "required": false
      },
      {
        "key": "author",
        "label": "Pengarang",
        "jenis": "text",
        "default": "",
        "required": false
      },
      {
        "key": "subject",
        "label": "Subjek",
        "jenis": "text",
        "default": "",
        "required": false
      },
      {
        "key": "keywords",
        "label": "Kata kunci",
        "jenis": "text",
        "default": "",
        "required": false
      }
    ]
  },
  {
    "slug": "buang-metadata-pdf",
    "nama": "Buang Metadata PDF",
    "op": "buang-metadata",
    "ringkas": "Buang metadata dokumen dan metadata XMP. Kandungan yang kelihatan pada halaman kekal.",
    "penuh": "Buang metadata dokumen dan metadata XMP. Kandungan yang kelihatan pada halaman kekal.",
    "kategori": "tambahan",
    "icon": "FileText",
    "warna": "#0891b2",
    "accept": ".pdf",
    "multiple": false,
    "options": []
  },
  {
    "slug": "flatten-pdf",
    "nama": "Flatten PDF",
    "op": "flatten",
    "ringkas": "Jadikan borang dan anotasi sebagai kandungan halaman tetap.",
    "penuh": "Jadikan borang dan anotasi sebagai kandungan halaman tetap.",
    "kategori": "tambahan",
    "icon": "FormInput",
    "warna": "#0891b2",
    "accept": ".pdf",
    "multiple": false,
    "options": []
  },
  {
    "slug": "cipta-borang-pdf",
    "nama": "Cipta Borang PDF",
    "op": "cipta-borang",
    "ringkas": "Tambah medan teks atau kotak semak pada PDF. Boleh mula dengan halaman A4 kosong.",
    "penuh": "Tambah medan teks atau kotak semak pada PDF. Boleh mula dengan halaman A4 kosong.",
    "kategori": "tambahan",
    "icon": "FormInput",
    "warna": "#0891b2",
    "accept": ".pdf",
    "multiple": false,
    "options": [],
    "minFiles": 0,
    "maxFiles": 1,
    "editor": "form"
  },
  {
    "slug": "cipta-invois",
    "nama": "Cipta Invois",
    "op": "invois",
    "ringkas": "Cipta invois PDF dengan jumlah item dikira secara automatik.",
    "penuh": "Cipta invois PDF dengan jumlah item dikira secara automatik.",
    "kategori": "tambahan",
    "icon": "FileSpreadsheet",
    "warna": "#0891b2",
    "accept": ".pdf",
    "multiple": false,
    "options": [
      {
        "key": "penjual",
        "label": "Nama / alamat penjual",
        "jenis": "text",
        "default": "",
        "required": true
      },
      {
        "key": "pelanggan",
        "label": "Nama / alamat pelanggan",
        "jenis": "text",
        "default": "",
        "required": true
      },
      {
        "key": "nombor",
        "label": "Nombor invois",
        "jenis": "text",
        "default": "INV-001",
        "required": false
      },
      {
        "key": "tarikh",
        "label": "Tarikh",
        "jenis": "text",
        "default": "",
        "required": false
      },
      {
        "key": "item",
        "label": "Item: Perkara | Kuantiti | Harga seunit (satu item setiap baris)",
        "jenis": "textarea",
        "default": "Perkhidmatan | 1 | 100.00",
        "required": true
      },
      {
        "key": "nota",
        "label": "Nota / maklumat bayaran",
        "jenis": "textarea",
        "default": "",
        "required": false
      }
    ],
    "minFiles": 0,
    "maxFiles": 0,
    "noFile": true
  },
  {
    "slug": "permohonan-kerja-pdf",
    "nama": "Permohonan Kerja PDF",
    "op": "permohonan-kerja",
    "ringkas": "Cipta surat permohonan kerja dalam PDF daripada butiran anda.",
    "penuh": "Cipta surat permohonan kerja dalam PDF daripada butiran anda.",
    "kategori": "tambahan",
    "icon": "FileText",
    "warna": "#0891b2",
    "accept": ".pdf",
    "multiple": false,
    "options": [
      {
        "key": "nama",
        "label": "Nama penuh",
        "jenis": "text",
        "default": "",
        "required": true
      },
      {
        "key": "jawatan",
        "label": "Jawatan dipohon",
        "jenis": "text",
        "default": "",
        "required": true
      },
      {
        "key": "syarikat",
        "label": "Syarikat / penerima",
        "jenis": "text",
        "default": "",
        "required": true
      },
      {
        "key": "alamat",
        "label": "Alamat",
        "jenis": "textarea",
        "default": "",
        "required": false
      },
      {
        "key": "emel",
        "label": "E-mel",
        "jenis": "text",
        "default": "",
        "required": false
      },
      {
        "key": "telefon",
        "label": "Telefon",
        "jenis": "text",
        "default": "",
        "required": false
      },
      {
        "key": "tarikh",
        "label": "Tarikh",
        "jenis": "text",
        "default": "",
        "required": false
      },
      {
        "key": "surat",
        "label": "Isi surat",
        "jenis": "textarea",
        "default": "Tuan/Puan,\n\nSaya ingin memohon jawatan yang ditawarkan. Saya mempunyai pengalaman dan kemahiran yang berkaitan.\n\nSaya berharap diberi peluang untuk menghadiri temu duga. Terima kasih.",
        "required": true
      }
    ],
    "minFiles": 0,
    "maxFiles": 0,
    "noFile": true
  }
]);

export const toolBySlug = (slug) => TOOLS.find((t) => t.slug === slug);
export const toolsByCategory = (id) => TOOLS.filter((t) => t.kategori === id);

// Pilihan tambahan bagi alat sedia ada.
const editTool = toolBySlug("edit-pdf");
Object.assign(editTool, { op: "edit", editor: "edit", options: [], penuh: "Letak teks, gambar, lukisan, kotak dan sorotan pada pratonton PDF. Kandungan asal tidak disunting seperti dokumen Word." });
const redactTool = toolBySlug("sensor-pdf");
Object.assign(redactTool, { editor: "redact", penuh: "Pilih kawasan sulit pada pratonton. Teks, grafik dan piksel gambar dalam kawasan itu dibuang daripada fail hasil." });
redactTool.options = [];
const formTool = toolBySlug("isi-borang-pdf");
formTool.options.push({ key: "flatten", jenis: "select", label: "Selepas diisi", pilihan: [{ nilai: "ya", teks: "Jadikan kandungan tetap" }, { nilai: "tidak", teks: "Kekalkan medan boleh diedit" }] });
for (const slug of ["jpg-ke-pdf", "png-ke-pdf", "imbas-ke-pdf"]) {
  toolBySlug(slug).options = [
    { key: "saiz_kertas", jenis: "select", label: "Saiz halaman", pilihan: [{ nilai: "asal", teks: "Saiz gambar asal" }, { nilai: "a4", teks: "A4" }, { nilai: "letter", teks: "Letter" }] },
    { key: "orientasi", jenis: "select", label: "Orientasi", pilihan: [{ nilai: "potret", teks: "Potret" }, { nilai: "landskap", teks: "Landskap" }] },
    { key: "margin", jenis: "number", label: "Margin (pt)", default: 20, min: 0, max: 100 }
  ];
}
toolBySlug("putar-pdf").options.push({ key: "halaman", jenis: "text", label: "Halaman untuk diputar (kosong = semua)", placeholder: "1-3,5" });
toolBySlug("tambah-gambar-pdf").options = [
  { key: "halaman", jenis: "number", label: "Nombor halaman", default: 1, min: 1 },
  { key: "x", jenis: "number", label: "Dari kiri (%)", default: 10, min: 0, max: 100 },
  { key: "y", jenis: "number", label: "Dari atas (%)", default: 10, min: 0, max: 100 },
  { key: "lebar", jenis: "number", label: "Lebar gambar (%)", default: 40, min: 1, max: 100 }
];
toolBySlug("tambah-gambar-pdf").penuh = "Letak satu gambar JPG/PNG pada halaman dan kedudukan pilihan anda.";
for (const slug of ["pdf-ke-jpg", "pdf-ke-png"]) {
  toolBySlug(slug).options = [{ key: "dpi", jenis: "select", label: "Resolusi", pilihan: [{ nilai: "150", teks: "150 DPI" }, { nilai: "72", teks: "72 DPI" }, { nilai: "300", teks: "300 DPI" }] }];
}
toolBySlug("pdf-ke-word").penuh = "Tukar teks PDF kepada Word yang boleh diedit. Susun atur asal mungkin berubah; PDF imbasan perlu OCR dahulu.";
toolBySlug("pdf-ke-excel").penuh = "Ekstrak jadual yang dapat dikenal pasti ke Excel. Jika tiada jadual, hasil mengandungi teks mengikut halaman. PDF imbasan perlu OCR dahulu.";
toolBySlug("pdf-ke-powerpoint").penuh = "Tukar setiap halaman PDF kepada slaid bergambar. Rupa halaman dikekalkan; teks pada slaid tidak boleh diedit.";

Object.assign(toolBySlug("tandatangan-pdf"), { op: "edit", editor: "edit", options: [], penuh: "Lukis tandatangan atau letak gambar tandatangan pada halaman pilihan. Ini tandatangan visual, tanpa sijil digital." });

for (const tool of TOOLS) {
  for (const option of tool.options || []) {
    if (option.default === undefined && option.jenis === "number" && /^\d+$/.test(option.placeholder || "")) option.default = Number(option.placeholder);
  }
}
