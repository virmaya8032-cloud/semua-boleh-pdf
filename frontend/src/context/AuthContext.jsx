import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "../services/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [pengguna, setPengguna] = useState(null);
  const [memuat, setMemuat] = useState(true);

  const muatSaya = useCallback(async () => {
    if (!localStorage.getItem("sbp_token")) {
      setMemuat(false);
      return;
    }
    try {
      const data = await api.get("/auth/saya");
      setPengguna(data.pengguna);
    } catch {
      localStorage.removeItem("sbp_token");
      setPengguna(null);
    } finally {
      setMemuat(false);
    }
  }, []);

  useEffect(() => {
    muatSaya();
  }, [muatSaya]);

  const logMasuk = async (emel, kata_laluan) => {
    const data = await api.post("/auth/log-masuk", { emel, kata_laluan });
    localStorage.setItem("sbp_token", data.token);
    setPengguna(data.pengguna);
    return data.pengguna;
  };

  const daftar = async (nama, emel, kata_laluan, sahkan_kata_laluan, setuju) => {
    const data = await api.post("/auth/daftar", {
      nama,
      emel,
      kata_laluan,
      sahkan_kata_laluan,
      setuju,
    });
    localStorage.setItem("sbp_token", data.token);
    setPengguna(data.pengguna);
    return data.pengguna;
  };

  const logKeluar = () => {
    localStorage.removeItem("sbp_token");
    setPengguna(null);
  };

  const kemasKini = (baru) => setPengguna((p) => ({ ...p, ...baru }));

  return (
    <AuthContext.Provider
      value={{ pengguna, memuat, logMasuk, daftar, logKeluar, kemasKini, muatSaya }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth mesti digunakan dalam AuthProvider");
  return ctx;
}
