import { Link } from "react-router-dom";
import { ikonAlat } from "../config/icons.js";

export function ToolCard({ tool }) {
  const Icon = ikonAlat(tool.icon);
  const warna = tool.warna || "#E12128";
  return (
    <Link
      to={`/alat/${tool.slug}`}
      className="kad group relative flex flex-col gap-3 p-5 transition hover:-translate-y-0.5 hover:shadow-naik"
    >
      {tool.akanDatang && (
        <span className="absolute right-3 top-3 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-600">
          Akan Datang
        </span>
      )}
      <span
        className="grid h-12 w-12 place-items-center rounded-xl"
        style={{ backgroundColor: `${warna}14`, color: warna }}
      >
        <Icon size={24} />
      </span>
      <div>
        <h3 className="font-papar font-bold text-arang transition group-hover:text-merah">
          {tool.nama}
        </h3>
        <p className="mt-1 text-sm text-gray-500 line-clamp-2">{tool.ringkas}</p>
      </div>
    </Link>
  );
}
