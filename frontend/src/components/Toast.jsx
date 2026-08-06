import { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, X, Info } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [senarai, setSenarai] = useState([]);

  const buang = useCallback((id) => {
    setSenarai((s) => s.filter((t) => t.id !== id));
  }, []);

  const tunjuk = useCallback(
    (mesej, jenis = "info") => {
      const id = Math.random().toString(36).slice(2);
      setSenarai((s) => [...s, { id, mesej, jenis }]);
      setTimeout(() => buang(id), 4200);
    },
    [buang]
  );

  const toast = {
    berjaya: (m) => tunjuk(m, "berjaya"),
    ralat: (m) => tunjuk(m, "ralat"),
    info: (m) => tunjuk(m, "info"),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2">
        {senarai.map((t) => (
          <div
            key={t.id}
            className="flex items-start gap-3 rounded-xl bg-white px-4 py-3 shadow-naik border border-gray-100 animate-naik max-w-sm"
            role="status"
          >
            {t.jenis === "berjaya" && <CheckCircle2 className="text-green-600 shrink-0" size={20} />}
            {t.jenis === "ralat" && <AlertCircle className="text-merah shrink-0" size={20} />}
            {t.jenis === "info" && <Info className="text-blue-600 shrink-0" size={20} />}
            <p className="text-sm text-arang flex-1">{t.mesej}</p>
            <button onClick={() => buang(t.id)} className="text-gray-400 hover:text-arang">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast mesti digunakan dalam ToastProvider");
  return ctx;
}
