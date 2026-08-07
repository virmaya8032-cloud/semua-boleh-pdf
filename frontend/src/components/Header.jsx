import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X, LayoutDashboard, LogOut, Shield, ChevronDown } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5 shrink-0" aria-label="Semua Boleh PDF">
      <img src="/logo-mark.jpg" alt="Semua Boleh PDF" className="h-10 w-10 rounded-lg object-contain" />
      <span className="font-papar font-extrabold text-lg leading-none">
        Semua Boleh <span className="text-merah">PDF</span>
      </span>
    </Link>
  );
}

const pautanPantas = [
  { ke: "/alat/gabung-pdf", label: "Gabung" },
  { ke: "/alat/pisah-pdf", label: "Pisah" },
  { ke: "/alat/mampat-pdf", label: "Mampat" },
  { ke: "/alat/pdf-ke-word", label: "Tukar" },
];

export default function Header() {
  const { pengguna, logKeluar } = useAuth();
  const nav = useNavigate();
  const [buka, setBuka] = useState(false);
  const [menuAkaun, setMenuAkaun] = useState(false);

  const keluar = () => {
    logKeluar();
    setMenuAkaun(false);
    nav("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur">
      <div className="h-1 w-full bg-gradient-to-r from-arang via-arang to-merah" />
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex">
          {pautanPantas.map((p) => (
            <NavLink
              key={p.ke}
              to={p.ke}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-semibold transition hover:bg-gray-50 ${
                  isActive ? "text-merah" : "text-arang"
                }`
              }
            >
              {p.label}
            </NavLink>
          ))}
          <NavLink
            to="/alat"
            className="rounded-lg px-3 py-2 text-sm font-semibold text-arang transition hover:bg-gray-50"
          >
            Semua Alat PDF
          </NavLink>
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {pengguna ? (
            <div className="relative">
              <button
                onClick={() => setMenuAkaun((v) => !v)}
                className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold hover:bg-gray-50"
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-merah text-white text-xs">
                  {pengguna.nama?.[0]?.toUpperCase() || "P"}
                </span>
                <span className="max-w-[8rem] truncate">{pengguna.nama}</span>
                <ChevronDown size={16} />
              </button>
              {menuAkaun && (
                <div
                  className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-naik"
                  onMouseLeave={() => setMenuAkaun(false)}
                >
                  <Link
                    to="/papan-pemuka"
                    onClick={() => setMenuAkaun(false)}
                    className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-gray-50"
                  >
                    <LayoutDashboard size={16} /> Papan Pemuka
                  </Link>
                  {pengguna.peranan === "pentadbir" && (
                    <Link
                      to="/pentadbir"
                      onClick={() => setMenuAkaun(false)}
                      className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-gray-50"
                    >
                      <Shield size={16} /> Panel Pentadbir
                    </Link>
                  )}
                  <button
                    onClick={keluar}
                    className="flex w-full items-center gap-2 px-4 py-3 text-sm text-merah hover:bg-gray-50"
                  >
                    <LogOut size={16} /> Log Keluar
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/log-masuk" className="btn-lembut py-2">Log Masuk</Link>
              <Link to="/daftar" className="btn-utama py-2">Daftar</Link>
            </>
          )}
        </div>

        <button
          className="md:hidden rounded-lg p-2 hover:bg-gray-50"
          onClick={() => setBuka((v) => !v)}
          aria-label="Menu"
        >
          {buka ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {buka && (
        <div className="border-t border-gray-100 bg-white md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col px-4 py-2">
            {pautanPantas.map((p) => (
              <Link
                key={p.ke}
                to={p.ke}
                onClick={() => setBuka(false)}
                className="rounded-lg px-3 py-3 text-sm font-semibold hover:bg-gray-50"
              >
                {p.label}
              </Link>
            ))}
            <Link to="/alat" onClick={() => setBuka(false)} className="rounded-lg px-3 py-3 text-sm font-semibold hover:bg-gray-50">
              Semua Alat PDF
            </Link>
            <hr className="my-2" />
            {pengguna ? (
              <>
                <Link to="/papan-pemuka" onClick={() => setBuka(false)} className="rounded-lg px-3 py-3 text-sm font-semibold hover:bg-gray-50">
                  Papan Pemuka
                </Link>
                {pengguna.peranan === "pentadbir" && (
                  <Link to="/pentadbir" onClick={() => setBuka(false)} className="rounded-lg px-3 py-3 text-sm font-semibold hover:bg-gray-50">
                    Panel Pentadbir
                  </Link>
                )}
                <button onClick={() => { keluar(); setBuka(false); }} className="rounded-lg px-3 py-3 text-left text-sm font-semibold text-merah hover:bg-gray-50">
                  Log Keluar
                </button>
              </>
            ) : (
              <div className="flex gap-2 py-2">
                <Link to="/log-masuk" onClick={() => setBuka(false)} className="btn-lembut flex-1 py-2">Log Masuk</Link>
                <Link to="/daftar" onClick={() => setBuka(false)} className="btn-utama flex-1 py-2">Daftar</Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
