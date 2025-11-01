import mongoose, { Schema, model, Document, ObjectId } from "mongoose";

// Define the TypeScript interface
export interface IWebinar extends Document {
  // University Details
  universityId: ObjectId;
  universityName: string;
  
  // Webinar Details
  title: string;
  description: string;
  
  // Course & Target Audience
  courseDetails: string;
  targetAudience: string;
  tags: string[];
  domains: string[];
  
  // Speaker Details
  speakerName: string;
  speakerPhoto?: string;
  speakerBio?: string;
  
  // Schedule
  scheduledDate: Date;
  scheduledTime: string;
  duration: number;
  
  // Links
  webinarLink: string;
  
  // Point of Contact
  pocName: string;
  pocPhone: string;
  pocEmail: string;
  
  // Admission Chairperson
  admissionChairperson?: string;
  
  // Resources
  freebies?: string[];
  logo?: string;
  
  // Status & Payment
  status: "draft" | "published" | "live" | "completed" | "cancelled";
  coinsDeducted: boolean;
  coinsAmount: number;
  
  // Timestamps
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Define the Mongoose Schema
const WebinarSchema = new Schema<IWebinar>(
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
    
    // Webinar Details
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000
    },
    
    // Course & Target Audience
    courseDetails: {
      type: String,
      required: true,
      trim: true
    },
    targetAudience: {
      type: String,
      required: true,
      trim: true
    },
    tags: {
      type: [String],
      default: []
    },
    domains: {
      type: [String],
      default: []
    },
    
    // Speaker Details
    speakerName: {
      type: String,
      required: true,
      trim: true
    },
    speakerPhoto: {
      type: String,
      required: false
    },
    speakerBio: {
      type: String,
      required: false,
      maxlength: 1000
    },
    
    // Schedule
    scheduledDate: {
      type: Date,
      required: true
    },
    scheduledTime: {
      type: String,
      required: true
    },
    duration: {
      type: Number,
      required: true,
      min: 15,
      max: 300
    },
    
    // Links
    webinarLink: {
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
    
    // Admission Chairperson
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
    logo: {
      type: String,
      required: false
    },
    
    // Status & Payment
    status: {
      type: String,
      enum: ["draft", "published", "live", "completed", "cancelled"],
      default: "draft"
    },
    coinsDeducted: {
      type: Boolean,
      default: false
    },
    coinsAmount: {
      type: Number,
      default: 5000
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
WebinarSchema.index({ universityId: 1, status: 1 });
WebinarSchema.index({ scheduledDate: 1 });
WebinarSchema.index({ status: 1, scheduledDate: -1 });

// Create & Export Model
export const Webinar = model<IWebinar>("Webinar", WebinarSchema);

