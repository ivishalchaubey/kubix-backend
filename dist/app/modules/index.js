import { Router } from "express";
import { authRoutes } from "./auth/index.js";
const router = Router();
router.use("/auth", authRoutes);
router.get("/health", (req, res) => {
    res.json({
        success: true,
        message: "API is healthy",
        timestamp: new Date().toISOString(),
    });
});
export default router;
//# sourceMappingURL=index.js.map