import { Types, ObjectId } from "mongoose";
import { UserToken } from "../models/usertoken.js";
// import { IUserToken } from "../../../types/global.js";
import { AppError } from "../../../middlewares/errorHandler.js";
import { API_MESSAGES, HttpStatus } from "../../../constants/enums.js";
import logger from "../../../utils/logger.js";

interface IUserToken {
  _id: string;
  userId: Types.ObjectId;
  token: number;
  createdAt: Date;
  updatedAt: Date;
}
class UserTokenService {
  
  /**
   * Get user token balance
   * @param userId - User ID
   * @returns Promise<IUserToken | null>
   */
  async getUserTokenBalance(userId: string): Promise<IUserToken | null> {
    try {
      if (!Types.ObjectId.isValid(userId)) {
        throw new AppError(
          API_MESSAGES.ERROR.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND
        );
      }

      const userToken = await UserToken.findOne({ userId: new Types.ObjectId(userId) });
      
      if (!userToken) {
        // Return default token balance of 0
        return {
          _id: '',
          userId: new Types.ObjectId(userId),
          token: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        };
      }

      logger.info(`User token balance retrieved for user: ${userId}`);
      return userToken;
      
    } catch (error) {
      logger.error("Get user token balance failed:", error);
      throw error;
    }
  }

  /**
   * Add tokens to user account
   * @param userId - User ID
   * @param tokens - Number of tokens to add
   * @param description - Description of the transaction
   * @returns Promise<IUserToken>
   */
  async addTokens(userId: string, tokens: number, description?: string): Promise<IUserToken> {
    try {
      if (!Types.ObjectId.isValid(userId)) {
        throw new AppError(
          API_MESSAGES.ERROR.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND
        );
      }

      if (tokens <= 0) {
        throw new AppError(
          "Tokens must be greater than 0",
          HttpStatus.BAD_REQUEST
        );
      }

      // Check if user already has tokens
      const existingUserToken = await UserToken.findOne({ userId: new Types.ObjectId(userId) });
      
      if (existingUserToken) {
        // Update existing token balance
        existingUserToken.token += tokens;
        existingUserToken.updatedAt = new Date();
        await existingUserToken.save();
        
        logger.info(`Tokens added to existing user account`, {
          userId,
          tokensAdded: tokens,
          newBalance: existingUserToken.token,
          description
        });
        
        return existingUserToken;
      } else {
        // Create new token record
        const newUserToken = new UserToken({
          userId: new Types.ObjectId(userId),
          token: tokens,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        await newUserToken.save();
        
        logger.info(`New token account created for user`, {
          userId,
          tokensAdded: tokens,
          initialBalance: tokens,
          description
        });
        
        return newUserToken;
      }
      
    } catch (error) {
      logger.error("Add tokens failed:", error);
      throw error;
    }
  }

  /**
   * Spend tokens from user account
   * @param userId - User ID
   * @param tokens - Number of tokens to spend
   * @param description - Description of the transaction
   * @returns Promise<IUserToken>
   */
  async spendTokens(userId: string, tokens: number, description?: string): Promise<IUserToken> {
    try {
      if (!Types.ObjectId.isValid(userId)) {
        throw new AppError(
          API_MESSAGES.ERROR.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND
        );
      }

      if (tokens <= 0) {
        throw new AppError(
          "Tokens must be greater than 0",
          HttpStatus.BAD_REQUEST
        );
      }

      // Get user token balance
      const userToken = await UserToken.findOne({ userId: new Types.ObjectId(userId) });
      
      if (!userToken) {
        throw new AppError(
          "User has no token balance",
          HttpStatus.BAD_REQUEST
        );
      }

      if (userToken.token < tokens) {
        throw new AppError(
          "Insufficient token balance",
          HttpStatus.BAD_REQUEST
        );
      }

      // Deduct tokens
      userToken.token -= tokens;
      userToken.updatedAt = new Date();
      await userToken.save();
      
      logger.info(`Tokens spent from user account`, {
        userId,
        tokensSpent: tokens,
        remainingBalance: userToken.token,
        description
      });
      
      return userToken;
      
    } catch (error) {
      logger.error("Spend tokens failed:", error);
      throw error;
    }
  }

  /**
   * Get token transaction history (if needed in future)
   * @param userId - User ID
   * @returns Promise<any[]>
   */
  async getTokenHistory(userId: string): Promise<any[]> {
    try {
      if (!Types.ObjectId.isValid(userId)) {
        throw new AppError(
          API_MESSAGES.ERROR.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND
        );
      }

      // For now, return empty array
      // In future, you can create a TokenTransaction model to track all token movements
      logger.info(`Token history retrieved for user: ${userId}`);
      return [];
      
    } catch (error) {
      logger.error("Get token history failed:", error);
      throw error;
    }
  }
}

export default UserTokenService;
