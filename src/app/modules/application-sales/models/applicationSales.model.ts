import mongoose, { Schema, model, Document, ObjectId } from "mongoose";

// Define the TypeScript interface
export interface IApplicationSales extends Document {
  // University Details
  universityId: ObjectId;
  universityName: string;
  
  // Application Details
  applicationFormLink: string;
  paymentLink: string;
  
  // Point of Contact
  pocName: string;
  pocPhone: string;
  pocEmail: string;
  
  // Admission Details
  admissionChairperson?: string;
  
  // Resources
  freebies?: string[];
  
  // Status & Tracking
  status: "draft" | "published" | "active" | "closed";
  coinsPerApplication: number;
  applicationCount: number;
  
  // Timestamps
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Define the Mongoose Schema
const ApplicationSalesSchema = new Schema<IApplicationSales>(
  {
    // University Details
    universityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    universityName: {
      type: String,
      required: true,
      trim: true
    },
    
    // Application Details
    applicationFormLink: {
      type: String,
      required: true,
      trim: true
    },
    paymentLink: {
      type: String,
      required: true,
      trim: true
    },
    
    // Point of Contact
    pocName: {
      type: String,
      required: true,
      trim: true
    },
    pocPhone: {
      type: String,
      required: true,
      trim: true
    },
    pocEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    
    // Admission Details
    admissionChairperson: {
      type: String,
      required: false,
      trim: true
    },
    
    // Resources
    freebies: {
      type: [String],
      default: []
    },
    
    // Status & Tracking
    status: {
      type: String,
      enum: ["draft", "published", "active", "closed"],
      default: "draft"
    },
    coinsPerApplication: {
      type: Number,
      default: 3000
    },
    applicationCount: {
      type: Number,
      default: 0,
      min: 0
    },
    
    // Published timestamp
    publishedAt: {
      type: Date,
      required: false
    }
  },
  { timestamps: true }
);

// Add indexes for better query performance
ApplicationSalesSchema.index({ universityId: 1, status: 1 });
ApplicationSalesSchema.index({ status: 1 });

// Create & Export Model
export const ApplicationSales = model<IApplicationSales>("ApplicationSales", ApplicationSalesSchema);

