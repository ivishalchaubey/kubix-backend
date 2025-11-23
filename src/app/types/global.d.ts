import { Request } from "express";
import { Model } from "mongoose";
import { UserRole, TokenType, HttpStatus } from "../constants/enums.js";
import { ObjectId } from "mongodb";   
// User related types
export interface IUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  dob: string; // Assuming ISO date string
  countryCode: string;
  otp: string;
  otpExpires: Date; // Optional, used for OTP expiration
  phoneNumber: string;
  categoryIds: ObjectId[];
  likedCourses: ObjectId[];
  bookmarkedCourses: ObjectId[];
  board?: string;
  otherBoardName?: string;
  stream?: string;
  otherStreamName?: string;
  grade?: string;
  yearOfPassing?: string;
  password: string;
  role: UserRole;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  refreshToken?: string;
  accessToken?: string;
  profileImage?: string;
  collegeName?: string;
  collegeCode?: string;
  location?: string;
  email?: string;
  countryCode?: string;
  phoneNumber?: string;
  address?: string;
  specialization?: string;
  description?: string;
  bannerYoutubeVideoLink?: string;
  website?: string;
  bannerImage?: string;
  state?: string;
  city?: string;
  foundedYear?: string;
  courses?: Array<{
    courseName: string;
    courseDuration: string;
  }>;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}


export interface IUserToken {
  _id: string;
  userId: ObjectId;
  token: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserReq {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: string;
  role: UserRole;
  stream?: string;
  board?: string;
}

export interface IUserMethods {
  isPasswordMatch(password: string): Promise<boolean>;
  generateAuthTokens(): Promise<TokenResponse>;
}

export interface IUserModel extends Model<IUser, {}, IUserMethods> {
  isEmailTaken(email: string, excludeUserId?: string): Promise<boolean>;
}

// Authentication types
export interface TokenPayload {
  sub: string;
  iat: number;
  exp: number;
  type: TokenType;
}

export interface TokenResponse {
  access: {
    token: string;
    expires: Date;
  };
  refresh: {
    token: string;
    expires: Date;
  };
}

export interface AuthRequest extends Request {
  user?: IUserReq;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  statusCode: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: PaginationMeta;
}

// Query types
export interface QueryOptions {
  sortBy?: string;
  limit?: number;
  page?: number;
  populate?: string;
  select?: string;
}

// Validation types
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// Payment related types
export interface IPayment {
  _id: string;
  userId: ObjectId;
  
  // Stripe IDs
  stripePaymentId: string;
  stripeSessionId: string;
  stripePaymentIntentId?: string;
  stripeCustomerId?: string;
  stripePaymentMethodId?: string;
  
  // Payment amount and currency
  amount: number; // in cents
  currency: 'inr' | 'usd' | 'eur' | 'gbp';
  netAmount: number; // amount after processing fees
  
  // Token allocation
  tokens: number; // calculated based on price
  
  // Payment status and processing
  status: 'succeeded' | 'failed' | 'pending' | 'canceled' | 'refunded';
  
  // Payment method details
  paymentMethod?: {
    type: 'card' | 'bank_transfer' | 'wallet' | 'upi' | 'netbanking';
    last4?: string;
    brand?: string;
    expMonth?: number;
    expYear?: number;
  };
  
  // Customer information
  customerEmail?: string;
  customerName?: string;
  customerPhone?: string;
  
  // Transaction details
  transactionId?: string;
  receiptNumber?: string;
  receiptUrl?: string;
  
  // Payment processing details
  processingFee: number;
  
  // Payment timing
  paidAt?: Date;
  failedAt?: Date;
  refundedAt?: Date;
  
  // Additional metadata
  description?: string;
  metadata?: Map<string, string> | Record<string, string>;
  
  // Refund information
  refundAmount: number;
  refundReason?: string;
  
  // IP and location tracking
  ipAddress?: string;
  userAgent?: string;
  
  // Risk assessment
  riskScore?: number;
  riskLevel: 'low' | 'medium' | 'high';
  
  // Payment source tracking
  source: 'web' | 'mobile' | 'api' | 'admin';
  
  // Related entities
  courseId?: ObjectId;
  subscriptionId?: ObjectId;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface IPaymentMethods {
  // Add any instance methods if needed
}

export interface IPaymentModel extends Model<IPayment, {}, IPaymentMethods> {
  // Add any static methods if needed
}

// Error types
export interface CustomError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

// Re-export enums for convenience
export { UserRole, TokenType, HttpStatus };

// Module augmentation for Express Request
declare global {
  namespace Express {
    interface Request {
      user?: IUserReq;
    }
  }
}
