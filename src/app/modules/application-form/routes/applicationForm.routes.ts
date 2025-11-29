import { Router, Request, Response, NextFunction } from "express";
import ApplicationFormController from "../controllers/applicationForm.controller.js";
import AuthMiddleware from "../../../middlewares/auth.js";
import asyncHandler from "../../../utils/asyncHandler.js";

const applicationFormRouter = Router();
const applicationFormController = new ApplicationFormController();

// All routes require authentication
applicationFormRouter.post(
  "/",
  AuthMiddleware.authenticate,
  asyncHandler((req: Request, res: Response, next: NextFunction) =>
    applicationFormController.createOrUpdateApplication(req, res, next)
  )
);

applicationFormRouter.put(
  "/",
  AuthMiddleware.authenticate,
  asyncHandler((req: Request, res: Response, next: NextFunction) =>
    applicationFormController.createOrUpdateApplication(req, res, next)
  )
);

applicationFormRouter.get(
  "/",
  AuthMiddleware.authenticate,
  asyncHandler((req: Request, res: Response, next: NextFunction) =>
    applicationFormController.getUserApplications(req, res, next)
  )
);

applicationFormRouter.get(
  "/college/:collegeId",
  AuthMiddleware.authenticate,
  asyncHandler((req: Request, res: Response, next: NextFunction) =>
    applicationFormController.getApplicationByCollegeId(req, res, next)
  )
);

applicationFormRouter.get(
  "/college/:collegeId/all",
  AuthMiddleware.authenticate,
  asyncHandler((req: Request, res: Response, next: NextFunction) =>
    applicationFormController.getCollegeApplications(req, res, next)
  )
);

applicationFormRouter.delete(
  "/college/:collegeId",
  AuthMiddleware.authenticate,
  asyncHandler((req: Request, res: Response, next: NextFunction) =>
    applicationFormController.deleteApplication(req, res, next)
  )
);

export default applicationFormRouter;

