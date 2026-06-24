import { Router } from "express";
import studentRoutes from "./student.routes.js";
import statsRoutes from "./stats.routes.js";

const router = Router();

router.use("/students", studentRoutes);
router.use("/stats", statsRoutes);

export default router;
