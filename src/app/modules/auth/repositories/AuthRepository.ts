import { Types } from "mongoose";
import User from "../models/User.js";
import { IUser } from "../../../types/global.js";
import {
  UserRole,
  HttpStatus,
  API_MESSAGES,
} from "../../../constants/enums.js";
import { AppError } from "../../../middlewares/errorHandler.js";

class AuthRepository {
  /**
   * Create a new user
   */
  async createUser(userData: {
    firstName: string;
    lastName: string;
    email: string;
    dob: string;
    countryCode: string;
    phoneNumber: string;
    board: string;
    stream: string;
    password: string;
    role: UserRole;
  }): Promise<IUser> {
    // Check if email is already taken
    const isEmailTaken = await User.isEmailTaken(userData.email);
    if (isEmailTaken) {
      throw new AppError(
        API_MESSAGES.ERROR.EMAIL_ALREADY_EXISTS,
        HttpStatus.CONFLICT
      );
    }

    const user = new User(userData);
    return await user.save();
  }

  /**
   * Find user by email
   */
  async findUserByEmail(
    email: string,
    includePassword = false,
    includeOtp = true
  ): Promise<IUser | null> {
    const query = User.findOne({ email });
    if (includePassword) {
      query.select("+password");
    }
    if (includeOtp) {
      const user = await User.findOne({ email }).select("+otp");
      return user;
    }
    return await query.exec();
  }

  async findUserByEmailAndRole(
    email: string,
    role: UserRole,
    includePassword = false
  ): Promise<IUser | null> {
    const query = User.findOne({email : email , role :role });
    if (includePassword) {
      query.select("+password");
    }
    return await query.exec();
  }

  /**
   * Find user by ID
   */
  async findUserById(
    userId: string,
    includePassword = false
  ): Promise<any | null> {
    if (!Types.ObjectId.isValid(userId)) {
      return null;
    }

    const query = User.findById(userId);

    const pipeline = [
      {
        $match : { _id: new Types.ObjectId(userId) },
      },
      {
        $lookup: {
          from: "categories",
          localField: "categoryIds",
          foreignField: "_id",
          as: "categories",
        },
      },
      {
        $unwind: {
          path: "$categories",
          preserveNullAndEmptyArrays: true, // Keep users without categories
        },
      },
      {
        $lookup: {
          from :"courses",
          localField: "categories.courseIds",
          foreignField: "_id",
          as: "courses",
        },
      },
      {
        $project: {
          _id: 1,
          firstName: 1,
          lastName: 1,
          email: 1,
          dob: 1,
          countryCode: 1,
          phoneNumber: 1,
          board: 1,
          stream: 1,
          role: 1,
          isEmailVerified: 1,
          courses:1,
          categories: 1, // Include categories
        },
      },
    ];

    if (includePassword) {
      query.select("+password");
    }
    return await User.aggregate(pipeline);

  }

