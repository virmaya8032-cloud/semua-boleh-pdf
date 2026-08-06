import { Router } from "express";
import { perluAuth } from "../middleware/auth.js";
import { ringkasanSaya, sejarahSaya, padamSejarahSaya } from "../controllers/usageController.js";

const r = Router();
r.use(perluAuth);
r.get("/ringkasan", ringkasanSaya);
r.get("/sejarah", sejarahSaya);
r.delete("/sejarah", padamSejarahSaya);
export default r;
