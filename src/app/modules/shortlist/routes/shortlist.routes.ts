import { Router, Request, Response, NextFunction } from "express";
import ShortlistController from "../controllers/shortlist.controller.js";
import AuthMiddleware from "../../../middlewares/auth.js";
import asyncHandler from "../../../utils/asyncHandler.js";

const shortlistRouter = Router();
const shortlistController = new ShortlistController();

// All routes require authentication
shortlistRouter.post(
  "/",
  AuthMiddleware.authenticate,
  asyncHandler((req: Request, res: Response, next: NextFunction) =>
    shortlistController.createShortlist(req, res, next)
  )
);

shortlistRouter.get(
  "/",
  AuthMiddleware.authenticate,
  asyncHandler((req: Request, res: Response, next: NextFunction) =>
    shortlistController.getShortlists(req, res, next)
  )
);

shortlistRouter.get(
  "/check",
  AuthMiddleware.authenticate,
  asyncHandler((req: Request, res: Response, next: NextFunction) =>
    shortlistController.checkShortlisted(req, res, next)
  )
);

shortlistRouter.get(
  "/:id",
  AuthMiddleware.authenticate,
  asyncHandler((req: Request, res: Response, next: NextFunction) =>
    shortlistController.getShortlistById(req, res, next)
  )
);

shortlistRouter.delete(
  "/:id",
  AuthMiddleware.authenticate,
  asyncHandler((req: Request, res: Response, next: NextFunction) =>
    shortlistController.deleteShortlist(req, res, next)
  )
);

export default shortlistRouter;

