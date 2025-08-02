import { Router } from "express";
import AdminController from "../controllers/adminController.js";
import asyncHandler from "../../../../utils/asyncHandler.js";
const adminRouter = Router();
const adminController = new AdminController();
adminRouter.post("/categories", asyncHandler((req, res, next) => adminController.createCategory(req, res, next)));
adminRouter.put("/categories/:id", asyncHandler((req, res, next) => adminController.updateCategory(req, res, next)));
adminRouter.delete("/categories/:id", asyncHandler((req, res, next) => adminController.deleteCategory(req, res, next)));
adminRouter.get("/categories", asyncHandler((req, res, next) => adminController.getCategories(req, res, next)));
export default adminRouter;
//# sourceMappingURL=adminRoutes.js.map