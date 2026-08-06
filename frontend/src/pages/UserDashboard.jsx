import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../services/api.js";
import { useToast } from "../components/Toast.jsx";
import { Loader } from "../components/ui.jsx";
import { FileStack, CheckCircle2, Wrench, Trash2, User, KeyRound } from "lucide-react";

function saizManusia(bait) {
  if (!bait) return "0 B";
  if (bait < 1024) return `${bait} B`;
  if (bait < 1024 * 1024) return `${(bait / 1024).toFixed(1)} KB`;
  return `${(bait / 1024 / 1024).toFixed(1)} MB`;
}

function Stat({ Icon, label, nilai }) {
  return (
    <div className="kad flex items-center gap-4 p-5">
      <span className="grid h-12 w-12 place-items-center rounded-xl bg-red-50 text-merah">
        <Icon size={22} />
      </span>
      <div>
        <p className="text-2xl font-extrabold text-arang">{nilai}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}

export default function UserDashboard() {
  const { pengguna, kemasKini } = useAuth();
  const toast = useToast();

  const [ringkasan, setRingkasan] = useState(null);
  const [sejarah, setSejarah] = useState([]);
  const [memuat, setMemuat] = useState(true);

  const [nama, setNama] = useState(pengguna?.nama || "");
  const [lama, setLama] = useState("");
  const [baharu, setBaharu] = useState("");

  const muat = async () => {
    try {
      const [r, s] = await Promise.all([
        api.get("/penggunaan/ringkasan"),
        api.get("/penggunaan/sejarah?had=50"),
      ]);
      setRingkasan(r);
      setSejarah(s.sejarah || []);
    } catch (e) {
      toast.ralat(e.message);
    } finally {
      setMemuat(false);
    }
  };

  useEffect(() => {
    muat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const simpanNama = async (e) => {
    e.preventDefault();
    try {
      const data = await api.put("/auth/profil", { nama });
      kemasKini({ nama: data.pengguna.nama });
      toast.berjaya("Profil dikemas kini.");
    } catch (err) {
      toast.ralat(err.message);
    }
  };

  const tukarKataLaluan = async (e) => {
    e.preventDefault();
    try {
      await api.put("/auth/kata-laluan", { kata_laluan_lama: lama, kata_laluan_baharu: baharu });
      setLama("");
      setBaharu("");
      toast.berjaya("Kata laluan berjaya ditukar.");
    } catch (err) {
      toast.ralat(err.message);
    }
  };

  const padamSejarah = async () => {
    if (!confirm("Padam semua sejarah penggunaan anda? Tindakan ini tidak boleh dibatalkan.")) return;
    try {
      await api.del("/penggunaan/sejarah");
      setSejarah([]);
      toast.berjaya("Sejarah dipadam.");
      muat();
    } catch (err) {
      toast.ralat(err.message);
    }
  };

  if (memuat) return <Loader teks="Memuat papan pemuka…" />;

  const tarikhDaftar = pengguna?.dicipta_pada
    ? new Date(pengguna.dicipta_pada).toLocaleDateString("ms-MY", { day: "numeric", month: "long", year: "numeric" })
    : "-";

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-papar text-3xl font-extrabold">Papan Pemuka</h1>
      <p className="mt-1 text-gray-500">Selamat datang kembali, {pengguna?.nama}.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Stat Icon={FileStack} label="Jumlah fail diproses" nilai={ringkasan?.jumlah_diproses ?? 0} />
        <Stat Icon={CheckCircle2} label="Berjaya" nilai={ringkasan?.jumlah_berjaya ?? 0} />
        <Stat Icon={Wrench} label="Jenis alat digunakan" nilai={ringkasan?.alat_kerap?.length ?? 0} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Sejarah */}
        <div className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-papar text-lg font-bold">Sejarah Penggunaan</h2>
            {sejarah.length > 0 && (
              <button onClick={padamSejarah} className="inline-flex items-center gap-1.5 text-sm font-semibold text-merah hover:underline">
                <Trash2 size={15} /> Padam sejarah
              </button>
            )}
          </div>
          <div className="kad overflow-hidden">
            {sejarah.length === 0 ? (
              <p className="p-8 text-center text-sm text-gray-500">
                Belum ada sejarah. Mula gunakan alat PDF kami!
              </p>
            ) : (
              <div className="divide-y divide-gray-100">
                {sejarah.map((s) => (
                  <div key={s.id} className="flex items-center justify-between px-5 py-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-arang">{s.nama_alat}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(s.dicipta_pada).toLocaleString("ms-MY")} · {saizManusia(s.saiz_bait)}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        s.status === "berjaya" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-merah"
                      }`}
                    >
                      {s.status === "berjaya" ? "Berjaya" : "Gagal"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tetapan akaun */}
        <div className="space-y-6">
          <div className="kad p-5">
            <p className="text-sm text-gray-500">E-mel</p>
            <p className="font-semibold text-arang">{pengguna?.emel}</p>
            <p className="mt-3 text-sm text-gray-500">Ahli sejak</p>
            <p className="font-semibold text-arang">{tarikhDaftar}</p>
          </div>

          <form onSubmit={simpanNama} className="kad space-y-3 p-5">
            <p className="flex items-center gap-2 font-papar font-bold">
              <User size={16} /> Kemas Kini Profil
            </p>
            <input className="medan" value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Nama penuh" />
            <button className="btn-utama w-full py-2.5">Simpan</button>
          </form>

          <form onSubmit={tukarKataLaluan} className="kad space-y-3 p-5">
            <p className="flex items-center gap-2 font-papar font-bold">
              <KeyRound size={16} /> Tukar Kata Laluan
            </p>
            <input type="password" className="medan" value={lama} onChange={(e) => setLama(e.target.value)} placeholder="Kata laluan lama" required />
            <input type="password" className="medan" value={baharu} onChange={(e) => setBaharu(e.target.value)} placeholder="Kata laluan baharu (min 8 aksara)" required />
            <button className="btn-lembut w-full py-2.5">Tukar Kata Laluan</button>
          </form>
        </div>
      </div>
    </div>
  );
}
