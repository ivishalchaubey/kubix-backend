import crypto from "crypto";
import {
  razorpay,
  RAZORPAY_CONFIG,
  validatePaymentAmount,
  formatAmount,
  generateReceiptId,
} from "../config/razorpay.js";
import {
  CreateOrderRequest,
  CreateOrderResponse,
  PaymentSuccessData,
  VerifyPaymentRequest,
  VerifyPaymentResponse,
} from "../types/payment.types.js";
import { config } from "../../../config/env.js";
import logger from "../../../utils/logger.js";
import Payment from "../../payments/models/payment.js";
import { UserToken } from "../../auth/models/usertoken.js";
import { Types } from "mongoose";

/**
 * Payment Service
 * Handles all Razorpay payment operations
 */
export class PaymentService {
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
   * Create a Razorpay Order
   * @param request - Payment request data
   * @returns Promise<CreateOrderResponse>
   */
  static async createOrder(
    request: CreateOrderRequest
  ): Promise<CreateOrderResponse> {
    try {
      // Check if Razorpay is configured
      this.checkRazorpayConfig();

      const {
        amount,
        currency = RAZORPAY_CONFIG.currency,
        customerEmail,
        metadata = {},
      } = request;

      // Validate amount
      if (!validatePaymentAmount(amount)) {
        throw new Error(
          `Invalid amount: ${formatAmount(
            amount
          )}. Amount must be between ₹1 and ₹1,00,000`
        );
      }

      // Generate receipt ID
      const receipt = generateReceiptId();

      // Create Razorpay order
      const orderOptions = {
        amount: amount, // Amount in paise
        currency: currency,
        receipt: receipt,
        notes: {
          ...metadata,
          customerEmail: customerEmail || "",
        },
      };

      const order = await razorpay!.orders.create(orderOptions);

      logger.info(`Razorpay order created successfully: ${order.id}`);

      return {
        success: true,
        orderId: order.id,
        orderKey: order.id, // Razorpay uses the same ID as key
        message: "Order created successfully",
        keyId: config.razorpay.keyId,
        currency: currency,
        amount: amount,
      };
    } catch (error: any) {
      logger.error("Error creating Razorpay order:", error);
      throw new Error(`Failed to create order: ${error.message}`);
    }
  }

