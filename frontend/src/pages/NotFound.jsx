import { Link } from "react-router-dom";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
      <span className="grid h-20 w-20 place-items-center rounded-2xl bg-red-50 text-merah">
        <FileQuestion size={40} />
      </span>
      <h1 className="mt-6 font-papar text-4xl font-extrabold">404</h1>
      <p className="mt-2 text-lg font-semibold text-arang">Halaman tidak dijumpai</p>
      <p className="mt-1 text-gray-500">
        Maaf, halaman yang anda cari tidak wujud atau telah dipindahkan.
      </p>
      <Link to="/" className="btn-utama mt-8">Kembali ke Halaman Utama</Link>
    </div>
  );
}
