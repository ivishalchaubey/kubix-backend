import mongoose, { Schema, Document } from "mongoose";

export interface IPhoneOtp extends Document {
  phone: string;
  otp: string;
  otpExpires: Date;
  createdAt: Date;
}

const phoneOtpSchema = new Schema<IPhoneOtp>(
  {
    phone: { type: String, required: true, index: true },
    otp: { type: String, required: true },
    otpExpires: { type: Date, required: true },
  },
  { timestamps: true },
);

// TTL index: auto-delete expired documents
phoneOtpSchema.index({ otpExpires: 1 }, { expireAfterSeconds: 0 });

const PhoneOtp = mongoose.model<IPhoneOtp>("PhoneOtp", phoneOtpSchema);
export default PhoneOtp;
