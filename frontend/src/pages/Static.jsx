import { useState, useEffect } from "react";
import { ShieldCheck, Lock, Trash2, Server, Mail, MessageSquare, ChevronDown } from "lucide-react";
import { useToast } from "../components/Toast.jsx";
import { api } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";

function Shell({ tajuk, sari, children }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="font-papar text-3xl font-extrabold">{tajuk}</h1>
      {sari && <p className="mt-2 text-gray-500">{sari}</p>}
      <div className="prose-sbp mt-8 space-y-4 text-gray-700">{children}</div>
    </div>
  );
}

function Perenggan({ h, children }) {
  return (
    <section>
      {h && <h2 className="font-papar text-lg font-bold text-arang">{h}</h2>}
      <p className="mt-1 leading-relaxed">{children}</p>
    </section>
  );
}

export function About() {
  return (
    <Shell tajuk="Mengenai Kami" sari="Alat PDF percuma, dibina untuk pengguna Bahasa Melayu.">
      <Perenggan>
        Semua Boleh PDF ialah platform alat PDF dalam talian yang menyediakan lebih 30 alat percuma
        untuk menguruskan dokumen PDF anda. Matlamat kami mudah: menjadikan tugasan PDF harian
        mudah, pantas dan boleh diakses oleh semua orang dalam Bahasa Melayu.
      </Perenggan>
      <Perenggan h="Misi kami">
        Kami percaya alat digital yang berkualiti tidak sepatutnya rumit atau mahal. Setiap alat di
        sini boleh digunakan tanpa bayaran, tanpa pemasangan perisian, dan terus daripada pelayar
        anda.
      </Perenggan>
      <Perenggan h="Privasi dahulu">
        Fail yang anda muat naik diproses di pelayan kami dan dipadam secara automatik dalam masa
        beberapa minit. Kami tidak menyimpan kandungan dokumen anda.
      </Perenggan>
    </Shell>
  );
}

export function Security() {
  const item = [
    { Icon: Lock, t: "Sambungan disulitkan", d: "Semua pemindahan fail dilindungi melalui HTTPS/TLS." },
    { Icon: Trash2, t: "Pemadaman automatik", d: "Fail input dan output dipadam sejurus selepas diproses atau dimuat turun." },
    { Icon: Server, t: "Pemprosesan pelayan", d: "Pemprosesan dijalankan pada pelayan terkawal, bukan dikongsi dengan pihak ketiga." },
    { Icon: ShieldCheck, t: "Tiada penyimpanan kandungan", d: "Kami hanya menyimpan metadata penggunaan (jenis alat & saiz), bukan kandungan fail." },
  ];
  return (
    <Shell tajuk="Keselamatan" sari="Bagaimana kami melindungi fail dan data anda.">
      <div className="grid gap-4 sm:grid-cols-2">
        {item.map((x) => (
          <div key={x.t} className="kad p-5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-red-50 text-merah">
              <x.Icon size={20} />
            </span>
            <p className="mt-3 font-papar font-bold text-arang">{x.t}</p>
            <p className="mt-1 text-sm text-gray-500">{x.d}</p>
          </div>
        ))}
      </div>
    </Shell>
  );
}

export function Privacy() {
  return (
    <Shell tajuk="Polisi Privasi" sari="Dikemas kini pada 2026.">
      <Perenggan h="Maklumat yang kami kumpul">
        Apabila anda mendaftar, kami menyimpan nama dan alamat e-mel anda. Apabila anda menggunakan
        alat, kami merekodkan metadata seperti jenis alat, saiz fail dan masa — tetapi bukan
        kandungan fail anda.
      </Perenggan>
      <Perenggan h="Fail anda">
        Fail yang dimuat naik diproses buat sementara dan dipadam secara automatik dalam masa
        beberapa minit. Kami tidak membaca, berkongsi atau menjual kandungan dokumen anda.
      </Perenggan>
      <Perenggan h="Kuki">
        Kami menggunakan storan tempatan untuk menyimpan token log masuk anda supaya anda kekal log
        masuk. Kami tidak menggunakan kuki penjejakan pihak ketiga.
      </Perenggan>
      <Perenggan h="Hak anda">
        Anda boleh memadam sejarah penggunaan anda pada bila-bila masa melalui papan pemuka, atau
        meminta pemadaman akaun dengan menghubungi kami.
      </Perenggan>
    </Shell>
  );
}

