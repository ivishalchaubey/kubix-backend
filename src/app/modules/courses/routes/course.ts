import { Router , Request , Response , NextFunction } from "express";
import CourseController from "../controllers/course.js";
import asyncHandler from "../../../utils/asyncHandler.js";
const courseRouter = Router();
import AuthMiddleware from "../../../middlewares/auth.js";
const courseController = new CourseController();

courseRouter.post("/", courseController.createCourse.bind(courseController));
courseRouter.put("/:id", courseController.updateCourse.bind(courseController));
courseRouter.delete("/:id", courseController.deleteCourse.bind(courseController));
courseRouter.get("/", courseController.getCourses.bind(courseController));

courseRouter.get("/user/courses",AuthMiddleware.authenticate, courseController.getUserCourses);

courseRouter.get('/university/:universityId/courses', courseController.getUniversityCourses.bind(courseController));



export default courseRouter;