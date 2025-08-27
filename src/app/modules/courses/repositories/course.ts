import { Types } from "mongoose";
import User from "../../auth/models/User.js";
import { IUser } from "../../../types/global.js";
import {Course} from "../models/course.js";
import {
  UserRole,
  HttpStatus,
  API_MESSAGES,
} from "../../../constants/enums.js";
import { AppError } from "../../../middlewares/errorHandler.js";

class CourseRepository {
  
  //   get courses by user ID with optional search
  getUserCourses = async (
    userId: string,
    search?: string
  ): Promise<any[] | null> => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new AppError(
      API_MESSAGES.ERROR.USER_NOT_FOUND,
      HttpStatus.NOT_FOUND
    );
  }

  const user = await User.findById(userId).lean();

  if (!user) {
    throw new AppError(
      API_MESSAGES.ERROR.USER_NOT_FOUND,
      HttpStatus.NOT_FOUND
    );
  }

  // ✅ Use Promise.all properly with correct populate
  const coursesArrays = await Promise.all(
    user.categoryIds.map((categoryId: Types.ObjectId) => {
      const query: any = { categoryId };
      
      // Add search functionality if search term is provided
      if (search && search.trim()) {
        query.name = { $regex: search.trim(), $options: "i" };
      }
      
      return Course.find(query).populate("UniversityId");
    })
  );

  // ✅ Flatten results
  const courses = coursesArrays.flat();

  return courses;
};

  getUserCoursesbyId = async (courseId: string): Promise<any> => {
    return await Course.findById(courseId).populate("UniversityId");
  }

  getCoursesByCategory = async (categoryId: string): Promise<any> => {
    return await Course.find({ categoryId: categoryId }).populate("UniversityId");
  }

  getCourses = async (): Promise<any> => {
    return await Course.find().populate("UniversityId");
  }

  getUniversityCourses = async (universityId: string): Promise<any[]> => {
    if (!Types.ObjectId.isValid(universityId)) {
      throw new AppError(
        API_MESSAGES.ERROR.UNIVERSITY_NOT_FOUND,
        HttpStatus.NOT_FOUND
      );
    }
    
    return await Course.aggregate([{
      $match :{ UniversityId: universityId }
    },
    {
      $lookup: {
        from: "users",
        localField: "UniversityId",
        foreignField: "_id",
        as: "University"
      }
    },
    {
      $unwind: "$University"
    },
    {
      $lookup:{
        from : "users",
        localField: "_id",
        foreignField : "likedCourses",
        as : "likes"
      }
    }
  ])
  }


}

export default CourseRepository;