export function Terms() {
  return (
    <Shell tajuk="Terma Penggunaan" sari="Sila baca sebelum menggunakan perkhidmatan kami.">
      <Perenggan h="Penerimaan terma">
        Dengan menggunakan Semua Boleh PDF, anda bersetuju untuk mematuhi terma ini. Jika anda tidak
        bersetuju, sila jangan gunakan perkhidmatan ini.
      </Perenggan>
      <Perenggan h="Penggunaan yang dibenarkan">
        Anda bersetuju untuk hanya memproses fail yang anda miliki atau mempunyai kebenaran untuk
        memproses. Anda tidak boleh menggunakan perkhidmatan ini untuk aktiviti menyalahi undang-undang.
      </Perenggan>
      <Perenggan h="Ketersediaan perkhidmatan">
        Perkhidmatan disediakan “sebagaimana adanya”. Kami berusaha memastikan ketersediaan tetapi
        tidak menjamin perkhidmatan bebas gangguan.
      </Perenggan>
      <Perenggan h="Had liabiliti">
        Kami tidak bertanggungjawab atas sebarang kehilangan data. Sila simpan salinan asal dokumen
        penting anda.
      </Perenggan>
    </Shell>
  );
}

const soalan = [
  { s: "Adakah perkhidmatan ini percuma?", j: "Ya, semua alat di Semua Boleh PDF adalah percuma untuk digunakan." },
  { s: "Adakah fail saya selamat?", j: "Ya. Fail anda diproses melalui sambungan disulitkan dan dipadam secara automatik selepas diproses." },
  { s: "Perlukah saya mendaftar?", j: "Tidak wajib untuk kebanyakan alat, tetapi mendaftar membolehkan anda menyimpan sejarah penggunaan." },
  { s: "Apakah saiz fail maksimum?", j: "Saiz maksimum lalai ialah 50 MB setiap fail." },
  { s: "Format apakah yang disokong?", j: "Kami menyokong PDF, Word, Excel, PowerPoint, JPG, PNG, HTML dan banyak lagi bergantung pada alat." },
  { s: "Bolehkah saya guna di telefon?", j: "Ya, laman web kami berfungsi pada telefon, tablet dan komputer." },
];

export function FAQ() {
  const [buka, setBuka] = useState(0);
  return (
    <Shell tajuk="Soalan Lazim" sari="Jawapan kepada soalan yang kerap ditanya.">
      <div className="space-y-3">
        {soalan.map((x, i) => (
          <div key={i} className="kad overflow-hidden">
            <button
              onClick={() => setBuka(buka === i ? -1 : i)}
              className="flex w-full items-center justify-between px-5 py-4 text-left font-semibold text-arang"
            >
              {x.s}
              <ChevronDown size={18} className={`transition ${buka === i ? "rotate-180" : ""}`} />
            </button>
            {buka === i && <p className="px-5 pb-4 text-sm text-gray-600">{x.j}</p>}
          </div>
        ))}
      </div>
    </Shell>
  );
}

export function Contact() {
  const toast = useToast();
  const { pengguna } = useAuth();
  const [nama, setNama] = useState("");
  const [emel, setEmel] = useState("");
  const [mesej, setMesej] = useState("");
  const [hantar, setHantar] = useState(false);

  // Auto-isi nama & e-mel jika pengguna sudah log masuk.
  useEffect(() => {
    if (pengguna) {
      setNama((n) => n || pengguna.nama || "");
      setEmel((e) => e || pengguna.emel || "");
    }
  }, [pengguna]);

  const submit = async (e) => {
    e.preventDefault();
    setHantar(true);
    try {
      const data = await api.post("/mesej", { nama, emel, mesej });
      toast.berjaya(data.mesej || "Mesej anda telah dihantar. Terima kasih!");
      setNama(""); setEmel(""); setMesej("");
    } catch (err) {
      toast.ralat(err.message || "Gagal menghantar mesej.");
    } finally {
      setHantar(false);
    }
  };

  return (
    <Shell tajuk="Hubungi Kami" sari="Ada soalan atau maklum balas? Kami ingin mendengar daripada anda.">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="kad p-5">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-red-50 text-merah"><Mail size={20} /></span>
          <p className="mt-3 font-papar font-bold">E-mel</p>
          <p className="text-sm text-gray-500">sokongan@semuabolehpdf.com</p>
        </div>
        <div className="kad p-5">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-red-50 text-merah"><MessageSquare size={20} /></span>
          <p className="mt-3 font-papar font-bold">Maklum balas</p>
          <p className="text-sm text-gray-500">Gunakan borang di sebelah untuk menghantar mesej.</p>
        </div>
      </div>

      <form onSubmit={submit} className="kad mt-6 space-y-4 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <input className="medan" placeholder="Nama anda" value={nama} onChange={(e) => setNama(e.target.value)} required />
          <input type="email" className="medan" placeholder="E-mel anda" value={emel} onChange={(e) => setEmel(e.target.value)} required />
        </div>
        <textarea className="medan min-h-[120px]" placeholder="Mesej anda…" value={mesej} onChange={(e) => setMesej(e.target.value)} required />
        <button className="btn-utama" disabled={hantar}>{hantar ? "Menghantar…" : "Hantar Mesej"}</button>
      </form>
    </Shell>
  );
}
