
import { Router } from "express";
import  User  from "../../auth/models/User.js";
import mongoose from "mongoose";
import { UserToken } from "../../auth/models/usertoken.js";
class UserService {
  
  async updateUser(userId: string, userData: any): Promise<any> {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      userData,
      { new: true }
    );
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
    
    if(user.likedCourses.includes(courseObjectId)) {
      // remove course from likedCourses
      user.likedCourses = user.likedCourses.filter((id) => !id.equals(courseObjectId));
      await user.save();

    }

    else{
      user.likedCourses.push(courseObjectId);
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
    if(user.bookmarkedCourses.includes(courseObjectId)) {
      user.bookmarkedCourses = user.bookmarkedCourses.filter((id) => !id.equals(courseObjectId));
      await user.save();
    }
    else{
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

  async getLikedCOurse(userId: string, filter: any): Promise<any> {
    const user = await User.findById(userId).populate('likedCourses').lean();
    if (!user) {
      throw new Error("User not found");
    }
    return user.likedCourses || [];
  }

  async getBookmarkedCourses(userId: string): Promise<any> {
    const user = await User.findById(userId).populate('bookmarkedCourses').lean();
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

}

export default UserService;