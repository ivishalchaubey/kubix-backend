import { Request, Response, NextFunction } from 'express';
import ResponseUtil from "../../../utils/response.js";
import { API_MESSAGES } from '../../../constants/enums.js';
import CourseService from '../services/course.js';
class CourseController {
    public courseService: CourseService;
    constructor() {
        this.courseService = new CourseService();
    }
    async createCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { name, description, categoryId, Image, duration, amount, university, currency, chapters } = req.body;

            // Assuming there's a service method to handle course creation
            const result = await this.courseService.createCourse(req.body);

            ResponseUtil.created(res, result, API_MESSAGES.COURSE.COURSE_CREATED);
        } catch (error) {
            next(error);
        }
    }

    async updateCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const courseId = req.params.id;
            const courseData = req.body;

            const result = await this.courseService.updateCourse(courseId, courseData);

            ResponseUtil.success(res, result, API_MESSAGES.COURSE.COURSE_UPDATED);
        } catch (error) {
            next(error);
        }
    }

    async deleteCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const courseId = req.params.id;

            await this.courseService.deleteCourse(courseId);

            ResponseUtil.success(res, null, API_MESSAGES.COURSE.COURSE_DELETED);
        } catch (error) {
            next(error);
        }
    }

    async getCourses(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            let categoryId = req.query.categoryId;
            let courseId = req.query.courseId;
            if (courseId) {
                const course = await this.courseService.getCourseById(courseId as string);
                ResponseUtil.success(res, course, API_MESSAGES.COURSE.COURSES_FETCHED);
                return ;
            }
            if (categoryId) {
                const coursesByCategory = await this.courseService.getCoursesByCategory(categoryId as string);
                ResponseUtil.success(res, coursesByCategory, API_MESSAGES.COURSE.COURSES_FETCHED);
                return ;
            }
            const courses = await this.courseService.getCourses();
            ResponseUtil.success(res, courses, API_MESSAGES.COURSE.COURSES_FETCHED);
            return ;
        } catch (error) {
            next(error);
        }
    }

    getUserCourses = async (
        req: Request,
        res: Response,
        next: NextFunction
      ): Promise<void> => {
        try {
          if (!req.user) {
            ResponseUtil.unauthorized(res, API_MESSAGES.ERROR.UNAUTHORIZED);
            return;
          }
          const search = req.query.search as string;
          const userId = req.user._id;
          const courses = await this.courseService.getUserCourses(userId , search);
    
          ResponseUtil.success(res, { courses }, "User courses retrieved successfully");
        } catch (error) {
          next(error);
        }
      }

    async getUniversityCourses(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user) {
                ResponseUtil.unauthorized(res, API_MESSAGES.ERROR.UNAUTHORIZED);
                return;
            }
            const universityId = req.user._id;
            const courses = await this.courseService.getUniversityCourses(universityId);
            ResponseUtil.success(res, courses, API_MESSAGES.COURSE.COURSES_FETCHED);
        } catch (error) {
            next(error);
        }
    }

    
}

export default CourseController;