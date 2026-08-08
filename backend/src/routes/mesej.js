import { Router } from "express";
import rateLimit from "express-rate-limit";
import { hantarMesej, testimoniAwam } from "../controllers/mesejController.js";

const r = Router();

// Had kadar: elak spam borang (5 mesej setiap 10 minit per IP).
const hadHantar = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: { ralat: "Terlalu banyak mesej dihantar. Sila cuba sebentar lagi." },
});

r.post("/", hadHantar, hantarMesej);
r.get("/testimoni", testimoniAwam);

export default r;
