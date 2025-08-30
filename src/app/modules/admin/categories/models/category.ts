import mongoose, { Schema, Document, ObjectId } from "mongoose";

// Correct TypeScript interface
export interface ICategory extends Document {
  _id : ObjectId;
  name: string;
  parentId?: mongoose.Types.ObjectId | null;
  description?: string;
  image?: string;
  order: number;
  isLeafNode?: boolean;
  a_day_in_life?: string;
  core_skills?: {
    technical: string[];
    soft: string[];
  };
  educational_path?: {
    ug_courses: string[];
    pg_courses: string[];
  };
  salary_range?: string;
  future_outlook?: {
    demand: string;
    reason: string;
  };
}

// Define schema
const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true },
    parentId: { type: mongoose.Schema.Types.ObjectId, default: null , ref : "Category" },
    description: { type: String, required: false , default : "" },
    image: { type: String, required: false , default : "" },
    order: { type: Number }, // 1 = Stream, 2 = Field, etc.
    isLeafNode: { type: Boolean, default: false },
    a_day_in_life: { type: String, default: "" },
    core_skills: {
      technical: { type: [String], default: [] },
      soft: { type: [String], default: [] },
    },
    educational_path: {
      ug_courses: { type: [String], default: [] },
      pg_courses: { type: [String], default: [] },
    },
    salary_range: { type: String, default: "" },
    future_outlook: {
      demand: { type: String, default: "" },
      reason: { type: String, default: "" },
    },
  },
  {
    timestamps: true,
  }
);


// Create and export model
const CategoryModel = mongoose.model<ICategory>("Category", categorySchema);
export default CategoryModel;
