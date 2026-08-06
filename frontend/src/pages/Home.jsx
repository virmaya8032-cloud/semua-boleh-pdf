import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, ShieldCheck, Zap, Trash2, Globe } from "lucide-react";
import { TOOLS, CATEGORIES, toolsByCategory } from "../config/tools.js";
import { ToolCard } from "../components/ToolCard.jsx";

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
      <section className="bg-gradient-to-b from-white to-kabus">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:py-20">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-sm font-semibold text-merah">
            <Globe size={14} /> Alat PDF dalam Bahasa Melayu
          </span>
          <h1 className="mt-5 font-papar text-4xl font-extrabold leading-tight text-arang sm:text-5xl">
            Semua alat PDF yang anda perlukan
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-500">
            Gabung, pisah, mampat, tukar dan lindungi fail PDF anda — semuanya percuma, mudah dan
            selamat. Fail anda dipadam secara automatik selepas diproses.
          </p>

          <div className="mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2 shadow-kad">
            <Search className="text-gray-400" size={20} />
            <input
              value={cari}
              onChange={(e) => setCari(e.target.value)}
              placeholder="Cari alat… (cth: gabung, mampat, tukar)"
              className="w-full bg-transparent py-2 outline-none"
            />
          </div>
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
      <section className="border-t border-gray-100 bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
          <Ciri Icon={Zap} tajuk="Pantas & Mudah" teks="Muat naik, proses dan muat turun dalam beberapa saat sahaja." />
          <Ciri Icon={ShieldCheck} tajuk="Selamat" teks="Sambungan disulitkan dan pemprosesan dilakukan di pelayan kami." />
          <Ciri Icon={Trash2} tajuk="Privasi Terjamin" teks="Fail dipadam automatik sebaik sahaja selesai diproses." />
          <Ciri Icon={Globe} tajuk="100% Bahasa Melayu" teks="Antara muka sepenuhnya dalam Bahasa Melayu untuk semua." />
        </div>
      </section>

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
