
import { Router } from "express";
import { Course } from "../models/course.js";
import CourseRepository from "../repositories/course.js";
import logger from "../../../utils/logger.js";
import {
  HttpStatus,
  API_MESSAGES,
} from "../../../constants/enums.js";
import { AppError } from "../../../middlewares/errorHandler.js";


class CourseService {
    private courseRepository: CourseRepository;

  constructor() {
    this.courseRepository = new CourseRepository();
  }

  async createCourse(courseData: any): Promise<any> {
    const newCourse = new Course(courseData);
    return await newCourse.save();
  }

  async updateCourse(courseId: string, courseData: any): Promise<any> {
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      courseData,
      { new: true }
    );
    if (!updatedCourse) {
      throw new Error("Course not found");
    }
    return updatedCourse;
  }

  async deleteCourse(courseId: string): Promise<void> {
    const deletedCourse = await Course.findByIdAndDelete(courseId);
    if (!deletedCourse) {
      throw new Error("Course not found");
    }
  }

  async getCourses(): Promise<any[]> {
    const result = await this.courseRepository.getCourses();
    return result;
  }

  // function to get the courses based on categoryId
  async getCoursesByCategory(categoryId: string): Promise<any[]> {
    const result = await this.courseRepository.getCoursesByCategory(categoryId);
    return result;
  }
  async getUserCourses(userId: string, search: string): Promise<any> {
      try {
        const courses = await this.courseRepository.getUserCourses(userId, search);
        logger.info(`User courses retrieved for user: ${userId}`);
        return  courses ;
      } catch (error) {
        logger.error("Get user courses failed:", error);
        throw error;
      }
    }

    async getCourseById(courseId: string): Promise<any> {
      return await this.courseRepository.getUserCoursesbyId(courseId);
    }

    async getUniversityCourses(universityId: string): Promise<any[]> {
        try {
            const courses = await this.courseRepository.getUniversityCourses(universityId);
            logger.info(`University courses retrieved for university: ${universityId}`);
            return courses;
        } catch (error) {
            logger.error("Get university courses failed:", error);
            throw error;
        }
    }

    
}

export default CourseService;