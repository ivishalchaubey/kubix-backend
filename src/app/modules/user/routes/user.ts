import { Router, Request, Response, NextFunction } from "express";
import UserController from "../controllers/user.js";
import AuthMiddleware from "../../../middlewares/auth.js";
import { UserRole } from "../../../constants/enums.js";
import asyncHandler from "../../../utils/asyncHandler.js";
const userRouter = Router();

const userController = new UserController();

userRouter.put(
  "/",
  AuthMiddleware.authenticate,
  asyncHandler((req: Request, res: Response, next: NextFunction) =>
    userController.updateUser(req, res, next)
  )
);
userRouter.get(
  "/",
  AuthMiddleware.authenticate,
  asyncHandler((req: Request, res: Response, next: NextFunction) =>
    userController.getUsers(req, res, next)
  )
);

userRouter.get(
  "/all",
  AuthMiddleware.authenticate,
  AuthMiddleware.authorize(UserRole.ADMIN),
  asyncHandler((req: Request, res: Response, next: NextFunction) =>
    userController.getAllUsers(req, res, next)
  )
);

userRouter.get(
  "/likedCourses",
  AuthMiddleware.authenticate,
  asyncHandler((req: Request, res: Response, next: NextFunction) =>
    userController.likedCourses(req, res, next)
  )
);
userRouter.get(
  "/bookmarkedCourses",
  AuthMiddleware.authenticate,
  asyncHandler((req: Request, res: Response, next: NextFunction) =>
    userController.bookmarkedCourses(req, res, next)
  )
);

userRouter.patch(
  "/update/token",
  AuthMiddleware.authenticate,
  asyncHandler((req: Request, res: Response, next: NextFunction) =>
    userController.updateToken(req, res, next)
  )
);
userRouter.get(
  "/homedata",
  AuthMiddleware.authenticate,
  asyncHandler((req: Request, res: Response, next: NextFunction) =>
    userController.getHomeData(req, res, next)
  )
);
userRouter.get(
  "/categories",
  AuthMiddleware.authenticate,
  asyncHandler((req: Request, res: Response, next: NextFunction) =>
    userController.getUserCategories(req, res, next)
  )
);

userRouter.delete(
  "/",
  AuthMiddleware.authenticate,
  asyncHandler((req: Request, res: Response, next: NextFunction) =>
    userController.deleteUser(req, res, next)
  )
);

export default userRouter;
