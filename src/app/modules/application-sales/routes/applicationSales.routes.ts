import { Router } from "express";
import ApplicationSalesController from "../controllers/applicationSales.controller.js";
import AuthMiddleware from "../../../middlewares/auth.js";
import { applicationSalesValidation } from "../../../middlewares/validationMiddleware.js";

const applicationSalesRouter = Router();
const applicationSalesController = new ApplicationSalesController();

// Public routes - Students can view published application sales
applicationSalesRouter.get("/published", applicationSalesController.getPublishedApplicationSales.bind(applicationSalesController));
applicationSalesRouter.get("/:id", applicationSalesController.getApplicationSaleById.bind(applicationSalesController));

// Track application (Webhook/API endpoint)
applicationSalesRouter.post("/:id/track", applicationSalesController.trackApplication.bind(applicationSalesController));

// University routes - Require authentication
applicationSalesRouter.post("/", AuthMiddleware.authenticate, applicationSalesValidation.create, applicationSalesController.createApplicationSale.bind(applicationSalesController));
applicationSalesRouter.get("/university/my-applications", AuthMiddleware.authenticate, applicationSalesController.getMyApplicationSales.bind(applicationSalesController));
applicationSalesRouter.patch("/:id", AuthMiddleware.authenticate, applicationSalesValidation.update, applicationSalesController.updateApplicationSale.bind(applicationSalesController));
applicationSalesRouter.delete("/:id", AuthMiddleware.authenticate, applicationSalesController.deleteApplicationSale.bind(applicationSalesController));
applicationSalesRouter.post("/:id/publish", AuthMiddleware.authenticate, applicationSalesController.publishApplicationSale.bind(applicationSalesController));

// Admin route - Get all application sales
applicationSalesRouter.get("/admin/all", AuthMiddleware.authenticate, applicationSalesController.getAllApplicationSales.bind(applicationSalesController));

export default applicationSalesRouter;

