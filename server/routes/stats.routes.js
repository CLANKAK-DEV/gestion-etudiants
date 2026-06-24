import { Router } from "express";
import { getOverview } from "../controllers/stats.controller.js";

const router = Router();

// GET /api/stats/overview — aggregated dashboard statistics.
router.get("/overview", getOverview);

export default router;
