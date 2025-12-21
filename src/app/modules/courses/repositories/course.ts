import { Types } from "mongoose";
import mongoose from "mongoose";
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
      
      return Course.find(query).populate({
        path: "UniversityId",
        select: "-password -otp -refreshToken -accessToken -emailVerificationToken -passwordResetToken -passwordResetExpires"
      });
    })
  );

  // ✅ Flatten results
  const courses = coursesArrays.flat();

  return courses;
};

  getUserCoursesbyId = async (courseId: string): Promise<any> => {
    return await Course.findById(courseId).populate({
      path: "UniversityId",
      select: "-password -otp -refreshToken -accessToken -emailVerificationToken -passwordResetToken -passwordResetExpires"
    });
  }

  getCoursesByCategory = async (categoryId: string): Promise<any> => {
    return await Course.find({ categoryId: categoryId }).populate({
      path: "UniversityId",
      select: "-password -otp -refreshToken -accessToken -emailVerificationToken -passwordResetToken -passwordResetExpires"
    });
  }

  getCourses = async (): Promise<any> => {
    return await Course.find().populate({
      path: "UniversityId",
      select: "-password -otp -refreshToken -accessToken -emailVerificationToken -passwordResetToken -passwordResetExpires"
    });
  }

  getUniversityCourses = async (universityId: string): Promise<any[]> => {
    if (!Types.ObjectId.isValid(universityId)) {
      throw new AppError(
        API_MESSAGES.ERROR.UNIVERSITY_NOT_FOUND,
        HttpStatus.NOT_FOUND
      );
    }
    
    return await Course.aggregate([
      {
        $match: { UniversityId: new mongoose.Types.ObjectId(universityId) }
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
        $lookup: {
          from: "usercourselikeds",
          localField: "_id",
          foreignField: "courseId",
          as: "likes"
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "likes.userId",
          foreignField: "_id",
          as: "likedUsers"
        }
      },
      {
        $addFields: {
          likes: {
            $map: {
              input: "$likes",
              as: "like",
              in: {
                $mergeObjects: [
                  "$$like",
                  {
                    user: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$likedUsers",
                            cond: { $eq: ["$$this._id", "$$like.userId"] }
                          }
                        },
                        0
                      ]
                    }
                  }
                ]
              }
            }
          }
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          currency: 1,
          duration: 1,
          image: 1,
          course_fees_low: 1,
          course_fees_high: 1,
          course_type: 1,
          semesters: 1,
          eligibility_criteria: 1,
          is_this_course_right_for_you: 1,
          categoryId: 1,
          parentCategoryId: 1,
          University: {
            _id: "$University._id",
            firstName: "$University.firstName",
            lastName: "$University.lastName",
            email: "$University.email",
            countryCode: "$University.countryCode",
            phoneNumber: "$University.phoneNumber",
            profileImage: "$University.profileImage"
          },
          likes: {
            $map: {
              input: "$likes",
              as: "like",
              in: {
                _id: "$$like._id",
                userId: "$$like.userId",
                courseId: "$$like.courseId",
                isPaidByAdmin: "$$like.isPaidByAdmin",
                status: "$$like.status",
                createdAt: "$$like.createdAt",
                updatedAt: "$$like.updatedAt",
                user: {
                  _id: "$$like.user._id",
                  firstName: "$$like.user.firstName",
                  lastName: "$$like.user.lastName",
                  email: "$$like.user.email",
                  countryCode: "$$like.user.countryCode",
                  phoneNumber: "$$like.user.phoneNumber",
                  profileImage: "$$like.user.profileImage"
                }
              }
            }
          }
        }
      }
    ])
  }


}

export default CourseRepository;
