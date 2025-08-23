
import { Router } from "express";
import  User  from "../../auth/models/User.js";
import mongoose from "mongoose";
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
}

export default UserService;