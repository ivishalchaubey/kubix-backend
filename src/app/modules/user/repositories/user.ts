// add user repository

import User from "../../auth/models/User.js";
import { UserCourseLiked } from "../../auth/models/usercourseliked.js";

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



}

export default UserRepository;