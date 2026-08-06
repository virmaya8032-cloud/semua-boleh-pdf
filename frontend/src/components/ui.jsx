import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Loader2 } from "lucide-react";

export function Loader({ teks = "Sedang memuat…" }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-gray-500">
      <Loader2 className="animate-pusar text-merah" size={32} />
      <p className="text-sm">{teks}</p>
    </div>
  );
}

export function ProgressBar({ nilai = 0, label }) {
  return (
    <div className="w-full">
      {label && <p className="mb-1 text-sm text-gray-600">{label}</p>}
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-merah transition-all duration-300"
          style={{ width: `${Math.min(100, Math.max(0, nilai))}%` }}
        />
      </div>
    </div>
  );
}

export function ProtectedRoute({ children, pentadbir = false }) {
  const { pengguna, memuat } = useAuth();
  const lokasi = useLocation();

  if (memuat) return <Loader />;
  if (!pengguna) return <Navigate to="/log-masuk" state={{ dari: lokasi.pathname }} replace />;
  if (pentadbir && pengguna.peranan !== "pentadbir") return <Navigate to="/papan-pemuka" replace />;
  return children;
}
