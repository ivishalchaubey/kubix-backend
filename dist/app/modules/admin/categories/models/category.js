import mongoose, { Schema } from "mongoose";
const categorySchema = new Schema({
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
}, {
    timestamps: true,
});
const CategoryModel = mongoose.model("Category", categorySchema);
export default CategoryModel;
//# sourceMappingURL=category.js.map