import * as expressModule from "express";
import cors from "cors";
import routes from "./app/modules/index.js";
import adminRouter from "./app/modules/admin/categories/routes/adminRoutes.js";
import globalErrorHandler from "./app/middlewares/errorHandler.js";
import logger from "./app/utils/logger.js";
const express = expressModule.default;
const app = express();
app.set("trust proxy", 1);
app.use(cors({
    origin: "*",
    credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use((req, _res, next) => {
    logger.info(`${req.method} ${req.path} - ${req.ip}`);
    next();
});
app.get("/", (req, res) => {
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
app.use("/api/v1", routes);
app.use("/api/v1/admin", adminRouter);
app.all("*", (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`,
        statusCode: 404,
    });
});
app.use(globalErrorHandler);
export default app;
//# sourceMappingURL=app.js.map