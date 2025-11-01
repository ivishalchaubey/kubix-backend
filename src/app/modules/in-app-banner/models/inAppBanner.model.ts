import mongoose, { Schema, model, Document } from "mongoose";

// Define the TypeScript interface
export interface IInAppBanner extends Document {
  title: string;
  description: string;
  imageUrl?: string;
  actionUrl?: string;
  priority: number;
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Define the Mongoose Schema
const InAppBannerSchema = new Schema<IInAppBanner>(
  {
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
      maxlength: 1000
    },
    imageUrl: { 
      type: String, 
      required: false,
      trim: true
    },
    actionUrl: { 
      type: String, 
      required: false,
      trim: true
    },
    priority: { 
      type: Number, 
      default: 0,
      min: 0,
      max: 100
    },
    isActive: { 
      type: Boolean, 
      default: true 
    },
    startDate: { 
      type: Date, 
      required: false 
    },
    endDate: { 
      type: Date, 
      required: false 
    }
  },
  { timestamps: true }
);

// Add index for better query performance
InAppBannerSchema.index({ isActive: 1, priority: -1 });

// Create & Export Model
export const InAppBanner = model<IInAppBanner>("InAppBanner", InAppBannerSchema);