  /**
   * Verify payment signature
   * @param verificationData - Payment verification data from frontend
   * @returns Promise<VerifyPaymentResponse>
   */
  static async verifyPayment(
    verificationData: VerifyPaymentRequest
  ): Promise<VerifyPaymentResponse> {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
        verificationData;

      // Create signature for verification
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac("sha256", config.razorpay.keySecret)
        .update(body.toString())
        .digest("hex");

      const isAuthentic = expectedSignature === razorpay_signature;

      if (isAuthentic) {
        logger.info(`Payment verification successful: ${razorpay_payment_id}`);

        // Update payment status in database
        await this.handlePaymentSuccess({
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
          amount: 0, // Will be fetched from order
          currency: "INR",
          paymentStatus: "captured",
        });

        return {
          success: true,
          verified: true,
          message: "Payment verified successfully",
          paymentId: razorpay_payment_id,
        };
      } else {
        logger.error(`Payment verification failed: ${razorpay_payment_id}`);
        return {
          success: false,
          verified: false,
          message: "Payment verification failed",
        };
      }
    } catch (error: any) {
      logger.error("Error verifying payment:", error);
      throw new Error(`Payment verification failed: ${error.message}`);
    }
  }

  /**
   * Handle successful payment
   * @param paymentData - Payment success data
   */
  static async handlePaymentSuccess(
    paymentData: PaymentSuccessData
  ): Promise<void> {
    try {
      // Check if Razorpay is configured
      this.checkRazorpayConfig();

      logger.info(`Processing successful payment: ${paymentData.paymentId}`);

      // Fetch order details to get amount if not provided
      if (!paymentData.amount) {
        const order = await razorpay!.orders.fetch(paymentData.orderId);
        paymentData.amount = Number(order.amount);
        paymentData.currency = order.currency;
      }

      // Fetch payment details
      const payment = await razorpay!.payments.fetch(paymentData.paymentId);

      // Create payment record in database (simplified for now)
      // TODO: Create a generic payment model or extend existing one for Razorpay
      logger.info(`Payment record created for: ${paymentData.paymentId}`);

      // Calculate tokens based on amount (1 USD = 10 tokens, convert INR to USD approximately)
      const tokensToAdd = Math.floor(
        paymentData.amount / 100 / config.payment.tokenRate
      );

      // TODO: Add tokens to user - requires proper user lookup implementation
      logger.info(
        `Tokens to add: ${tokensToAdd} for customer: ${paymentData.customerEmail}`
      );

      logger.info(`Successfully processed payment: ${paymentData.paymentId}`);
    } catch (error: any) {
      logger.error("Error handling payment success:", error);
      throw error;
    }
  }

  /**
   * Get order status
   * @param orderId - Razorpay order ID
   */
  static async getOrderStatus(orderId: string) {
    try {
      // Check if Razorpay is configured
      this.checkRazorpayConfig();

      const order = await razorpay!.orders.fetch(orderId);

      // Get payments for this order
      const payments = await razorpay!.orders.fetchPayments(orderId);

      return {
        success: true,
        order: {
          id: order.id,
          amount: order.amount,
          currency: order.currency,
          status: order.status,
          attempts: order.attempts,
          amount_paid: order.amount_paid,
          amount_due: order.amount_due,
          created_at: order.created_at,
          notes: order.notes,
        },
        payments: payments.items.map((payment: any) => ({
          id: payment.id,
          amount: payment.amount,
          status: payment.status,
          method: payment.method,
          created_at: payment.created_at,
        })),
      };
    } catch (error: any) {
      logger.error("Error fetching order status:", error);
      throw new Error(`Failed to fetch order status: ${error.message}`);
    }
  }

  /**
   * Verify webhook signature
   * @param signature - Webhook signature from headers
   * @param body - Raw webhook body
   * @returns boolean
   */
  static verifyWebhookSignature(signature: string, body: string): boolean {
    try {
      const expectedSignature = crypto
        .createHmac("sha256", config.razorpay.webhookSecret)
        .update(body)
        .digest("hex");

      return signature === expectedSignature;
    } catch (error) {
      logger.error("Error verifying webhook signature:", error);
      return false;
    }
  }

  /**
   * Handle webhook event
   * @param event - Webhook event data
   */
  static async handleWebhookEvent(event: any): Promise<void> {
    try {
      logger.info(`Processing webhook event: ${event.event}`);

      switch (event.event) {
        case "payment.captured":
          if (event.payload.payment && event.payload.payment.entity) {
            const payment = event.payload.payment.entity;
            await this.handlePaymentSuccess({
              orderId: payment.order_id,
              paymentId: payment.id,
              customerEmail: payment.email,
              amount: payment.amount,
              currency: payment.currency,
              paymentStatus: payment.status,
              method: payment.method,
              bank: payment.bank,
              wallet: payment.wallet,
              vpa: payment.vpa,
              contact: payment.contact,
            });
          }
          break;

        case "payment.failed":
          if (event.payload.payment && event.payload.payment.entity) {
            const payment = event.payload.payment.entity;
            logger.warn(
              `Payment failed: ${payment.id}, Reason: ${payment.error_description}`
            );

            // TODO: Update payment status in database when generic payment model is implemented
          }
          break;

        case "order.paid":
          if (event.payload.order && event.payload.order.entity) {
            const order = event.payload.order.entity;
            logger.info(`Order paid: ${order.id}`);
          }
          break;

        default:
          logger.info(`Unhandled webhook event: ${event.event}`);
      }
    } catch (error: any) {
      logger.error("Error handling webhook event:", error);
      throw error;
    }
  }
}
