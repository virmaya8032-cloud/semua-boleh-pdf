import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Semasa pembangunan, hantar /api ke backend tempatan.
      "/api": { target: "http://localhost:4000", changeOrigin: true },
    },
  },
  build: { outDir: "dist", sourcemap: false },
});
