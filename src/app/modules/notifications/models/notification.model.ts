import mongoose, { Schema, model, Document, ObjectId } from "mongoose";

// 1️⃣ Define the TypeScript interface
export interface INotification extends Document {
  title: string;
  content: string;
  datetime: Date;
  isSentToAll: boolean;
  userId?: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// 2️⃣ Define the Mongoose Schema
const NotificationSchema = new Schema<INotification>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    datetime: { type: Date, required: true, default: Date.now },
    isSentToAll: { type: Boolean, default: false },
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: false,
    },
  },
  { timestamps: true }
);

// 3️⃣ Create & Export Model
export const Notification = model<INotification>("Notification", NotificationSchema);
