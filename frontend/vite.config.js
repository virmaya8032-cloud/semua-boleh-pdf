import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { execSync } from "child_process";

// Masa build disuntik automatik setiap kali `npm run build` (setiap deploy Vercel).
const MASA_BINA = new Date().toISOString();

// Nombor versi auto — naik sendiri setiap deploy.
// 1) Cuba kira jumlah commit Git (paling tepat).
// 2) Jika gagal (Vercel shallow clone), guna nombor berdasarkan tarikh supaya tetap naik.
function kiraBina() {
  try {
    const n = parseInt(execSync("git rev-list --count HEAD", { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim(), 10);
    if (n && n > 0) return n;
  } catch {
    /* abaikan */
  }
  // Sandaran: hari sejak 1 Ogos 2026 (supaya nombor sentiasa meningkat mengikut masa)
  const asas = new Date("2026-08-01T00:00:00Z").getTime();
  const hari = Math.floor((Date.now() - asas) / 86400000);
  return 20 + Math.max(0, hari); // mula ~v1.20+
}

const BILANGAN_BINA = kiraBina();

export default defineConfig({
  plugins: [react()],
  define: {
    __MASA_BINA__: JSON.stringify(MASA_BINA),
    __BINA__: JSON.stringify(BILANGAN_BINA),
  },
  server: {
    port: 5173,
    proxy: {
      "/api": { target: "http://localhost:4000", changeOrigin: true },
    },
  },
  build: { target: "es2022", outDir: "dist", sourcemap: false },
});
