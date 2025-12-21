import mongoose, { Schema, model, Document, ObjectId } from "mongoose";

// Shortlist type enum
export type ShortlistType = "career" | "colleges" | "course";

// Shortlist interface
export interface IShortlist extends Document {
  userId: ObjectId;
  itemId: ObjectId;
  itemType: ShortlistType;
  createdAt: Date;
  updatedAt: Date;
}

// Shortlist schema
const ShortlistSchema = new Schema<IShortlist>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
      index: true,
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    itemType: {
      type: String,
      required: true,
      enum: ["career", "colleges", "course"],
      index: true,
    },
  },
  { timestamps: true }
);

// Compound index to ensure uniqueness of userId + itemId + itemType combination
ShortlistSchema.index({ userId: 1, itemId: 1, itemType: 1 }, { unique: true });

// Create & Export Model
export const Shortlist = model<IShortlist>("Shortlist", ShortlistSchema);

