import { Router , Request , Response , NextFunction } from "express";
import CourseController from "../controllers/course.js";
import asyncHandler from "../../../../utils/asyncHandler.js";
const courseRouter = Router();

const courseController = new CourseController();

courseRouter.post("/", asyncHandler((req : Request, res : Response, next : NextFunction) => courseController.createCourse(req, res, next)));
courseRouter.put("/:id", asyncHandler((req : Request, res : Response, next : NextFunction) => courseController.updateCourse(req, res, next)));
courseRouter.delete("/:id", asyncHandler((req : Request, res : Response, next : NextFunction) => courseController.deleteCourse(req, res, next)));
courseRouter.get("/", asyncHandler((req : Request, res : Response, next : NextFunction) => courseController.getCourses(req, res, next)));
export default courseRouter;