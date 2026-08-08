import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, ShieldCheck, Zap, Trash2, Globe, Quote } from "lucide-react";
import { TOOLS, CATEGORIES, toolsByCategory } from "../config/tools.js";
import { ToolCard } from "../components/ToolCard.jsx";
import { api } from "../services/api.js";

function Ciri({ Icon, tajuk, teks }) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-red-50 text-merah">
        <Icon size={20} />
      </span>
      <div>
        <p className="font-papar font-bold text-arang">{tajuk}</p>
        <p className="text-sm text-gray-500">{teks}</p>
      </div>
    </div>
  );
}

export default function Home() {
  const [cari, setCari] = useState("");
  const [testimoni, setTestimoni] = useState([]);

  useEffect(() => {
    api.get("/mesej/testimoni")
      .then((d) => setTestimoni(d.testimoni || []))
      .catch(() => {});
  }, []);

  const carian = useMemo(() => {
    const q = cari.trim().toLowerCase();
    if (!q) return null;
    return TOOLS.filter(
      (t) =>
        t.nama.toLowerCase().includes(q) ||
        t.ringkas.toLowerCase().includes(q) ||
        t.slug.includes(q)
    );
  }, [cari]);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-arang via-arang to-[#141d38]">
        {/* Bentuk hiasan halus */}
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-merah/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 top-10 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/2 h-40 w-[36rem] -translate-x-1/2 rounded-full bg-merah/10 blur-3xl" />

        <div className="relative mx-auto max-w-4xl px-4 py-16 text-center sm:py-24">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-white ring-1 ring-white/20">
            <Globe size={14} /> Alat PDF dalam Bahasa Melayu
          </span>
          <h1 className="mt-5 font-papar text-4xl font-extrabold leading-tight text-white sm:text-5xl">
            Semua alat PDF yang <span className="text-merah">anda perlukan</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-300">
            Gabung, pisah, mampat, tukar dan lindungi fail PDF anda — semuanya percuma, mudah dan
            selamat. Fail anda dipadam secara automatik selepas diproses.
          </p>

          <div className="mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-2xl border border-white/10 bg-white px-4 py-2 shadow-naik">
            <Search className="text-gray-400" size={20} />
            <input
              value={cari}
              onChange={(e) => setCari(e.target.value)}
              placeholder="Cari alat… (cth: gabung, mampat, tukar)"
              className="w-full bg-transparent py-2 outline-none"
            />
          </div>
        </div>

        {/* Lengkung pemisah ke bahagian putih */}
        <div className="relative">
          <svg viewBox="0 0 1440 60" className="block w-full" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 60 L0 20 Q720 60 1440 20 L1440 60 Z" fill="#F7F8FA" />
          </svg>
        </div>
      </section>

      {/* Grid alat */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        {carian ? (
          <>
            <h2 className="mb-5 font-papar text-xl font-bold">
              {carian.length} hasil untuk “{cari}”
            </h2>
            {carian.length === 0 ? (
              <p className="text-gray-500">Tiada alat sepadan. Cuba kata kunci lain.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {carian.map((t) => (
                  <ToolCard key={t.slug} tool={t} />
                ))}
              </div>
            )}
          </>
        ) : (
          CATEGORIES.map((kat) => {
            const senarai = toolsByCategory(kat.id);
            if (!senarai.length) return null;
            return (
              <div key={kat.id} className="mb-12">
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="font-papar text-xl font-bold text-arang">{kat.nama}</h2>
                  <span className="text-sm text-gray-400">{senarai.length} alat</span>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {senarai.map((t) => (
                    <ToolCard key={t.slug} tool={t} />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </section>

      {/* Ciri-ciri */}
      <section className="border-y border-gray-100 bg-gradient-to-br from-blue-50/50 via-white to-red-50/40">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
          <Ciri Icon={Zap} tajuk="Pantas & Mudah" teks="Muat naik, proses dan muat turun dalam beberapa saat sahaja." />
          <Ciri Icon={ShieldCheck} tajuk="Selamat" teks="Sambungan disulitkan dan pemprosesan dilakukan di pelayan kami." />
          <Ciri Icon={Trash2} tajuk="Privasi Terjamin" teks="Fail dipadam automatik sebaik sahaja selesai diproses." />
          <Ciri Icon={Globe} tajuk="100% Bahasa Melayu" teks="Antara muka sepenuhnya dalam Bahasa Melayu untuk semua." />
        </div>
      </section>

      {/* Testimoni (hanya jika ada yang diluluskan) */}
      {testimoni.length > 0 && (
        <section className="border-t border-gray-100 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-14">
            <div className="text-center">
              <h2 className="font-papar text-2xl font-bold text-arang">Apa kata pengguna kami</h2>
              <p className="mt-2 text-gray-500">Maklum balas sebenar daripada pengguna Semua Boleh PDF.</p>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {testimoni.map((t, i) => (
                <div key={i} className="kad relative p-6">
                  <Quote className="absolute right-5 top-5 text-merah/20" size={28} />
                  <p className="text-gray-700">{t.mesej}</p>
                  <div className="mt-4 flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-merah text-sm font-bold text-white">
                      {t.nama?.[0]?.toUpperCase() || "P"}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-arang">{t.nama}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(t.dicipta_pada).toLocaleDateString("ms-MY", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA daftar */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="kad flex flex-col items-center justify-between gap-6 bg-arang p-8 text-center text-white sm:flex-row sm:text-left">
          <div>
            <h3 className="font-papar text-2xl font-bold">Cipta akaun percuma</h3>
            <p className="mt-1 text-gray-300">
              Simpan sejarah penggunaan dan akses semua alat dengan satu akaun.
            </p>
          </div>
          <Link to="/daftar" className="btn-utama shrink-0">Daftar Sekarang</Link>
        </div>
      </section>
    </div>
  );
}
