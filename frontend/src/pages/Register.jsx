import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../components/Toast.jsx";
import { Loader2 } from "lucide-react";

export default function Register() {
  const { daftar } = useAuth();
  const toast = useToast();
  const nav = useNavigate();

  const [nama, setNama] = useState("");
  const [emel, setEmel] = useState("");
  const [kataLaluan, setKataLaluan] = useState("");
  const [sahkan, setSahkan] = useState("");
  const [setuju, setSetuju] = useState(false);
  const [sibuk, setSibuk] = useState(false);
  const [ralat, setRalat] = useState("");

  const hantar = async (e) => {
    e.preventDefault();
    setRalat("");
    if (kataLaluan.length < 8) {
      setRalat("Kata laluan mesti sekurang-kurangnya 8 aksara.");
      return;
    }
    if (kataLaluan !== sahkan) {
      setRalat("Kata laluan dan pengesahan tidak sepadan.");
      return;
    }
    if (!setuju) {
      setRalat("Sila bersetuju dengan terma penggunaan.");
      return;
    }
    setSibuk(true);
    try {
      const p = await daftar(nama, emel, kataLaluan, sahkan, setuju);
      toast.berjaya(`Selamat datang, ${p.nama}!`);
      nav("/papan-pemuka", { replace: true });
    } catch (err) {
      setRalat(err.message || "Pendaftaran gagal.");
    } finally {
      setSibuk(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <h1 className="text-center font-papar text-3xl font-extrabold">Cipta Akaun</h1>
      <p className="mt-2 text-center text-gray-500">Percuma selamanya. Tiada kad kredit diperlukan.</p>

      <form onSubmit={hantar} className="kad mt-8 space-y-4 p-6">
        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-gray-700">Nama Penuh</span>
          <input className="medan" value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Ahmad bin Ali" required />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-gray-700">E-mel</span>
          <input type="email" className="medan" value={emel} onChange={(e) => setEmel(e.target.value)} placeholder="nama@contoh.com" required />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-gray-700">Kata Laluan</span>
          <input type="password" className="medan" value={kataLaluan} onChange={(e) => setKataLaluan(e.target.value)} placeholder="Sekurang-kurangnya 8 aksara" required />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-gray-700">Sahkan Kata Laluan</span>
          <input type="password" className="medan" value={sahkan} onChange={(e) => setSahkan(e.target.value)} placeholder="Masukkan semula kata laluan" required />
        </label>

        <label className="flex items-start gap-2 text-sm text-gray-600">
          <input type="checkbox" checked={setuju} onChange={(e) => setSetuju(e.target.checked)} className="mt-1 accent-merah" />
          <span>
            Saya bersetuju dengan{" "}
            <Link to="/terma" className="font-semibold text-merah hover:underline">Terma Penggunaan</Link> dan{" "}
            <Link to="/polisi-privasi" className="font-semibold text-merah hover:underline">Polisi Privasi</Link>.
          </span>
        </label>

        {ralat && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-merah">{ralat}</p>}

        <button type="submit" disabled={sibuk} className="btn-utama w-full">
          {sibuk ? <Loader2 className="animate-pusar" size={18} /> : "Daftar"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Sudah ada akaun?{" "}
        <Link to="/log-masuk" className="font-semibold text-merah hover:underline">Log masuk</Link>
      </p>
    </div>
  );
}
