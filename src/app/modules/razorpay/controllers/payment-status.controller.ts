import { Request, Response, NextFunction } from "express";
import { razorpay } from "../config/razorpay.js";
import logger from "../../../utils/logger.js";
import asyncHandler from "../../../utils/asyncHandler.js";
import ResponseUtil from "../../../utils/response.js";
import Payment from "../../payments/models/payment.js";

/**
 * Payment Status Controller
 * Handles HTTP requests for payment status and verification operations
 */
export class PaymentStatusController {
  /**
   * Check if Razorpay is properly configured
   * @private
   */
  private static checkRazorpayConfig(): void {
    if (!razorpay) {
      throw new Error(
        "Razorpay is not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables."
      );
    }
  }

  /**
   * Get Payment Details
   * GET /api/v1/razorpay/payment/:paymentId/details
   */
  static getPaymentDetails = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { paymentId } = req.params;

        if (!paymentId) {
          return ResponseUtil.badRequest(res, "Payment ID is required");
        }

        // Check if Razorpay is configured
        PaymentStatusController.checkRazorpayConfig();

        // Fetch payment from Razorpay
        const payment = await razorpay!.payments.fetch(paymentId);

        const paymentDetails = {
          id: payment.id,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          method: payment.method,
          orderId: payment.order_id,
          email: payment.email,
          contact: payment.contact,
          createdAt: new Date(payment.created_at * 1000),
          captured: payment.captured,
          description: payment.description,
          notes: payment.notes,
        };

        return ResponseUtil.success(
          res,
          paymentDetails,
          "Payment details retrieved successfully"
        );
      } catch (error: any) {
        logger.error("Error in getPaymentDetails:", error);
        return ResponseUtil.internalServerError(
          res,
          error.message || "Failed to get payment details"
        );
      }
    }
  );

  /**
   * Verify Payment Success
   * GET /api/v1/razorpay/payment/:paymentId/verify
   */
  static verifyPaymentSuccess = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { paymentId } = req.params;

        if (!paymentId) {
          return ResponseUtil.badRequest(res, "Payment ID is required");
        }

        // Check if Razorpay is configured
        PaymentStatusController.checkRazorpayConfig();

        // Fetch payment from Razorpay
        const payment = await razorpay!.payments.fetch(paymentId);

        const isSuccessful = payment.status === "captured";

        return ResponseUtil.success(
          res,
          {
            paymentId: payment.id,
            orderId: payment.order_id,
            status: payment.status,
            amount: payment.amount,
            currency: payment.currency,
            verified: isSuccessful,
            method: payment.method,
          },
          isSuccessful
            ? "Payment verified successfully"
            : "Payment not successful"
        );
      } catch (error: any) {
        logger.error("Error in verifyPaymentSuccess:", error);
        return ResponseUtil.internalServerError(
          res,
          error.message || "Payment verification failed"
        );
      }
    }
  );

  /**
   * Get Payment Receipt
   * GET /api/v1/razorpay/payment/:paymentId/receipt
   */
  static getPaymentReceipt = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { paymentId } = req.params;

        if (!paymentId) {
          return ResponseUtil.badRequest(res, "Payment ID is required");
        }

        // Check if Razorpay is configured
        PaymentStatusController.checkRazorpayConfig();

        // Fetch payment from Razorpay
        const payment = await razorpay!.payments.fetch(paymentId);

        // Fetch order details if order_id exists
        let order = null;
        if (payment.order_id) {
          try {
            order = await razorpay!.orders.fetch(payment.order_id);
          } catch (orderError) {
            logger.warn(
              `Could not fetch order details for ${payment.order_id}:`,
              orderError
            );
          }
        }

        const receipt = {
          receiptNumber: `RZP-${payment.id}`,
          paymentId: payment.id,
          orderId: payment.order_id,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          method: payment.method,
          email: payment.email,
          contact: payment.contact,
          paidAt: new Date(payment.created_at * 1000),
          description:
            payment.description || order?.notes?.description || "Token Payment",
          notes: payment.notes,
          orderDetails: order
            ? {
                id: order.id,
                amount: order.amount,
                status: order.status,
                receipt: order.receipt,
              }
            : null,
        };

        return ResponseUtil.success(
          res,
          receipt,
          "Payment receipt retrieved successfully"
        );
      } catch (error: any) {
        logger.error("Error in getPaymentReceipt:", error);
        return ResponseUtil.internalServerError(
          res,
          error.message || "Failed to get payment receipt"
        );
      }
    }
  );

  /**
   * Get Customer Payments
   * GET /api/v1/razorpay/payments/customer/:email
   */
  static getCustomerPayments = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { email } = req.params;
        const { limit = 10, offset = 0 } = req.query;

        if (!email) {
          return ResponseUtil.badRequest(res, "Customer email is required");
        }

        // This would typically require a database query since Razorpay doesn't provide
        // direct customer payment lookup by email. For now, return empty array
        // and suggest implementing database-based lookup

        logger.info(
          `Customer payments requested for ${email} - implement database lookup`
        );

        return ResponseUtil.success(
          res,
          {
            payments: [],
            total: 0,
            hasMore: false,
            limit: Number(limit),
            offset: Number(offset),
          },
          "Customer payments retrieved successfully (implement database lookup for full functionality)"
        );
      } catch (error: any) {
        logger.error("Error in getCustomerPayments:", error);
        return ResponseUtil.internalServerError(
          res,
          error.message || "Failed to get customer payments"
        );
      }
    }
  );

  /**
   * Get Payment Analytics
   * GET /api/v1/razorpay/analytics/payments
   */
  static getPaymentAnalytics = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { start_date, end_date, limit = 100 } = req.query;

        // For basic analytics, we can use the database if available
        // Or implement using Razorpay's settlement APIs

        logger.info(
          "Payment analytics requested - implement based on requirements"
        );

        return ResponseUtil.success(
          res,
          {
            totalPayments: 0,
            totalAmount: 0,
            successfulPayments: 0,
            failedPayments: 0,
            averagePaymentAmount: 0,
            paymentsByMethod: {},
            paymentsByStatus: {},
            recentPayments: [],
          },
          "Payment analytics retrieved successfully (implement based on specific requirements)"
        );
      } catch (error: any) {
        logger.error("Error in getPaymentAnalytics:", error);
        return ResponseUtil.internalServerError(
          res,
          error.message || "Failed to get payment analytics"
        );
      }
    }
  );
}
