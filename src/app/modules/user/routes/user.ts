import { Router , Request , Response , NextFunction } from "express";
import UserController from "../controllers/user.js";
import AuthMiddleware from "../../../middlewares/auth.js";
import asyncHandler from "../../../utils/asyncHandler.js";
const userRouter = Router();

const userController = new UserController();

userRouter.put("/", AuthMiddleware.authenticate, asyncHandler((req : Request, res : Response, next : NextFunction) => userController.updateUser(req, res, next)));
userRouter.get("/",AuthMiddleware.authenticate, asyncHandler((req : Request, res : Response, next : NextFunction) => userController.getUsers(req, res, next)));

userRouter.get("/likedCourses", AuthMiddleware.authenticate, asyncHandler((req : Request, res : Response, next : NextFunction) => userController.likedCourses(req, res, next)));

export default userRouter;