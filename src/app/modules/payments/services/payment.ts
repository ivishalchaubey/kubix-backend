import PaymentRepository from "../repositories/payment.js";
import StripeService from "./stripe.js";
import { IPayment, QueryOptions } from "../../../types/global.js";
import { AppError } from "../../../middlewares/errorHandler.js";
import { API_MESSAGES, HttpStatus } from "../../../constants/enums.js";
import logger from "../../../utils/logger.js";
import { Types } from "mongoose";

class PaymentService {
  private paymentRepository: PaymentRepository;
  private stripeService: StripeService;

  constructor() {
    this.paymentRepository = new PaymentRepository();
    this.stripeService = new StripeService();
  }

  async createPaymentIntent(paymentData: {
    userId: string;
    amount: number;
    tokens: number;
  }): Promise<{
    paymentIntent: any;
    payment: IPayment;
  }> {
    try {
      const { userId, amount, tokens } = paymentData;

      // Create Stripe Payment Intent
      const stripePaymentIntent = await this.stripeService.createPaymentIntent(
        amount,
        "inr",
        {
          userId,
          tokens: tokens.toString(),
        }
      );

      // Create payment record in database
      const { userId: userIdStr, ...restData } = paymentData;
      const paymentDataWithStripe = {
        ...restData,
        userId: new Types.ObjectId(userIdStr),
        stripePaymentId: stripePaymentIntent.id,
        status: "pending" as const
      };

      const payment = await this.paymentRepository.createPayment(paymentDataWithStripe as Partial<IPayment>);
      logger.info(`Payment Intent created successfully: ${payment._id}`);
      
      return {
        paymentIntent: {
          id: stripePaymentIntent.id,
          client_secret: stripePaymentIntent.client_secret,
          amount: stripePaymentIntent.amount,
          currency: stripePaymentIntent.currency,
          status: stripePaymentIntent.status,
        },
        payment
      };
    } catch (error) {
      logger.error("Create payment intent failed:", error);
      throw error;
    }
  }

  async confirmPayment(paymentIntentId: string, paymentMethodId?: string): Promise<IPayment> {
    try {
      // Confirm payment with Stripe
      const confirmedPaymentIntent = await this.stripeService.confirmPaymentIntent(
        paymentIntentId,
        paymentMethodId
      );

      // Update payment status in database
      const updatedPayment = await this.paymentRepository.updatePaymentStatus(
        paymentIntentId,
        confirmedPaymentIntent.status === "succeeded" ? "succeeded" : "failed"
      );

      if (!updatedPayment) {
        throw new AppError(
          API_MESSAGES.ERROR.NOT_FOUND,
          HttpStatus.NOT_FOUND
        );
      }

      logger.info(`Payment confirmed successfully: ${paymentIntentId}`);
      return updatedPayment;
    } catch (error) {
      logger.error("Confirm payment failed:", error);
      throw error;
    }
  }

  async getPayments(options: QueryOptions & { status?: string }): Promise<{
    payments: IPayment[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const result = await this.paymentRepository.getPayments(options);
      logger.info(`Payments fetched successfully: ${result.payments.length} payments`);
      return result;
    } catch (error) {
      logger.error("Get payments failed:", error);
      throw error;
    }
  }

  async getPaymentById(paymentId: string): Promise<IPayment> {
    try {
      const payment = await this.paymentRepository.getPaymentById(paymentId);
      
      if (!payment) {
        throw new AppError(
          API_MESSAGES.ERROR.NOT_FOUND,
          HttpStatus.NOT_FOUND
        );
      }

      logger.info(`Payment fetched successfully: ${paymentId}`);
      return payment;
    } catch (error) {
      logger.error("Get payment by ID failed:", error);
      throw error;
    }
  }

  async updatePayment(paymentId: string, updateData: Partial<IPayment>): Promise<IPayment> {
    try {
      const payment = await this.paymentRepository.updatePayment(paymentId, updateData);
      
      if (!payment) {
        throw new AppError(
          API_MESSAGES.ERROR.NOT_FOUND,
          HttpStatus.NOT_FOUND
        );
      }

      logger.info(`Payment updated successfully: ${paymentId}`);
      return payment;
    } catch (error) {
      logger.error("Update payment failed:", error);
      throw error;
    }
  }

  async deletePayment(paymentId: string): Promise<void> {
    try {
      const payment = await this.paymentRepository.deletePayment(paymentId);
      
      if (!payment) {
        throw new AppError(
          API_MESSAGES.ERROR.NOT_FOUND,
          HttpStatus.NOT_FOUND
        );
      }

      logger.info(`Payment deleted successfully: ${paymentId}`);
    } catch (error) {
      logger.error("Delete payment failed:", error);
      throw error;
    }
  }

  async getUserPayments(
    userId: string,
    options: QueryOptions & { status?: string }
  ): Promise<{
    payments: IPayment[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const result = await this.paymentRepository.getUserPayments(userId, options);
      logger.info(`User payments fetched successfully for user: ${userId}`);
      return result;
    } catch (error) {
      logger.error("Get user payments failed:", error);
      throw error;
    }
  }

  async handleStripeWebhook(payload: string | Buffer, signature: string): Promise<any> {
    try {
      // Verify webhook signature
      const event = await this.stripeService.verifyWebhookSignature(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET || ""
      );

      logger.info(`Stripe webhook received: ${event.type}`);

      switch (event.type) {
        case "payment_intent.succeeded":
          const succeededPaymentIntent = event.data.object as any;
          await this.paymentRepository.updatePaymentStatus(
            succeededPaymentIntent.id,
            "succeeded"
          );
          logger.info(`Payment succeeded: ${succeededPaymentIntent.id}`);
          break;

        case "payment_intent.payment_failed":
          const failedPaymentIntent = event.data.object as any;
          await this.paymentRepository.updatePaymentStatus(
            failedPaymentIntent.id,
            "failed"
          );
          logger.info(`Payment failed: ${failedPaymentIntent.id}`);
          break;

        case "payment_intent.canceled":
          const canceledPaymentIntent = event.data.object as any;
          await this.paymentRepository.updatePaymentStatus(
            canceledPaymentIntent.id,
            "failed"
          );
          logger.info(`Payment canceled: ${canceledPaymentIntent.id}`);
          break;

        default:
          logger.info(`Unhandled event type: ${event.type}`);
      }

      return { received: true };
    } catch (error) {
      logger.error("Stripe webhook handling failed:", error);
      throw error;
    }
  }

  async getPaymentByStripeId(stripePaymentId: string): Promise<IPayment> {
    try {
      const payment = await this.paymentRepository.getPaymentByStripeId(stripePaymentId);
      
      if (!payment) {
        throw new AppError(
          API_MESSAGES.ERROR.NOT_FOUND,
          HttpStatus.NOT_FOUND
        );
      }

      logger.info(`Payment fetched successfully by Stripe ID: ${stripePaymentId}`);
      return payment;
    } catch (error) {
      logger.error("Get payment by Stripe ID failed:", error);
      throw error;
    }
  }

  async getPaymentStats(): Promise<{
    totalPayments: number;
    totalAmount: number;
    successfulPayments: number;
    failedPayments: number;
    pendingPayments: number;
  }> {
    try {
      const stats = await this.paymentRepository.getPaymentStats();
      logger.info("Payment stats fetched successfully");
      return stats;
    } catch (error) {
      logger.error("Get payment stats failed:", error);
      throw error;
    }
  }
}

export default PaymentService;
