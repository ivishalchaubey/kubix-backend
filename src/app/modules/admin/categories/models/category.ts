import mongoose, { Schema, Document } from "mongoose";

// Correct TypeScript interface
export interface ICategory extends Document {
  description: string;
  degree: string;
  branch: string;
  course: string;
  courseStream: string;
  subject: string;
}

// Define schema
const categorySchema = new Schema<ICategory>(
  {
    degree: {
      type: String,
      required: [true, "Degree is required"],
      trim: true,
    },
    branch: {
      type: String,
      trim: true,
    },
    course: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    courseStream: {
      type: String,
      required: [true, "Course stream is required"],
      trim: true,
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      minlength: [3, "Subject must be at least 3 characters long"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create and export model
const CategoryModel = mongoose.model<ICategory>("Category", categorySchema);
export default CategoryModel;
