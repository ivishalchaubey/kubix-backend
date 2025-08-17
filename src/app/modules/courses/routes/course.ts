import { Router , Request , Response , NextFunction } from "express";
import CourseController from "../controllers/course.js";
import asyncHandler from "../../../utils/asyncHandler.js";
const courseRouter = Router();
import AuthMiddleware from "../../../middlewares/auth.js";
const courseController = new CourseController();

courseRouter.post("/", courseController.createCourse);
courseRouter.put("/:id", courseController.updateCourse);
courseRouter.delete("/:id", courseController.deleteCourse);
courseRouter.get("/", courseController.getCourses);

courseRouter.get("/user/courses",AuthMiddleware.authenticate, courseController.getUserCourses);

export default courseRouter;