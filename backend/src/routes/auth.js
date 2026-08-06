import { Router } from "express";
import { daftar, logMasuk, saya, kemasKiniProfil, tukarKataLaluan } from "../controllers/authController.js";
import { perluAuth } from "../middleware/auth.js";

const r = Router();
r.post("/daftar", daftar);
r.post("/log-masuk", logMasuk);
r.get("/saya", perluAuth, saya);
r.put("/profil", perluAuth, kemasKiniProfil);
r.put("/kata-laluan", perluAuth, tukarKataLaluan);
export default r;
