import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { TOOLS, CATEGORIES } from "../config/tools.js";
import { ToolCard } from "../components/ToolCard.jsx";

export default function AllTools() {
  const [cari, setCari] = useState("");
  const [kat, setKat] = useState("semua");

  const senarai = useMemo(() => {
    const q = cari.trim().toLowerCase();
    return TOOLS.filter((t) => {
      const padanKat = kat === "semua" || t.kategori === kat;
      const padanCari =
        !q ||
        t.nama.toLowerCase().includes(q) ||
        t.ringkas.toLowerCase().includes(q) ||
        t.slug.includes(q);
      return padanKat && padanCari;
    });
  }, [cari, kat]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-papar text-3xl font-extrabold">Semua Alat PDF</h1>
      <p className="mt-2 text-gray-500">
        {TOOLS.length} alat percuma untuk menguruskan fail PDF anda.
      </p>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex max-w-md flex-1 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2">
          <Search className="text-gray-400" size={18} />
          <input
            value={cari}
            onChange={(e) => setCari(e.target.value)}
            placeholder="Cari alat…"
            className="w-full bg-transparent py-1 outline-none"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => setKat("semua")}
          className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
            kat === "semua" ? "bg-merah text-white" : "bg-white text-arang border border-gray-200 hover:bg-gray-50"
          }`}
        >
          Semua
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setKat(c.id)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              kat === c.id ? "bg-merah text-white" : "bg-white text-arang border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {c.nama}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {senarai.map((t) => (
          <ToolCard key={t.slug} tool={t} />
        ))}
      </div>
      {senarai.length === 0 && (
        <p className="mt-10 text-center text-gray-500">Tiada alat sepadan dengan carian anda.</p>
      )}
    </div>
  );
}
