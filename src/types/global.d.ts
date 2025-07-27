import { Request } from "express";
import { Model } from "mongoose";
import { UserRole, TokenType, HttpStatus } from "../constants/enums.js";

// User related types
export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
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
  user?: IUser;
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
      user?: IUser;
    }
  }
}
