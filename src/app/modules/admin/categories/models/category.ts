import mongoose, { Schema, Document, ObjectId } from "mongoose";

// Category interface
export interface ICategory extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  parentId?: mongoose.Types.ObjectId | null;
  description?: string;
  image?: string;
  order: number;
  isLeafNode?: boolean;
  salary_range?: string;
  qualifying_exams?: string[];
  pros?: string[];
  cons?: string[];
  myth?: string;
  superstar1?: string;
  superstar2?: string;
  superstar3?: string;
  reality?: string;
  related_careers?: mongoose.Types.ObjectId[];
  checklist?: string[];
  technical_skills?: string[];
  soft_skills?: string[];
  potential_earnings?: string[];
  future_growth?: string;
  a_day_in_life?: string;
  growth_path?: string;
}

// Define schema
const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      ref: "Category",
    },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    order: { type: Number },
    isLeafNode: { type: Boolean, default: false },
    salary_range: { type: String, default: "" },
    qualifying_exams: { type: [String], default: [] },
    pros: { type: [String], default: [] },
    cons: { type: [String], default: [] },
    myth: { type: String, default: "" },
    superstar1: { type: String, default: "" },
    superstar2: { type: String, default: "" },
    superstar3: { type: String, default: "" },
    reality: { type: String, default: "" },
    related_careers: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
      ref: "Category",
    },
    checklist: { type: [String], default: [] },
    technical_skills: { type: [String], default: [] },
    soft_skills: { type: [String], default: [] },
    potential_earnings: { type: [String], default: [] },
    future_growth: { type: String, default: "" },
    a_day_in_life: { type: String, default: "" },
    growth_path: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

// Create and export model
const CategoryModel = mongoose.model<ICategory>("Category", categorySchema);
export default CategoryModel;
