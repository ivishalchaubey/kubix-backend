import { Request, Response, NextFunction } from "express";
import { PaymentService } from "../services/payment.service.js";
import {
  CreateOrderRequest,
  VerifyPaymentRequest,
  RazorpayWebhookEvent,
} from "../types/payment.types.js";
import { config } from "../../../config/env.js";
import logger from "../../../utils/logger.js";
import asyncHandler from "../../../utils/asyncHandler.js";
import ResponseUtil from "../../../utils/response.js";
import Payment from "../../payments/models/payment.js";

/**
 * Payment Controller
 * Handles HTTP requests for payment operations
 */
export class PaymentController {
  /**
   * Create Razorpay Order
   * POST /api/v1/razorpay/create-order
   */
  static createOrder = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const {
          amount,
          currency,
          customerEmail,
          metadata,
        }: CreateOrderRequest = req.body;

        // Validate required fields
        if (!amount) {
          return ResponseUtil.badRequest(res, "Amount is required");
        }

        // Validate amount is a positive number
        if (typeof amount !== "number" || amount <= 0) {
          return ResponseUtil.badRequest(
            res,
            "Amount must be a positive number"
          );
        }

        // Add userId to metadata if user is authenticated
        const enhancedMetadata = {
          ...metadata,
          ...(req.user?._id && { userId: req.user._id }),
        };

        // Create order
        const result = await PaymentService.createOrder({
          amount,
          ...(currency && { currency }),
          ...(customerEmail && { customerEmail }),
          metadata: enhancedMetadata,
        });

        logger.info(`Order created successfully: ${result.orderId}`);

        return ResponseUtil.success(res, result, "Order created successfully");
      } catch (error: any) {
        logger.error("Error in createOrder:", error);
        return ResponseUtil.internalServerError(
          res,
          error.message || "Failed to create order"
        );
      }
    }
  );

  /**
   * Handle Razorpay Webhook Events
   * POST /api/v1/razorpay/webhook
   */
  static handleWebhook = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const signature = req.headers["x-razorpay-signature"] as string;

        if (!signature) {
          logger.error("Missing Razorpay signature header");
          return ResponseUtil.badRequest(res, "Missing Razorpay signature");
        }

        // Get raw body for signature verification
        const rawBody =
          typeof req.body === "string" ? req.body : JSON.stringify(req.body);

        // Verify webhook signature
        const isValidSignature = PaymentService.verifyWebhookSignature(
          signature,
          rawBody
        );

        if (!isValidSignature) {
          logger.error("Webhook signature verification failed");
          return ResponseUtil.badRequest(res, "Invalid signature");
        }

        // Parse the event
        const event: RazorpayWebhookEvent =
          typeof req.body === "string" ? JSON.parse(req.body) : req.body;

        logger.info(`Received webhook event: ${event.event}`);

        // Handle the webhook event
        await PaymentService.handleWebhookEvent(event);

        return ResponseUtil.success(
          res,
          null,
          "Webhook processed successfully"
        );
      } catch (error: any) {
        logger.error("Error in webhook handler:", error);
        return ResponseUtil.internalServerError(
          res,
          "Webhook processing failed"
        );
      }
    }
  );

  /**
   * Verify Payment Signature
   * POST /api/v1/razorpay/verify-payment
   */
  static verifyPayment = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const {
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
        }: VerifyPaymentRequest = req.body;

        // Validate required fields
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
          return ResponseUtil.badRequest(
            res,
            "Missing required payment verification data"
          );
        }

        // Verify payment
        const result = await PaymentService.verifyPayment({
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
        });

        if (result.verified) {
          logger.info(`Payment verified successfully: ${razorpay_payment_id}`);
          return ResponseUtil.success(
            res,
            result,
            "Payment verified successfully"
          );
        } else {
          logger.error(`Payment verification failed: ${razorpay_payment_id}`);
          return ResponseUtil.badRequest(res, "Payment verification failed");
        }
      } catch (error: any) {
        logger.error("Error in verifyPayment:", error);
        return ResponseUtil.internalServerError(
          res,
          error.message || "Payment verification failed"
        );
      }
    }
  );

  /**
   * Get Order Status
   * GET /api/v1/razorpay/order/:orderId
   */
  static getOrderStatus = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { orderId } = req.params;

        if (!orderId) {
          return ResponseUtil.badRequest(res, "Order ID is required");
        }

        const result = await PaymentService.getOrderStatus(orderId);

        return ResponseUtil.success(
          res,
          result,
          "Order status retrieved successfully"
        );
      } catch (error: any) {
        logger.error("Error in getOrderStatus:", error);
        return ResponseUtil.internalServerError(
          res,
          error.message || "Failed to get order status"
        );
      }
    }
  );

  /**
   * Get Payment History
   * GET /api/v1/razorpay/payment-history
   */
  static getPaymentHistory = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = req.user?._id;

        if (!userId) {
          return ResponseUtil.unauthorized(res, "User not authenticated");
        }

        // Get user's payment history (simplified for now)
        // TODO: Implement proper payment history from a generic payment model
        logger.info(`Payment history requested for user: ${userId}`);

        // For now, return empty array until proper payment model is implemented
        const formattedPayments: any[] = [];

        return ResponseUtil.success(
          res,
          {
            payments: formattedPayments,
            total: formattedPayments.length,
          },
          "Payment history retrieved successfully"
        );
      } catch (error: any) {
        logger.error("Error in getPaymentHistory:", error);
        return ResponseUtil.internalServerError(
          res,
          error.message || "Failed to get payment history"
        );
      }
    }
  );
}