  /**
   * Update user by ID
   */
  async updateUserById(
    userId: string,
    updateData: Partial<IUser>
  ): Promise<IUser | null> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new AppError(
        API_MESSAGES.ERROR.USER_NOT_FOUND,
        HttpStatus.NOT_FOUND
      );
    }

    return await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );
  }

  /**
   * send otp
   */
  async setOtp(
    email: string,
    otp: string
  ): Promise<IUser | any> {  
    if (!email) {
      throw new AppError(
        API_MESSAGES.ERROR.USER_NOT_FOUND,
        HttpStatus.NOT_FOUND
      );
    }

     await User.findOneAndUpdate(
      {email: email},
      { otp , otpExpires: Date.now() + 10 * 60 * 1000 }, // OTP expires in 10 minutes
      { new: true, runValidators: true }
    );
    return await User.findOne({email: email});
  }

  /**
   * Delete user by ID
   */
  async deleteUserById(userId: string): Promise<IUser | null> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new AppError(
        API_MESSAGES.ERROR.USER_NOT_FOUND,
        HttpStatus.NOT_FOUND
      );
    }

    return await User.findByIdAndDelete(userId);
  }


  async setPhoneOtp(
    phone: string,
    otp: string
  ): Promise<IUser | any> {
    if (!phone) {
      throw new AppError(
        API_MESSAGES.ERROR.USER_NOT_FOUND,
        HttpStatus.NOT_FOUND
      );
    }

    await User.findOneAndUpdate(
      { phoneNumber: phone },
      { otp , otpExpires: Date.now() + 10 * 60 * 1000 }, // OTP expires in 10 minutes
      { new: true, runValidators: true }
    );
    return await User.findOne({ phoneNumber: phone });
  }


  async clearOtp(
    email: string  
  ): Promise<IUser | null> {
    let data = await User.findOneAndUpdate
      ({email : email},
        { otp: "" },
        { new: true, runValidators: true }
      );

      return data;
  };

  async findUserByPhone(
    phone: string,): Promise<IUser | null> {
  let userData = await User.findOne({ phoneNumber: phone }).select('otp firstName lastName _id otpExpires dob email ').lean();
return userData;  
}; 

    async clearPhoneOtp(
    phone: string  
  ): Promise<IUser | null> {
    let data = await User.findOneAndUpdate
      ({phoneNumber : phone},
        { otp: "" },
        { new: true, runValidators: true }
      );

      return data;
  };

  /**
   * 
   * 
   * Find user by email verification token
   */
  async findUserByEmailVerificationToken(token: string): Promise<IUser | null> {
    return await User.findOne({ emailVerificationToken: token });
  }

  /**
   * Find user by password reset token
   */
  async findUserByPasswordResetToken(token: string): Promise<IUser | null> {
    return await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    });
  }

  /**
   * Update user's password
   */
  async updateUserPassword(
    userId: string,
    newPassword: string
  ): Promise<IUser | null> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new AppError(
        API_MESSAGES.ERROR.USER_NOT_FOUND,
        HttpStatus.NOT_FOUND
      );
    }

    return await User.findByIdAndUpdate(
      userId,
      {
        password: newPassword,
        passwordResetToken: undefined,
        passwordResetExpires: undefined,
      },
      { new: true, runValidators: true }
    );
  }

  /**
   * Set email verification token
   */
  async setEmailVerificationToken(
    userId: string,
    token: string
  ): Promise<IUser | null> {
    return await User.findByIdAndUpdate(
      userId,
      { emailVerificationToken: token },
      { new: true }
    );
  }

  /**
   * Set password reset token
   */
  async setPasswordResetToken(
    userId: string,
    token: string,
    expires: Date
  ): Promise<IUser | null> {
    return await User.findByIdAndUpdate(
      userId,
      {
        passwordResetToken: token,
        passwordResetExpires: expires,
      },
      { new: true }
    );
  }

  /**
   * Verify user's email
   */
  async verifyUserEmail(userId: string): Promise<IUser | null> {
    return await User.findByIdAndUpdate(
      userId,
      {
        isEmailVerified: true,
        emailVerificationToken: undefined,
      },
      { new: true }
    );
  }

  /**
   * Update user's refresh token
   */
  async updateRefreshToken(
    userId: string,
    refreshToken: string
  ): Promise<IUser | null> {
    return await User.findByIdAndUpdate(
      userId,
      { refreshToken },
      { new: true }
    );
  }

  async updateAccessToken(
    userId: string,
    accessToken: string
  ): Promise<any | null> {
    let x=  await User.findByIdAndUpdate(
      userId,
      { accessToken },
      { new: true }
    );

    return x;
  }

  /**
   * Clear user's refresh token
   */
  async clearRefreshToken(userId: string): Promise<IUser | null> {
    return await User.findByIdAndUpdate(
      userId,
      { refreshToken: undefined },
      { new: true }
    );
  }

  /**
   * Check if user exists by ID
   */
  async userExists(userId: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(userId)) {
      return false;
    }

    const user = await User.findById(userId).select("_id");
    return !!user;
  }
}

export default AuthRepository;
