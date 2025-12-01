import { Router } from "express";
import User from "../../auth/models/User.js";
import mongoose from "mongoose";
import { UserToken } from "../../auth/models/usertoken.js";
import UserRepository from "../repositories/user.js";
import InAppBannerRepository from "../../in-app-banner/repositories/inAppBanner.repository.js";
class UserService {
  private userRepository: UserRepository;
  private inAppBannerRepository: InAppBannerRepository;
  constructor() {
    this.userRepository = new UserRepository();
    this.inAppBannerRepository = new InAppBannerRepository();
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
          select:
            "-password -otp -refreshToken -accessToken -emailVerificationToken -passwordResetToken -passwordResetExpires",
        },
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
    // Get user by ID first (required for categoryIds)
    const user = await this.userRepository.getUserById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    // Fetch all independent data in parallel for better performance
    const [
      userCategories,
      popularUniversities,
      popularCourses,
      upcomingWebinars,
      bannerSection,
    ] = await Promise.all([
      // Get user's selected categories (max 10)
      this.userRepository.getCategoriesByIds(user.categoryIds || [], 10),
      // Get popular universities (only 3)
      this.userRepository.getPopularUniversities(3),
      // Get popular courses (only 3)
      this.userRepository.getPopularCourses(3),
      // Get top upcoming webinars (max 10)
      this.userRepository.getUpcomingWebinars(10),
      // Get top published banners (max 10)
      this.inAppBannerRepository.getTopPublishedBanners(10),
    ]);

    return {
      userCategories,
      popularUniversities,
      popularCourses,
      upcomingWebinars,
      bannerSection,
    };
  }
}

export default UserService;
