import * as expressModule from "express";
import { Request, Response, NextFunction } from "express";
import cors from "cors";

import { config } from "./config/env.js";
import routes from "./modules/index.js";
import globalErrorHandler from "./middlewares/errorHandler.js";
import logger from "./utils/logger.js";

const express = (expressModule as any).default;
const app = express();

// Trust proxy
app.set("trust proxy", 1);

// Security middlewares
app.use(
  cors({
    origin: config.frontendUrl,
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

// API routes
app.use("/api/v1", routes);

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
