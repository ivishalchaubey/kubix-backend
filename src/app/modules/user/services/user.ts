import { Router } from "express";
import User from "../../auth/models/User.js";
import mongoose from "mongoose";
import { UserToken } from "../../auth/models/usertoken.js";
import UserRepository from "../repositories/user.js";
class UserService {
  private userRepository: UserRepository;
  constructor() {
    this.userRepository = new UserRepository();
  }

  async updateUser(userId: string, userData: any): Promise<any> {
    const updatedUser = await User.findByIdAndUpdate(userId, userData, {
      new: true,
    });
    if (!updatedUser) {
      throw new Error("User not found");
    }
    return updatedUser;
  }

  async likeCourse(userId: string, courseId: string): Promise<any> {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    if (!user.likedCourses) {
      user.likedCourses = [];
    }
    let courseObjectId = new mongoose.Types.ObjectId(courseId);

    if (user.likedCourses.includes(courseObjectId)) {
      // remove course from likedCourses
      user.likedCourses = user.likedCourses.filter(
        (id) => !id.equals(courseObjectId)
      );
      await this.userRepository.unlikeCourse(userId, courseId);
      await user.save();
    } else {
      user.likedCourses.push(courseObjectId);
      await this.userRepository.likeCourse(userId, courseId);
      await user.save();
    }
    return user;
  }

  async bookmarkCourse(userId: string, courseId: string): Promise<any> {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    if (!user.bookmarkedCourses) {
      user.bookmarkedCourses = [];
    }
    let courseObjectId = new mongoose.Types.ObjectId(courseId);
    if (user.bookmarkedCourses.includes(courseObjectId)) {
      user.bookmarkedCourses = user.bookmarkedCourses.filter(
        (id) => !id.equals(courseObjectId)
      );
      await user.save();
    } else {
      user.bookmarkedCourses.push(courseObjectId);
      await user.save();
    }
    return user;
  }

  async deleteUser(UserId: string): Promise<void> {
    const deletedUser = await User.findByIdAndDelete(UserId);
    if (!deletedUser) {
      throw new Error("User not found");
    }
  }

  async getUsers(): Promise<any[]> {
    return await User.find();
  }

  // function to get the Users based on categoryId
  async getUsersByCategory(categoryId: string): Promise<any[]> {
    return await User.find({ categoryId: categoryId }).lean();
  }

  async getLikedCourse(userId: string, filter: any): Promise<any> {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid user ID format");
      }
      const userObjectId = new mongoose.Types.ObjectId(userId);
      const user = await this.userRepository.getLikedCourse(
        userObjectId.toString()
      );
      return user || [];
    } catch (error) {
      throw error;
    }
  }

  async getBookmarkedCourses(userId: string): Promise<any> {
    const user = await User.findById(userId)
      .populate({
        path: "bookmarkedCourses",
        populate: {
          path: "UniversityId",
          select: "-password -otp -refreshToken -accessToken -emailVerificationToken -passwordResetToken -passwordResetExpires"
        }
      })
      .lean();
    if (!user) {
      throw new Error("User not found");
    }
    return user.bookmarkedCourses || [];
  }

  async updateToken(userId: string, token: number): Promise<any> {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const userToken = await UserToken.findOne({ userId: userId });
    if (!userToken) {
      throw new Error("User token not found");
    }
    let tokenValue = userToken.token - token;
    userToken.token = tokenValue;
    await userToken.save();
    await user.save();
    return userToken;
  }

  async getHomeData(userId: string): Promise<any> {
    // Get user by ID
    const user = await this.userRepository.getUserById(userId);
    
    if (!user) {
      throw new Error("User not found");
    }

    // Get user's selected categories
    const userCategories = await this.userRepository.getCategoriesByIds(user.categoryIds || []);

    // Get popular universities
    const popularUniversities = await this.userRepository.getPopularUniversities(10);

    // Get popular courses
    const popularCourses = await this.userRepository.getPopularCourses(20);

    // Get top upcoming webinars (nearest dates)
    const upcomingWebinars = await this.userRepository.getUpcomingWebinars(3);

    return {
      userCategories,
      popularUniversities,
      popularCourses,
      upcomingWebinars
    };
  }
}

export default UserService;
