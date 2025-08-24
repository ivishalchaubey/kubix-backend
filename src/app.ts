import * as expressModule from "express";
import { Request, Response, NextFunction } from "express";
import cors from "cors";

import { config } from "./app/config/env.js";
import routes from "./app/modules/index.js";
import adminRouter from "./app/modules/admin/categories/routes/adminRoutes.js";
import courseRouter from "./app/modules/courses/routes/course.js";
import userRouter from "./app/modules/user/routes/user.js";
import ImageRouter from "./app/modules/auth/routes/imageUploadRoutes.js";
import notificationRouter from "./app/modules/notifications/routes/notification.routes.js";
import globalErrorHandler from "./app/middlewares/errorHandler.js";
import logger from "./app/utils/logger.js";

const express = (expressModule as any).default;
const app = express();

// Trust proxy
app.set("trust proxy", 1);

// Security middlewares
app.use(
  cors({
    origin: '*',
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

app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/courses", courseRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/image", ImageRouter);
app.use("/api/v1/notifications", notificationRouter);


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
