import mongoose, { Schema } from "mongoose";

// Password hashing function using bcrypt


// User schema
interface ICategory {
  description: String;
  degree: String; // engineering, arts, science
  branch: String; // circuit branch ie(computer , electronics, electrical) and non-circuit branch (civil, mechanical, chemical)
  course: String; // computer science, electronics, electrical, civil, mechanical, chemical
  courseStream : String; // frontend, backend, database, operating system, data structure, algorithm , drawing engineering, etc
  subject: String; // data structure, algorithm, operating system, etc
}
const userSchema = new Schema<ICategory>(
  {
    degree: {
      type: String,
      required: [true, ""],
      trim: true 
    },
    branch: {
      type: String, 
    },
    course: {
      type: String,
      unique: true,
      lowercase: true,
    },
    courseStream: {
      type: String,
      required: [true, "Course stream is required"],
      trim: true,
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      minlength: [8, "Password must be at least 8 characters long"],
      select: false, // Don't include password in queries by default
    },
    description: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Only keep the unique index from the schema field definition above
// Removed duplicate indexes that were causing the warning

// Create and export the User model
const category = mongoose.model<ICategory>("category", userSchema);

export default category;
