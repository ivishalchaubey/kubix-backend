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
  
//   get courses by user ID
  getUserCourses = async (
  userId: string
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
    user.categoryIds.map((categoryId: Types.ObjectId) => 
      Course.find({ categoryId }).populate("UniversityId") // populate UniversityId field with name
    )
  );

  // ✅ Flatten results
  const courses = coursesArrays.flat();

  return courses;
};



}

export default CourseRepository;
