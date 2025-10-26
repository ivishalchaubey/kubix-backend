// add user repository

import User from "../../auth/models/User.js";
import { UserCourseLiked } from "../../auth/models/usercourseliked.js";
import { Course } from "../../courses/models/course.js";
import Category from "../../admin/categories/models/category.js";

class UserRepository {
  async likeCourse(userId: string, courseId: string): Promise<any> {
    return await UserCourseLiked.create({ userId: userId, courseId: courseId, isPaidByAdmin: false, status: "active" });
  }

  async unlikeCourse(userId: string, courseId: string): Promise<any> {
    return await UserCourseLiked.findOneAndUpdate({ userId: userId, courseId: courseId, status: "active" }, { status: "inactive" });
  }

  async getLikedCourse(userId: string): Promise<any> {
    return await UserCourseLiked.find({ userId: userId, status: "active" }).populate('courseId').lean();
  }

  async getUserById(userId: string): Promise<any> {
    return await User.findById(userId).lean();
  }

  async getCategoriesByIds(categoryIds: any[]): Promise<any> {
    if (!categoryIds || categoryIds.length === 0) {
      return [];
    }
    return await Category.find({ _id: { $in: categoryIds } }).lean();
  }

  async getPopularUniversities(limit: number = 10): Promise<any> {
    return await User.find({ 
      role: "university",
      status: "active" 
    })
    .select('firstName lastName email profileImage collegeName collegeCode location')
    .limit(limit)
    .lean();
  }

  async getPopularCourses(limit: number = 20): Promise<any> {
    return await Course.aggregate([
      {
        $lookup: {
          from: "usercourselikeds",
          localField: "_id",
          foreignField: "courseId",
          as: "likes"
        }
      },
      {
        $addFields: {
          likesCount: {
            $size: {
              $filter: {
                input: "$likes",
                as: "like",
                cond: { $eq: ["$$like.status", "active"] }
              }
            }
          }
        }
      },
      {
        $match: {
          likesCount: { $gt: 0 }
        }
      },
      {
        $sort: { likesCount: -1 }
      },
      {
        $limit: limit
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
        $unwind: {
          path: "$University",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          image: 1,
          duration: 1,
          amount: 1,
          currency: 1,
          chapters: 1,
          likesCount: 1,
          University: {
            _id: "$University._id",
            firstName: "$University.firstName",
            lastName: "$University.lastName",
            collegeName: "$University.collegeName",
            profileImage: "$University.profileImage"
          }
        }
      }
    ]);
  }
}

export default UserRepository;