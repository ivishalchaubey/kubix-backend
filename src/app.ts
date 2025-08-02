import * as expressModule from "express";
import { Request, Response, NextFunction } from "express";
import cors from "cors";

import { config } from "./app/config/env.js";
import routes from "./app/modules/index.js";
import adminRouter from "./app/modules/admin/categories/routes/adminRoutes.js";
import globalErrorHandler from "./app/middlewares/errorHandler.js";
import logger from "./app/utils/logger.js";

const express = (expressModule as any).default;
const app = express();

// Trust proxy
app.set("trust proxy", 1);

// Security middlewares
app.use(
  cors({
    // origin: config.frontendUrl,
    origin: "*", // Allow all origins for development
    credentials: true,
  })
);

// Body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Request logging
app.use((req: Request, _res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Root route
app.get("/", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Counselling Launchpad Backend API",
    version: "1.0.0",
    endpoints: {
      health: "/api/v1/health",
      auth: "/api/v1/auth",
      admin: "/api/v1/admin"
    },
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use("/api/v1", routes);

app.use("/api/v1/admin", adminRouter);

// Handle undefined routes
app.all("*", (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    statusCode: 404,
  });
});

// Global error handler
app.use(globalErrorHandler);

export default app;
