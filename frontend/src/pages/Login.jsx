import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../components/Toast.jsx";
import { Loader2 } from "lucide-react";

export default function Login() {
  const { logMasuk } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const lokasi = useLocation();
  const dari = lokasi.state?.dari || "/papan-pemuka";

  const [emel, setEmel] = useState("");
  const [kataLaluan, setKataLaluan] = useState("");
  const [sibuk, setSibuk] = useState(false);
  const [ralat, setRalat] = useState("");

  const hantar = async (e) => {
    e.preventDefault();
    setRalat("");
    setSibuk(true);
    try {
      const p = await logMasuk(emel, kataLaluan);
      toast.berjaya(`Selamat kembali, ${p.nama}!`);
      nav(p.peranan === "pentadbir" ? "/pentadbir" : dari, { replace: true });
    } catch (err) {
      setRalat(err.message || "Log masuk gagal.");
    } finally {
      setSibuk(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <h1 className="text-center font-papar text-3xl font-extrabold">Log Masuk</h1>
      <p className="mt-2 text-center text-gray-500">
        Selamat kembali! Sila masukkan butiran akaun anda.
      </p>

      <form onSubmit={hantar} className="kad mt-8 space-y-4 p-6">
        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-gray-700">E-mel</span>
          <input
            type="email"
            className="medan"
            value={emel}
            onChange={(e) => setEmel(e.target.value)}
            placeholder="nama@contoh.com"
            required
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-gray-700">Kata Laluan</span>
          <input
            type="password"
            className="medan"
            value={kataLaluan}
            onChange={(e) => setKataLaluan(e.target.value)}
            placeholder="••••••••"
            required
          />
        </label>

        {ralat && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-merah">{ralat}</p>}

        <button type="submit" disabled={sibuk} className="btn-utama w-full">
          {sibuk ? <Loader2 className="animate-pusar" size={18} /> : "Log Masuk"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Belum ada akaun?{" "}
        <Link to="/daftar" className="font-semibold text-merah hover:underline">
          Daftar sekarang
        </Link>
      </p>
    </div>
  );
}
