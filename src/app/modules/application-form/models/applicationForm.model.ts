import mongoose, { Schema, model, Document, ObjectId } from "mongoose";

// Application Form interface
export interface IApplicationForm extends Document {
  userId: ObjectId;
  collegeIds: ObjectId[];
  // Personal Information
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  // Contact Information
  phoneCountryCode: string;
  phoneNumber: string;
  permanentAddress?: string;
  // Education Information
  tenthPercentage: string;
  tenthMarksheet: string;
  twelfthStatus?: string;
  twelfthPercentage?: string;
  twelfthSchoolName?: string;
  twelfthMarksheet?: string;
  passingYear?: string;
  // Guardian Information
  guardianName: string;
  guardianOccupation?: string;
  guardianPhoneCountryCode: string;
  guardianPhoneNumber: string;
  // Metadata
  status: string;
  submittedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Application Form schema
const ApplicationFormSchema = new Schema<IApplicationForm>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
      unique: true,
      index: true,
    },
    collegeIds: {
      type: [mongoose.Schema.Types.ObjectId],
      required: true,
      ref: "User",
      default: [],
    },
    // Personal Information
    firstName: {
      type: String,
      required: true,
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    middleName: {
      type: String,
      trim: true,
      maxlength: [50, "Middle name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    dateOfBirth: {
      type: String,
      required: true,
      match: [
        /^\d{4}-\d{2}-\d{2}$/,
        "Date of birth must be in YYYY-MM-DD format",
      ],
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email"],
    },
    // Contact Information
    phoneCountryCode: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    permanentAddress: {
      type: String,
      trim: true,
      maxlength: [500, "Address cannot exceed 500 characters"],
    },
    // Education Information
    tenthPercentage: {
      type: String,
      required: true,
      trim: true,
    },
    tenthMarksheet: {
      type: String,
      required: true,
      trim: true,
    },
    twelfthStatus: {
      type: String,
      trim: true,
      enum: ["passed", "failed", "pending", null],
    },
    twelfthPercentage: {
      type: String,
      trim: true,
    },
    twelfthSchoolName: {
      type: String,
      trim: true,
      maxlength: [200, "School name cannot exceed 200 characters"],
    },
    twelfthMarksheet: {
      type: String,
      trim: true,
    },
    passingYear: {
      type: String,
      trim: true,
      match: [/^\d{4}$/, "Passing year must be a 4-digit year"],
    },
    // Guardian Information
    guardianName: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, "Guardian name cannot exceed 100 characters"],
    },
    guardianOccupation: {
      type: String,
      trim: true,
      maxlength: [100, "Guardian occupation cannot exceed 100 characters"],
    },
    guardianPhoneCountryCode: {
      type: String,
      required: true,
      trim: true,
    },
    guardianPhoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    // Metadata
    status: {
      type: String,
      enum: ["draft", "submitted", "under_review", "accepted", "rejected"],
      default: "draft",
    },
    submittedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Index to ensure one application per user
ApplicationFormSchema.index({ userId: 1 }, { unique: true });

// Create & Export Model
export const ApplicationForm = model<IApplicationForm>(
  "ApplicationForm",
  ApplicationFormSchema
);
