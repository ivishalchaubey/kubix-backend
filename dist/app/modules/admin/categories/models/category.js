import mongoose, { Schema } from "mongoose";
const categorySchema = new Schema({
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
}, {
    timestamps: true,
});
const CategoryModel = mongoose.model("Category", categorySchema);
export default CategoryModel;
//# sourceMappingURL=category.js.map