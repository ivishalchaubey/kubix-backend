import { Router } from "express";
import InAppBannerController from "../controllers/inAppBanner.controller.js";
import AuthMiddleware from "../../../middlewares/auth.js";
import { inAppBannerValidation } from "../../../middlewares/validationMiddleware.js";

const inAppBannerRouter = Router();
const inAppBannerController = new InAppBannerController();

// Public route - Get active banners
inAppBannerRouter.get("/active", inAppBannerController.getActiveBanners.bind(inAppBannerController));

// Admin routes - Require authentication
inAppBannerRouter.post("/", AuthMiddleware.authenticate, inAppBannerValidation.create, inAppBannerController.createBanner.bind(inAppBannerController));
inAppBannerRouter.get("/", AuthMiddleware.authenticate, inAppBannerController.getBanners.bind(inAppBannerController));
inAppBannerRouter.get("/:id", AuthMiddleware.authenticate, inAppBannerController.getBannerById.bind(inAppBannerController));
inAppBannerRouter.patch("/:id", AuthMiddleware.authenticate, inAppBannerValidation.update, inAppBannerController.updateBanner.bind(inAppBannerController));
inAppBannerRouter.delete("/:id", AuthMiddleware.authenticate, inAppBannerController.deleteBanner.bind(inAppBannerController));

export default inAppBannerRouter;
