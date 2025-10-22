
import { Router } from "express";
import { Course } from "../models/course.js";
import CourseRepository from "../repositories/course.js";
import logger from "../../../utils/logger.js";
import {
  HttpStatus,
  API_MESSAGES,
} from "../../../constants/enums.js";
import { AppError } from "../../../middlewares/errorHandler.js";
import CategoryModel from "../../admin/categories/models/category.js";
import User from "../../auth/models/User.js";
import { UserRole } from "../../../constants/enums.js";


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

    // Helper function to normalize strings for fuzzy matching
    private normalizeString(str: string): string {
        return str.toLowerCase().trim().replace(/\s+/g, ' ').replace(/[,\s]/g, '');
    }

    // Find category ID by name with fuzzy matching
    private async findCategoryByName(categoryName: string): Promise<string | null> {
        try {
            const normalizedSearch = this.normalizeString(categoryName);
            
            // First try exact match
            const exactMatch = await CategoryModel.findOne({ 
                name: { $regex: new RegExp(`^${categoryName}$`, 'i') } 
            });
            if (exactMatch) return exactMatch._id.toString();

            // Try fuzzy match - get all categories and match
            const allCategories = await CategoryModel.find({});
            for (const category of allCategories) {
                const normalizedCategoryName = this.normalizeString(category.name);
                if (normalizedCategoryName === normalizedSearch || 
                    normalizedCategoryName.includes(normalizedSearch) ||
                    normalizedSearch.includes(normalizedCategoryName)) {
                    return category._id.toString();
                }
            }

            return null;
        } catch (error) {
            logger.error(`Error finding category by name: ${categoryName}`, error);
            return null;
        }
    }

    // Find university ID by collegeName with fuzzy matching
    private async findUniversityByName(universityName: string): Promise<string | null> {
        try {
            const normalizedSearch = this.normalizeString(universityName);
            
            // First try exact match on collegeName with university role
            const exactMatch = await User.findOne({ 
                role: UserRole.UNIVERSITY,
                collegeName: { $regex: new RegExp(`^${universityName}$`, 'i') }
            });
            if (exactMatch) return exactMatch._id.toString();

            // Try fuzzy match - get all universities and match on collegeName
            const allUniversities = await User.find({ 
                role: UserRole.UNIVERSITY,
                collegeName: { $exists: true, $ne: null, $ne: '' }
            });
            
            for (const university of allUniversities) {
                if (!university.collegeName) continue;
                
                const normalizedCollegeName = this.normalizeString(university.collegeName);
                
                // Check for exact match, contains, or partial match
                if (normalizedCollegeName === normalizedSearch || 
                    normalizedCollegeName.includes(normalizedSearch) ||
                    normalizedSearch.includes(normalizedCollegeName)) {
                    return university._id.toString();
                }
            }

            return null;
        } catch (error) {
            logger.error(`Error finding university by collegeName: ${universityName}`, error);
            return null;
        }
    }

    // Upload course with fuzzy matching for category and university
    async uploadCourse(courseData: any): Promise<any> {
        try {
            const { categoryName, universityName, ...restData } = courseData;

            // Find category ID by name
            const categoryId = await this.findCategoryByName(categoryName);
            if (!categoryId) {
                logger.warn(`Category not found for name: ${categoryName}. Skipping course: ${restData.name}`);
                return {
                    success: false,
                    message: `Category '${categoryName}' not found. Course skipped.`,
                    courseName: restData.name
                };
            }

            // Find university ID by name
            const universityId = await this.findUniversityByName(universityName);
            if (!universityId) {
                logger.warn(`University not found for name: ${universityName}. Skipping course: ${restData.name}`);
                return {
                    success: false,
                    message: `University '${universityName}' not found. Course skipped.`,
                    courseName: restData.name
                };
            }

            // Get parent category ID if exists
            const category = await CategoryModel.findById(categoryId);
            const parentCategoryId = category?.parentId || categoryId;

            // Create course with mapped IDs
            const newCourse = new Course({
                ...restData,
                categoryId: [categoryId],
                parentCategoryId: [parentCategoryId],
                UniversityId: universityId,
            });

            const savedCourse = await newCourse.save();
            logger.info(`Course created successfully: ${savedCourse.name}`);
            
            return {
                success: true,
                message: 'Course created successfully',
                course: savedCourse
            };
        } catch (error) {
            logger.error('Upload course failed:', error);
            throw error;
        }
    }

    // Bulk upload courses
    async bulkUploadCourses(coursesData: any[]): Promise<any> {
        const results = {
            successful: [] as any[],
            failed: [] as any[],
            totalProcessed: coursesData.length,
            successCount: 0,
            failCount: 0
        };

        for (const courseData of coursesData) {
            try {
                const result = await this.uploadCourse(courseData);
                if (result.success) {
                    results.successful.push(result);
                    results.successCount++;
                } else {
                    results.failed.push(result);
                    results.failCount++;
                }
            } catch (error: any) {
                logger.error(`Failed to process course: ${courseData.name}`, error);
                results.failed.push({
                    success: false,
                    message: error.message || 'Failed to create course',
                    courseName: courseData.name
                });
                results.failCount++;
            }
        }

        return results;
    }

    
}

export default CourseService;