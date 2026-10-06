import { Router } from "express";
import rateLimit from "express-rate-limit";
import { muatNaik, sahkanKandungan } from "../middleware/upload.js";
import { authPilihan } from "../middleware/auth.js";
import { prosesFail, muatTurun, periksaPdf } from "../controllers/toolController.js";
import { ALAT } from "../config/tools.js";

import {startJob,jobStatus} from "../services/jobs.js";

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

// Page-by-page text inspection keeps response sizes bounded for large PDFs.
r.post('/periksa', hadProses, muatNaik.array('files', 1), sahkanKandungan, periksaPdf);

r.post('/kerja/:slug', hadProses, authPilihan, muatNaik.array('files',30), sahkanKandungan, startJob);
r.get('/kerja/:id', jobStatus);
r.get("/muat-turun/:nama", muatTurun);

export default r;
