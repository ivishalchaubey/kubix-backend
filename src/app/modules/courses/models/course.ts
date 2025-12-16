import mongoose, { Schema, model, Document, ObjectId } from "mongoose";

// Semester interface
export interface ISemester {
  title: string;
  description: string;
}

// Course interface
export interface ICourse extends Document {
  name: string;
  categoryId: ObjectId[];
  parentCategoryId: ObjectId[];
  description: string;
  image: string;
  duration: number;
  UniversityId: ObjectId;
  currency: string;
  course_fees_low: string;
  course_fees_high: string;
  course_type: string;
  semesters: ISemester[];
  eligibility_criteria: string;
  is_this_course_right_for_you: string;
}

// Semester schema
const SemesterSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
  },
  { _id: false }
);

// Course schema
const CourseSchema = new Schema<ICourse>(
  {
    name: { type: String, required: true },
    categoryId: { type: [mongoose.Schema.Types.ObjectId], required: true, ref: "Category" },
    parentCategoryId: { type: [mongoose.Schema.Types.ObjectId], required: true, ref: "Category" },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    duration: { type: Number, default: 0 },
    UniversityId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    currency: { type: String, default: "INR" },
    course_fees_low: { type: String, default: "" },
    course_fees_high: { type: String, default: "" },
    course_type: { type: String, default: "" },
    semesters: { type: [SemesterSchema], default: [] },
    eligibility_criteria: { type: String, default: "" },
    is_this_course_right_for_you: { type: String, default: "" },
  },
  { timestamps: true }
);

// Create & Export Model
export const Course = model<ICourse>("Course", CourseSchema);
