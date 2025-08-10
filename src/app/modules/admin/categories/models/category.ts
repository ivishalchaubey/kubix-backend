import mongoose, { Schema, Document, ObjectId } from "mongoose";

// Correct TypeScript interface
export interface ICategory extends Document {
  _id: ObjectId; // Optional ID for the category
  order: number; // Order of the category
  name: string;
  parentId : ObjectId // Title of the category
}

// Define schema
const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true },
    parentId: { type: mongoose.Schema.Types.ObjectId, default: null , ref : "Category" },
    order: { type: Number } // 1 = Stream, 2 = Field, etc.
},
  {
    timestamps: true,
  }
);

// Create and export model
const CategoryModel = mongoose.model<ICategory>("Category", categorySchema);
export default CategoryModel;
