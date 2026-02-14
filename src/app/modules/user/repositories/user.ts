// add user repository

import User from "../../auth/models/User.js";
import { UserCourseLiked } from "../../auth/models/usercourseliked.js";
import { Course } from "../../courses/models/course.js";
import Category from "../../admin/categories/models/category.js";
import { Webinar } from "../../webinar/models/webinar.model.js";

class UserRepository {
  async likeCourse(userId: string, courseId: string): Promise<any> {
    return await UserCourseLiked.create({ userId: userId, courseId: courseId, isPaidByAdmin: false, status: "active" });
  }

  async unlikeCourse(userId: string, courseId: string): Promise<any> {
    return await UserCourseLiked.findOneAndUpdate({ userId: userId, courseId: courseId, status: "active" }, { status: "inactive" });
  }

  async getLikedCourse(userId: string): Promise<any> {
    return await UserCourseLiked.find({ userId: userId, status: "active" })
      .populate({
        path: 'courseId',
        populate: {
          path: 'UniversityId',
          select: '-password -otp -refreshToken -accessToken -emailVerificationToken -passwordResetToken -passwordResetExpires'
        }
      })
      .lean();
  }

  async getUserById(userId: string): Promise<any> {
    return await User.findById(userId).lean();
  }

  async getCategoriesByIds(categoryIds: any[], limit?: number): Promise<any> {
    if (!categoryIds || categoryIds.length === 0) {
      return [];
    }
    const query = Category.find({ _id: { $in: categoryIds } });
    if (limit) {
      query.limit(limit);
    }
    return await query.lean();
  }

  async getPopularUniversities(limit: number = 10): Promise<any> {
    return await User.find({ 
      role: "university",
      status: "active" 
    })
    .limit(limit)
    .lean();
  }

  async getPopularCourses(categoryIds: any[], limit: number = 20): Promise<any> {
    const pipeline: any[] = [];

    // Filter by user's selected categories if available
    if (categoryIds && categoryIds.length > 0) {
      pipeline.push({
        $match: {
          categoryId: { $in: categoryIds },
        },
      });
    }

    pipeline.push(
      {
        $lookup: {
          from: "shortlists",
          let: { courseId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$itemId", "$$courseId"] },
                    { $eq: ["$itemType", "course"] },
                  ],
                },
              },
            },
          ],
          as: "shortlists"
        }
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
        $addFields: {
          shortlistCount: { $size: "$shortlists" },
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
        $sort: { shortlistCount: -1, likesCount: -1 }
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
          currency: 1,
          course_fees_low: 1,
          course_fees_high: 1,
          course_type: 1,
          semesters: 1,
          eligibility_criteria: 1,
          is_this_course_right_for_you: 1,
          categoryId: 1,
          parentCategoryId: 1,
          shortlistCount: 1,
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
    );

    return await Course.aggregate(pipeline);
  }

  async getUpcomingWebinars(limit: number = 3): Promise<any[]> {
    const now = new Date();

    return await Webinar.find({
      status: { $in: ["published", "live"] },
      scheduledDate: { $gte: now }
    })
      .populate({
        path: "universityId",
        select:
          "firstName lastName email collegeName location profileImage bannerYoutubeVideoLink"
      })
      .sort({ scheduledDate: 1, scheduledTime: 1, createdAt: 1 })
      .limit(limit)
      .lean();
  }
}

export default UserRepository;