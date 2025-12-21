import * as expressModule from "express";
import cors from "cors";
import routes from "./app/modules/index.js";
import adminRouter from "./app/modules/admin/categories/routes/adminRoutes.js";
import dashboardRouter from "./app/modules/admin/categories/routes/dashboardRoutes.js";
import courseRouter from "./app/modules/courses/routes/course.js";
import userRouter from "./app/modules/user/routes/user.js";
import ImageRouter from "./app/modules/auth/routes/imageUploadRoutes.js";
import DocumentRouter from "./app/modules/auth/routes/documentUploadRoutes.js";
import notificationRouter from "./app/modules/notifications/routes/notification.routes.js";
import paymentRouter from "./app/modules/payments/routes/payment.js";
import stripeRoutes from "./app/modules/stripe/routes/stripe.routes.js";
import exploreRouter from "./app/modules/explore/routes/exploreRoutes.js";
import inAppBannerRouter from "./app/modules/in-app-banner/routes/inAppBanner.routes.js";
import webinarRouter from "./app/modules/webinar/routes/webinar.routes.js";
import applicationSalesRouter from "./app/modules/application-sales/routes/applicationSales.routes.js";
import categoryRouter from "./app/modules/categories/routes/categoryRoutes.js";
import shortlistRouter from "./app/modules/shortlist/routes/shortlist.routes.js";
import applicationFormRouter from "./app/modules/application-form/routes/applicationForm.routes.js";
import globalErrorHandler from "./app/middlewares/errorHandler.js";
import logger from "./app/utils/logger.js";
const express = expressModule.default;
const app = express();
app.set("trust proxy", 1);
app.use(cors({
    origin: "*",
    credentials: true,
}));
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));
app.use("/api/v1/stripe/webhook", express.raw({ type: "application/json" }));
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
            admin: "/api/v1/admin",
        },
        timestamp: new Date().toISOString(),
    });
});
app.use("/api/v1", routes);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/admin/dashboard", dashboardRouter);
app.use("/api/v1/courses", courseRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/image", ImageRouter);
app.use("/api/v1/document", DocumentRouter);
app.use("/api/v1/notifications", notificationRouter);
app.use("/api/v1/payments", paymentRouter);
app.use("/api/v1/stripe", stripeRoutes);
app.use("/api/v1/explore", exploreRouter);
app.use("/api/v1/in-app-banners", inAppBannerRouter);
app.use("/api/v1/webinars", webinarRouter);
app.use("/api/v1/application-sales", applicationSalesRouter);
app.use("/api/v1", categoryRouter);
app.use("/api/v1/shortlist", shortlistRouter);
app.use("/api/v1/application-form", applicationFormRouter);
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