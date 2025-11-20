import { Router, Request, Response, NextFunction } from "express";
import CategoryController from "../controllers/categoryController.js";
import asyncHandler from "../../../utils/asyncHandler.js";

const categoryRouter = Router();
const categoryController = new CategoryController();

categoryRouter.post(
  "/categories",
  asyncHandler((req: Request, res: Response, next: NextFunction) =>
    categoryController.getCategories(req, res, next)
  )
);

export default categoryRouter;

