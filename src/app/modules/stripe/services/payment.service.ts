import Stripe from 'stripe';
import { stripe, STRIPE_CONFIG, validatePaymentAmount, formatAmount } from '../config/stripe.js';
import { CreateCheckoutSessionRequest, CreateCheckoutSessionResponse, PaymentSuccessData } from '../types/payment.types.js';
import logger from '../../../utils/logger.js';

/**
 * Payment Service
 * Handles all Stripe payment operations
 */
export class PaymentService {
  
  /**
   * Create a Stripe Checkout Session
   * @param request - Payment request data
   * @returns Promise<CreateCheckoutSessionResponse>
   */
  static async createCheckoutSession(
    request: CreateCheckoutSessionRequest
  ): Promise<CreateCheckoutSessionResponse> {
    try {
      const {
        amount,
        currency = STRIPE_CONFIG.currency,
        successUrl = STRIPE_CONFIG.successUrl,
        cancelUrl = STRIPE_CONFIG.cancelUrl,
        customerEmail,
        metadata = {}
      } = request;

      // Validate amount
      if (!validatePaymentAmount(amount)) {
        throw new Error(`Invalid amount: ${formatAmount(amount)}. Amount must be between ₹1 and ₹1,00,000`);
      }

      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: currency,
              product_data: {
                name: 'Course Payment',
                description: 'Payment for course enrollment',
                images: [], // Add product images if needed
              },
              unit_amount: amount, // Amount in paise
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: successUrl,
        cancel_url: cancelUrl,
        ...(customerEmail && { customer_email: customerEmail }),
        metadata: {
          ...metadata,
          amount: amount.toString(),
          currency: currency,
          timestamp: new Date().toISOString(),
        },
        // Enable automatic tax calculation if needed
        automatic_tax: { enabled: false },
        // Allow promotion codes
        allow_promotion_codes: true,
        // Billing address collection
        billing_address_collection: 'required',
      });

      logger.info(`Stripe checkout session created: ${session.id} for amount: ${formatAmount(amount)}`);

      return {
        success: true,
        sessionId: session.id,
        sessionUrl: session.url!,
        message: `Checkout session created successfully for ${formatAmount(amount)}`,
      };

    } catch (error) {
      logger.error('Error creating Stripe checkout session:', error);
      
      if (error instanceof Stripe.errors.StripeError) {
        throw new Error(`Stripe error: ${error.message}`);
      }
      
      throw error;
    }
  }

  /**
   * Handle successful payment from webhook
   * @param session - Stripe checkout session
   * @returns Promise<PaymentSuccessData>
   */
  static async handlePaymentSuccess(session: Stripe.Checkout.Session): Promise<PaymentSuccessData> {
    try {
      const paymentData: PaymentSuccessData = {
        sessionId: session.id,
        customerEmail: session.customer_email || undefined,
        amount: session.amount_total || 0,
        currency: session.currency || 'inr',
        paymentStatus: session.payment_status,
        metadata: session.metadata || undefined,
      };

      // Log payment success
      logger.info(`Payment successful for session: ${session.id}`, {
        amount: formatAmount(paymentData.amount),
        customerEmail: paymentData.customerEmail,
        paymentStatus: paymentData.paymentStatus,
      });

      // TODO: Add your business logic here
      // Examples:
      // - Update user's course enrollment status
      // - Send confirmation email
      // - Update database records
      // - Grant access to course content
      
      await this.updatePaymentInDatabase(paymentData);

      return paymentData;

    } catch (error) {
      logger.error('Error handling payment success:', error);
      throw error;
    }
  }

  /**
   * Update payment information in database
   * This is a placeholder - implement according to your business logic
   * @param paymentData - Payment success data
   */
  private static async updatePaymentInDatabase(paymentData: PaymentSuccessData): Promise<void> {
    try {
      // TODO: Implement your database update logic here
      // Example:
      // await PaymentModel.create({
      //   sessionId: paymentData.sessionId,
      //   customerEmail: paymentData.customerEmail,
      //   amount: paymentData.amount,
      //   currency: paymentData.currency,
      //   status: 'completed',
      //   metadata: paymentData.metadata,
      //   createdAt: new Date(),
      // });

      logger.info(`Payment data updated in database for session: ${paymentData.sessionId}`);
      
    } catch (error) {
      logger.error('Error updating payment in database:', error);
      throw error;
    }
  }

  /**
   * Retrieve a checkout session by ID
   * @param sessionId - Stripe session ID
   * @returns Promise<Stripe.Checkout.Session>
   */
  static async getCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session> {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      return session;
    } catch (error) {
      logger.error(`Error retrieving checkout session ${sessionId}:`, error);
      throw error;
    }
  }
}
