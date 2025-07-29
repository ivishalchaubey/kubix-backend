import { Router } from "express";
import { authRoutes } from "./auth/index.js";

const router = Router();

// Mount auth routes
router.use("/auth", authRoutes);

// Health check endpoint
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "API is healthy",
    timestamp: new Date().toISOString(),
  });
});

export default router;
