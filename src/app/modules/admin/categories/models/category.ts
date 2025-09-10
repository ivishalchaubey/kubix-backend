import mongoose, { Schema, Document, ObjectId } from "mongoose";

// Correct TypeScript interface
export interface ICategory extends Document {
  _id: mongoose.Types.ObjectId;
  stream?: string;
  board?: string;
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
  // New optional fields
  soft_skills?: string[];
  checklist?: string[];
  education_10_2?: string;
  education_diploma?: string;
  education_graduation?: string;
  education_post_graduation?: string;
  myth?: string;
  reality?: string;
  pros?: string[];
  cons?: string[];
  superstar1?: string;
  superstar2?: string;
  superstar3?: string;
  related_careers?: string[];
  growth_path?: string;
  qualifying_exams?: string[];
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
    description: { type: String, required: false, default: "" },
    image: { type: String, required: false, default: "" },
    stream: { type: String, required: false, default: "" },
    board: { type: String, required: false, default: "" },
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
    // New optional fields
    soft_skills: { type: [String], default: [] },
    checklist: { type: [String], default: [] },
    education_10_2: { type: String, default: "" },
    education_diploma: { type: String, default: "" },
    education_graduation: { type: String, default: "" },
    education_post_graduation: { type: String, default: "" },
    myth: { type: String, default: "" },
    reality: { type: String, default: "" },
    pros: { type: [String], default: [] },
    cons: { type: [String], default: [] },
    superstar1: { type: String, default: "" },
    superstar2: { type: String, default: "" },
    superstar3: { type: String, default: "" },
    related_careers: { type: [String], default: [] },
    growth_path: { type: String, default: "" },
    qualifying_exams: { type: [String], default: [] },
  },
  {
    timestamps: true,
  }
);

// Create and export model
const CategoryModel = mongoose.model<ICategory>("Category", categorySchema);
export default CategoryModel;
