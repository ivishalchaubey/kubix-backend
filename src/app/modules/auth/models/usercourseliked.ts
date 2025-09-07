// add token based on userId

import mongoose, { Schema, Types } from "mongoose";
// import { IUserToken } from "../../../types/global.js";

interface IUserCourseLiked {
    _id: string;
    userId: Types.ObjectId;
    courseId: Types.ObjectId;
    isPaidByAdmin: boolean;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  }
  
const UserCourseLikedSchema = new Schema<IUserCourseLiked>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
  isPaidByAdmin: { type: Boolean, default: false },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const UserCourseLiked = mongoose.model<IUserCourseLiked>("UserCourseLiked", UserCourseLikedSchema);
