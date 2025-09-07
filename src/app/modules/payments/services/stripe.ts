import Stripe from "stripe";
import { config } from "../../../config/env.js";
import logger from "../../../utils/logger.js";

class StripeService {
  private stripe: Stripe;

  constructor() {
    if (!config.stripe.secretKey) {
      throw new Error("Stripe secret key is not configured");
    }

    this.stripe = new Stripe(config.stripe.secretKey, {
      apiVersion: "2025-08-27.basil",
    });
  }

  async createPaymentIntent(
    amount: number,
    currency: string = "inr",
    metadata?: Record<string, string>
  ): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to paise (Stripe expects amount in smallest currency unit)
        currency: currency.toLowerCase(),
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: metadata || {},
      });

      logger.info(`Payment Intent created: ${paymentIntent.id}`);
      return paymentIntent;
    } catch (error) {
      logger.error("Failed to create Payment Intent:", error);
      throw error;
    }
  }

  async confirmPaymentIntent(
    paymentIntentId: string,
    paymentMethodId?: string
  ): Promise<Stripe.PaymentIntent> {
    try {
      const confirmParams: Stripe.PaymentIntentConfirmParams = {};
      
      if (paymentMethodId) {
        confirmParams.payment_method = paymentMethodId;
      }

      const paymentIntent = await this.stripe.paymentIntents.confirm(
        paymentIntentId,
        confirmParams
      );

      logger.info(`Payment Intent confirmed: ${paymentIntentId}`);
      return paymentIntent;
    } catch (error) {
      logger.error("Failed to confirm Payment Intent:", error);
      throw error;
    }
  }

  async retrievePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      logger.info(`Payment Intent retrieved: ${paymentIntentId}`);
      return paymentIntent;
    } catch (error) {
      logger.error("Failed to retrieve Payment Intent:", error);
      throw error;
    }
  }

  async cancelPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.cancel(paymentIntentId);
      logger.info(`Payment Intent cancelled: ${paymentIntentId}`);
      return paymentIntent;
    } catch (error) {
      logger.error("Failed to cancel Payment Intent:", error);
      throw error;
    }
  }

  async createUPIPaymentMethod(upiId: string): Promise<Stripe.PaymentMethod> {
    try {
      const paymentMethod = await this.stripe.paymentMethods.create({
        type: "upi",
        upi: {
          vpa: upiId,
        },
      } as any);

      logger.info(`UPI Payment Method created: ${paymentMethod.id}`);
      return paymentMethod;
    } catch (error) {
      logger.error("Failed to create UPI Payment Method:", error);
      throw error;
    }
  }

  async verifyWebhookSignature(
    payload: string | Buffer,
    signature: string,
    secret: string
  ): Promise<Stripe.Event> {
    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        secret
      );
      logger.info(`Webhook signature verified: ${event.type}`);
      return event;
    } catch (error) {
      logger.error("Webhook signature verification failed:", error);
      throw error;
    }
  }

  async createRefund(
    paymentIntentId: string,
    amount?: number,
    reason?: Stripe.RefundCreateParams.Reason
  ): Promise<Stripe.Refund> {
    try {
      const refundParams: Stripe.RefundCreateParams = {
        payment_intent: paymentIntentId,
      };

      if (amount) {
        refundParams.amount = Math.round(amount * 100); // Convert to paise
      }

      if (reason) {
        refundParams.reason = reason;
      }

      const refund = await this.stripe.refunds.create(refundParams);
      logger.info(`Refund created: ${refund.id}`);
      return refund;
    } catch (error) {
      logger.error("Failed to create refund:", error);
      throw error;
    }
  }
}

export default StripeService;
