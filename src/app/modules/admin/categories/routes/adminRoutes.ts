import { Router , Request , Response , NextFunction } from "express";
import AdminController from "../controllers/adminController.js";
import asyncHandler from "../../../../utils/asyncHandler.js";
const adminRouter = Router();

const adminController = new AdminController();

adminRouter.post("/categories", asyncHandler((req : Request, res : Response, next : NextFunction) => adminController.createCategory(req, res, next)));
adminRouter.put("/categories/:id", asyncHandler((req : Request, res : Response, next : NextFunction) => adminController.updateCategory(req, res, next)));
adminRouter.delete("/categories/:id", asyncHandler((req : Request, res : Response, next : NextFunction) => adminController.deleteCategory(req, res, next)));
adminRouter.get("/categories", asyncHandler((req : Request, res : Response, next : NextFunction) => adminController.getCategories(req, res, next)));
export default adminRouter;