// add token based on userId

import mongoose, { Schema, Types } from "mongoose";
// import { IUserToken } from "../../../types/global.js";

interface IUserToken {
    _id: string;
    userId: Types.ObjectId;
    token: number;
    createdAt: Date;
    updatedAt: Date;
  }
  
const UserTokenSchema = new Schema<IUserToken>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  token: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const UserToken = mongoose.model<IUserToken>("UserToken", UserTokenSchema);
