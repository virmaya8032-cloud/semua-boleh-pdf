import { Router } from "express";
import { perluPentadbir } from "../middleware/auth.js";
import {
  statistik, senaraiPengguna, aktiviti, eksportCsv,
  tukarStatusPengguna, padamPengguna, statusSistem,
} from "../controllers/adminController.js";
import { senaraiMesej, tandaDibaca, padamMesej, tukarDipapar } from "../controllers/mesejController.js";

const r = Router();
r.use(perluPentadbir);
r.get("/statistik", statistik);
r.get("/pengguna", senaraiPengguna);
r.get("/aktiviti", aktiviti);
r.get("/eksport-csv", eksportCsv);
r.get("/status-sistem", statusSistem);
r.patch("/pengguna/:id/status", tukarStatusPengguna);
r.delete("/pengguna/:id", padamPengguna);
r.get("/mesej", senaraiMesej);
r.patch("/mesej/:id/dibaca", tandaDibaca);
r.delete("/mesej/:id", padamMesej);
r.patch("/mesej/:id/dipapar", tukarDipapar);
export default r;
