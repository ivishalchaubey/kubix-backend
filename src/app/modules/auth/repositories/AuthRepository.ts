import { Types } from "mongoose";
import User from "../models/User.js";
import { UserToken } from "../models/usertoken.js";
import { IUser, IUserToken } from "../../../types/global.js";
import CourseService from "../../courses/services/course.js";
import {
  UserRole,
  HttpStatus,
  API_MESSAGES,
} from "../../../constants/enums.js";
import { AppError } from "../../../middlewares/errorHandler.js";

class AuthRepository {
  private courseService: CourseService;
  constructor() {
    this.courseService = new CourseService();
  }
  /**
   * Create a new user
   */
  async createUser(userData: {
    firstName: string;
    lastName: string;
    email: string;
    dob?: string;
    countryCode?: string;
    phoneNumber?: string;
    board?: string;
    otherBoardName?: string;
    stream?: string;
    otherStreamName?: string;
    grade?: string;
    yearOfPassing?: string;
    password: string;
    role: UserRole;
    profileImage?: string;
    collegeName?: string;
    collegeCode?: string;
    location?: string;
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
   * Check if email is available (not already taken)
   */
  async checkEmailAvailability(email: string): Promise<boolean> {
    const isTaken = await User.isEmailTaken(email);
    return !isTaken;
  }

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
    const query = User.findOne({ email: email, role: role });
    if (includePassword) {
      query.select("+password");
    }
    return await query.exec();
  }

  async findUserToken(userId: string): Promise<IUserToken> {
    if (!Types.ObjectId.isValid(userId)) {
      return {
        _id: "",
        userId: new Types.ObjectId(userId),
        token: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
    // const userId = new Types.ObjectId(userId);

    let userTokenData = await UserToken.findOne({ userId: userId });
    if (userTokenData) {
      return userTokenData;
    }

    // create a new user token with 0 token
    let newUserToken = new UserToken({
      userId: userId,
      token: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await newUserToken.save();
    return newUserToken;
  }

  getUserCourses = async (userId: string): Promise<any | null> => {
    if (!Types.ObjectId.isValid(userId)) {
      throw new AppError(
        API_MESSAGES.ERROR.USER_NOT_FOUND,
        HttpStatus.NOT_FOUND
      );
    }

    const user = await User.findById(userId).lean();

    if (!user) {
      throw new AppError(
        API_MESSAGES.ERROR.USER_NOT_FOUND,
        HttpStatus.NOT_FOUND
      );
    }

    // ✅ Use Promise.all for async loops
    const coursesArrays = await Promise.all(
      user.categoryIds.map((categoryId: Types.ObjectId) =>
        this.courseService.getCoursesByCategory(categoryId.toString())
      )
    );

    // Flatten the array of arrays
    const courses = coursesArrays.flat();

    // You can attach courses to user object if you want
    return courses;
  };

  /**
   * Find user by ID
   */
  async findUserById(
    userId: string,
    includePassword = false,
    includeAllFields = false
  ): Promise<any | null> {
    if (!Types.ObjectId.isValid(userId)) {
      return null;
    }

    const pipeline: any[] = [
      {
        $match: { _id: new Types.ObjectId(userId) },
      },
      {
        $lookup: {
          from: "categories",
          localField: "categoryIds",
          foreignField: "_id",
          as: "categories",
        },
      },
    ];

    // If includeAllFields is true, don't add $project to get all fields
    if (!includeAllFields) {
      pipeline.push({
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
          courses: 1,
          categories: 1,
        },
      });
    } else {
      // For university users, include all fields except sensitive ones
      pipeline.push({
        $project: {
          password: 0,
          refreshToken: 0,
          accessToken: 0,
          emailVerificationToken: 0,
          passwordResetToken: 0,
          passwordResetExpires: 0,
          __v: 0,
          otp: 0,
          otpExpires: 0,
        },
      });
    }

    let result = await User.aggregate(pipeline);
    return result[0] || null;
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
  async setOtp(email: string, otp: string): Promise<IUser | any> {
    if (!email) {
      throw new AppError(
        API_MESSAGES.ERROR.USER_NOT_FOUND,
        HttpStatus.NOT_FOUND
      );
    }

    await User.findOneAndUpdate(
      { email: email },
      { otp, otpExpires: Date.now() + 10 * 60 * 1000 }, // OTP expires in 10 minutes
      { new: true, runValidators: true }
    );
    return await User.findOne({ email: email });
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

  async setPhoneOtp(phone: string, otp: string): Promise<IUser | any> {
    if (!phone) {
      throw new AppError(
        API_MESSAGES.ERROR.USER_NOT_FOUND,
        HttpStatus.NOT_FOUND
      );
    }

    await User.findOneAndUpdate(
      { phoneNumber: phone },
      { otp, otpExpires: Date.now() + 10 * 60 * 1000 }, // OTP expires in 10 minutes
      { new: true, runValidators: true }
    );
    return await User.findOne({ phoneNumber: phone });
  }

  async clearOtp(email: string): Promise<IUser | null> {
    let data = await User.findOneAndUpdate(
      { email: email },
      { otp: "" },
      { new: true, runValidators: true }
    );

    return data;
  }

  async findUserByPhone(phone: string): Promise<IUser | null> {
    let userData = await User.findOne({ phoneNumber: phone })
      .select("otp firstName lastName _id otpExpires dob email ")
      .lean();
    return userData;
  }

  async clearPhoneOtp(phone: string): Promise<IUser | null> {
    let data = await User.findOneAndUpdate(
      { phoneNumber: phone },
      { otp: "" },
      { new: true, runValidators: true }
    );

    return data;
  }

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
    }).select("+password");
  }

  async findUserByIdWithPassword(userId: string): Promise<IUser | null> {
    if (!Types.ObjectId.isValid(userId)) {
      return null;
    }

    return await User.findById(userId).select("+password");
  }

  async findUserByRefreshToken(refreshToken: string): Promise<IUser | null> {
    return await User.findOne({ refreshToken }).lean();
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
    let x = await User.findByIdAndUpdate(
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

  /**
   * Find users by role
   */
  async findUsersByRole(role: string): Promise<IUser[]> {
    return await User.find({ role }).select(
      "-password -otp -refreshToken -accessToken -emailVerificationToken -passwordResetToken -passwordResetExpires"
    );
  }

  /**
   * Find users by role with pagination and search
   */
  async findUsersByRoleWithPagination(
    role: string,
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<{
    users: IUser[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    // Build search query
    const query: any = { role };
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { universityName: { $regex: search, $options: "i" } },
      ];
    }

    // Get total count
    const total = await User.countDocuments(query);

    // Get paginated results
    const users = await User.find(query)
      .select(
        "-password -otp -refreshToken -accessToken -emailVerificationToken -passwordResetToken -passwordResetExpires"
      )
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    return {
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
}

export default AuthRepository;
