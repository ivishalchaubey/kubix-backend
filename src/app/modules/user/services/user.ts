
import { Router } from "express";
import  User  from "../../auth/models/User.js";

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
}

export default UserService;