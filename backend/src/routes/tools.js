import { Router } from "express";
import rateLimit from "express-rate-limit";
import { muatNaik, sahkanKandungan } from "../middleware/upload.js";
import { authPilihan } from "../middleware/auth.js";
import { prosesFail, muatTurun } from "../controllers/toolController.js";
import { ALAT } from "../config/tools.js";

const r = Router();

// Had kadar khusus untuk pemprosesan (elak penyalahgunaan).
const hadProses = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ralat: "Terlalu banyak permintaan. Sila cuba sebentar lagi." },
});

// Senaraikan alat yang tersedia (untuk semakan/pengesahan).
r.get("/senarai", (_req, res) => {
  res.json({ alat: Object.keys(ALAT) });
});

// Proses fail untuk alat tertentu. Menerima medan borang "files".
r.post(
  "/proses/:slug",
  hadProses,
  authPilihan,
  muatNaik.array("files", 30),
  sahkanKandungan,
  prosesFail
);

r.get("/muat-turun/:nama", muatTurun);

export default r;
