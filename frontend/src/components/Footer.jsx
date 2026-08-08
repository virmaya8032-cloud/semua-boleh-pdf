/* global __MASA_BINA__ */
import { Link } from "react-router-dom";

const lajur = [
  {
    tajuk: "Alat Popular",
    pautan: [
      { ke: "/alat/gabung-pdf", t: "Gabung PDF" },
      { ke: "/alat/pisah-pdf", t: "Pisah PDF" },
      { ke: "/alat/mampat-pdf", t: "Mampat PDF" },
      { ke: "/alat/pdf-ke-word", t: "PDF ke Word" },
      { ke: "/alat/word-ke-pdf", t: "Word ke PDF" },
    ],
  },
  {
    tajuk: "Syarikat",
    pautan: [
      { ke: "/mengenai-kami", t: "Mengenai Kami" },
      { ke: "/hubungi", t: "Hubungi" },
      { ke: "/soalan-lazim", t: "Soalan Lazim" },
    ],
  },
  {
    tajuk: "Undang-undang",
    pautan: [
      { ke: "/polisi-privasi", t: "Polisi Privasi" },
      { ke: "/terma", t: "Terma Penggunaan" },
      { ke: "/keselamatan", t: "Keselamatan" },
    ],
  },
];

export default function Footer() {
  // Masa build disuntik oleh Vite (vite.config.js) — berubah automatik setiap deploy.
  const tarikhBina = (() => {
    try {
      return new Date(__MASA_BINA__).toLocaleDateString("ms-MY", {
        day: "numeric", month: "long", year: "numeric",
      });
    } catch {
      return "";
    }
  })();

  return (
    <footer className="mt-20 border-t border-gray-100 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <img src="/logo-mark.jpg" alt="Semua Boleh PDF" className="h-9 w-9 rounded-lg bg-white object-contain p-0.5" />
              <span className="font-papar font-extrabold">
                Semua Boleh <span className="text-merah">PDF</span>
              </span>
            </div>
            <p className="mt-3 text-sm text-gray-500">
              Alat PDF percuma dalam Bahasa Melayu. Mudah, pantas dan selamat — semua fail diproses
              dan dipadam secara automatik.
            </p>
          </div>

          {lajur.map((l) => (
            <div key={l.tajuk}>
              <h4 className="font-papar text-sm font-bold uppercase tracking-wide text-gray-400">
                {l.tajuk}
              </h4>
              <ul className="mt-3 space-y-2">
                {l.pautan.map((p) => (
                  <li key={p.ke}>
                    <Link to={p.ke} className="text-sm text-gray-600 hover:text-merah">
                      {p.t}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-gray-100 pt-6 text-center text-sm text-gray-500">
          © 2026 Semua Boleh PDF oleh VMY. Hak cipta terpelihara.
          <span className="ml-2 text-gray-400">
            v1.3 · dikemas kini {tarikhBina}
          </span>
        </div>
      </div>
    </footer>
  );
}
