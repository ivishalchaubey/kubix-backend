import mongoose, { Schema, Document, ObjectId } from "mongoose";

// Correct TypeScript interface
export interface ICategory extends Document {
  _id: string; // Optional ID for the category
  description: string;
  order: number; // Order of the category
  title: string;
  parentId : ObjectId // Title of the category
}

// Define schema
const categorySchema = new Schema<ICategory>(
  {
    title: {
      type: String,
      trim: true,
    },
    parentId: {
      type: mongoose.Types.ObjectId,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    order: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

// Create and export model
const CategoryModel = mongoose.model<ICategory>("Category", categorySchema);
export default CategoryModel;
