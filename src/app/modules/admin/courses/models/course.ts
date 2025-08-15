import mongoose,{ Schema, model, Document , ObjectId } from "mongoose";

// 1️⃣ Define the TypeScript interface
export interface ICourse extends Document {
  name: string;
  categoryId: ObjectId[];
  parentCategoryId: ObjectId[];
  description: string;
  image: string;
  duration: string;
  UniversityId: ObjectId;
  amount: number;
  currency: string;
  chapters: number;
}

// 2️⃣ Define the Mongoose Schema
const CourseSchema = new Schema<ICourse>(
  {
    name: { type: String, required: true },
    categoryId: { type: [mongoose.Schema.Types.ObjectId], required: true },
    parentCategoryId: { type: [mongoose.Schema.Types.ObjectId], required: true },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    duration: { type: String, default: "" },
    UniversityId: { type: mongoose.Schema.Types.ObjectId, default: null },
    amount: { type: Number, default: 0 },
    currency: { type: String, default: "INR" },
    chapters: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// 3️⃣ Create & Export Model
export const Course = model<ICourse>("Course", CourseSchema);
