import { Request, Response, NextFunction } from 'express';
import UserTokenService from '../services/usertoken.service.js';
import logger from '../../../utils/logger.js';
import asyncHandler from '../../../utils/asyncHandler.js';
import ResponseUtil from '../../../utils/response.js';

/**
 * User Token Controller
 * Handles user token-related operations
 */
export class UserTokenController {
  
  /**
   * Get user token balance
   * GET /api/v1/auth/tokens/balance
   */
  static getUserTokenBalance = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = req.user?._id;
        
        if (!userId) {
          return ResponseUtil.unauthorized(res, 'User not authenticated');
        }

        const userTokenService = new UserTokenService();
        const userToken = await userTokenService.getUserTokenBalance(userId);

        return ResponseUtil.success(res, {
          userId: userToken?.userId,
          tokenBalance: userToken?.token || 0,
          lastUpdated: userToken?.updatedAt
        }, 'Token balance retrieved successfully');

      } catch (error) {
        logger.error('Error getting user token balance:', error);
        const errorMessage = error instanceof Error ? error.message : 'Internal server error';
        return ResponseUtil.internalServerError(res, errorMessage);
      }
    }
  );

  /**
   * Add tokens to user account (Admin only)
   * POST /api/v1/auth/tokens/add
   */
  static addTokens = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { userId, tokens, description } = req.body;

        if (!userId || !tokens) {
          return ResponseUtil.badRequest(res, 'User ID and tokens are required');
        }

        if (typeof tokens !== 'number' || tokens <= 0) {
          return ResponseUtil.badRequest(res, 'Tokens must be a positive number');
        }

        const userTokenService = new UserTokenService();
        const userToken = await userTokenService.addTokens(userId, tokens, description);

        return ResponseUtil.success(res, {
          userId: userToken.userId,
          tokensAdded: tokens,
          newBalance: userToken.token,
          description
        }, 'Tokens added successfully');

      } catch (error) {
        logger.error('Error adding tokens:', error);
        const errorMessage = error instanceof Error ? error.message : 'Internal server error';
        return ResponseUtil.internalServerError(res, errorMessage);
      }
    }
  );

  /**
   * Spend tokens from user account
   * POST /api/v1/auth/tokens/spend
   */
  static spendTokens = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = req.user?._id;
        const { tokens, description } = req.body;

        if (!userId) {
          return ResponseUtil.unauthorized(res, 'User not authenticated');
        }

        if (!tokens) {
          return ResponseUtil.badRequest(res, 'Tokens amount is required');
        }

        if (typeof tokens !== 'number' || tokens <= 0) {
          return ResponseUtil.badRequest(res, 'Tokens must be a positive number');
        }

        const userTokenService = new UserTokenService();
        const userToken = await userTokenService.spendTokens(userId, tokens, description);

        return ResponseUtil.success(res, {
          userId: userToken.userId,
          tokensSpent: tokens,
          remainingBalance: userToken.token,
          description
        }, 'Tokens spent successfully');

      } catch (error) {
        logger.error('Error spending tokens:', error);
        const errorMessage = error instanceof Error ? error.message : 'Internal server error';
        return ResponseUtil.internalServerError(res, errorMessage);
      }
    }
  );

  /**
   * Get token transaction history
   * GET /api/v1/auth/tokens/history
   */
  static getTokenHistory = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = req.user?._id;
        
        if (!userId) {
          return ResponseUtil.unauthorized(res, 'User not authenticated');
        }

        const userTokenService = new UserTokenService();
        const history = await userTokenService.getTokenHistory(userId);

        return ResponseUtil.success(res, {
          userId,
          history,
          totalTransactions: history.length
        }, 'Token history retrieved successfully');

      } catch (error) {
        logger.error('Error getting token history:', error);
        const errorMessage = error instanceof Error ? error.message : 'Internal server error';
        return ResponseUtil.internalServerError(res, errorMessage);
      }
    }
  );
}
