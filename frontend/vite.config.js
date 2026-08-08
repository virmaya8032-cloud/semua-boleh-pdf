import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Masa build disuntik automatik setiap kali `npm run build` (setiap deploy Vercel).
const MASA_BINA = new Date().toISOString();

export default defineConfig({
  plugins: [react()],
  define: {
    __MASA_BINA__: JSON.stringify(MASA_BINA),
  },
  server: {
    port: 5173,
    proxy: {
      "/api": { target: "http://localhost:4000", changeOrigin: true },
    },
  },
  build: { outDir: "dist", sourcemap: false },
});
