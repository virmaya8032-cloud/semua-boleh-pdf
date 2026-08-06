import { Router } from "express";
import { perluPentadbir } from "../middleware/auth.js";
import {
  statistik, senaraiPengguna, aktiviti, eksportCsv,
  tukarStatusPengguna, padamPengguna, statusSistem,
} from "../controllers/adminController.js";

const r = Router();
r.use(perluPentadbir);
r.get("/statistik", statistik);
r.get("/pengguna", senaraiPengguna);
r.get("/aktiviti", aktiviti);
r.get("/eksport-csv", eksportCsv);
r.get("/status-sistem", statusSistem);
r.patch("/pengguna/:id/status", tukarStatusPengguna);
r.delete("/pengguna/:id", padamPengguna);
export default r;
