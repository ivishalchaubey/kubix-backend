import Stripe from 'stripe';
import { stripe, STRIPE_CONFIG, validatePaymentAmount, formatAmount } from '../config/stripe.js';
import { CreateCheckoutSessionRequest, CreateCheckoutSessionResponse, PaymentSuccessData } from '../types/payment.types.js';
import logger from '../../../utils/logger.js';
import Payment from '../../payments/models/payment.js';
import { UserToken } from '../../auth/models/usertoken.js';
import { Types } from 'mongoose';

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
                name: 'Token Payment',
                description: 'Payment for tokens ',
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

      // Payment record will be created when webhook is received

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
      // Get additional payment information
      let paymentIntentId: string | undefined;
      let customerId: string | undefined;
      let paymentMethodId: string | undefined;

      if (session.payment_intent) {
        const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent as string);
        paymentIntentId = paymentIntent.id;
        customerId = paymentIntent.customer as string;
        paymentMethodId = paymentIntent.payment_method as string;
      }

      const paymentData: PaymentSuccessData = {
        sessionId: session.id,
        customerEmail: session.customer_email as string | undefined,
        amount: session.amount_total || 0,
        currency: session.currency || 'inr',
        paymentStatus: session.payment_status as string | undefined,
        metadata: session.metadata as Record<string, string> | undefined,
        ...(paymentIntentId && { paymentIntentId }),
        ...(customerId && { customerId }),
        ...(paymentMethodId && { paymentMethodId }),
      };

      // Log payment success
      logger.info(`Payment successful for session: ${session.id}`, {
        amount: formatAmount(paymentData.amount),
        customerEmail: paymentData.customerEmail,
        paymentStatus: paymentData.paymentStatus,
        paymentIntentId,
        customerId,
      });

      // Update database with payment information
      await this.updatePaymentInDatabase(paymentData);

      return paymentData;

    } catch (error) {
      logger.error('Error handling payment success:', error);
      throw error;
    }
  }

  /**
   * Update payment information in database
   * @param paymentData - Payment success data
   */
  public static async updatePaymentInDatabase(paymentData: PaymentSuccessData): Promise<void> {
    try {
      // Extract userId from metadata if available
      const userId = paymentData.metadata?.userId;
      
      if (!userId) {
        logger.warn(`No userId found in payment metadata for session: ${paymentData.sessionId}`);
        return;
      }

      // Calculate tokens based on amount (1 ₹ = 10 tokens)
      const amountInRupees = paymentData.amount / 100; // Convert from paise to rupees
      const tokens = Math.floor(amountInRupees * 10); // 1 ₹ = 10 tokens

      // Check if payment already exists
      const existingPayment = await Payment.findOne({ stripePaymentId: paymentData.sessionId });
      
      if (existingPayment) {
        logger.info(`Payment record already exists for session: ${paymentData.sessionId}`);
        return;
      }

      // Get additional payment details from Stripe
      let paymentMethodDetails = {};
      let receiptUrl = '';
      let transactionId = '';
      
      if (paymentData.paymentIntentId) {
        try {
          const paymentIntent = await stripe.paymentIntents.retrieve(paymentData.paymentIntentId, {
            expand: ['charges', 'payment_method']
          });
          
          // Extract payment method details
          if (paymentIntent.payment_method) {
            const pm = paymentIntent.payment_method as any;
            if (pm.type === 'card') {
              paymentMethodDetails = {
                type: 'card',
                last4: pm.card?.last4,
                brand: pm.card?.brand,
                expMonth: pm.card?.exp_month,
                expYear: pm.card?.exp_year,
              };
            }
          }
          
          // Extract receipt URL and transaction ID
          if ((paymentIntent as any).charges?.data?.[0]) {
            const charge = (paymentIntent as any).charges.data[0];
            receiptUrl = charge.receipt_url || '';
            transactionId = charge.id || '';
          }
        } catch (error) {
          logger.warn(`Failed to retrieve additional payment details: ${error}`);
        }
      }

      // Calculate processing fee (example: 2.9% + ₹2.5 for Stripe)
      const processingFee = Math.round(paymentData.amount * 0.029 + 250); // 2.9% + ₹2.5
      const netAmount = paymentData.amount - processingFee;

      // Create new payment record with enhanced details
      const paymentRecord = new Payment({
        userId: new Types.ObjectId(userId),
        
        // Stripe IDs
        stripePaymentId: paymentData.sessionId,
        stripeSessionId: paymentData.sessionId,
        stripePaymentIntentId: paymentData.paymentIntentId,
        stripeCustomerId: paymentData.customerId,
        stripePaymentMethodId: paymentData.paymentMethodId,
        
        // Payment amount and currency
        amount: paymentData.amount,
        currency: paymentData.currency || 'inr',
        netAmount: netAmount,
        
        // Token allocation
        tokens: tokens,
        
        // Payment status and processing
        status: paymentData.paymentStatus === 'paid' ? 'succeeded' : 'failed',
        
        // Payment method details
        paymentMethod: paymentMethodDetails,
        
        // Customer information
        customerEmail: paymentData.customerEmail,
        
        // Transaction details
        transactionId: transactionId,
        receiptUrl: receiptUrl,
        
        // Payment processing details
        processingFee: processingFee,
        
        // Payment timing
        paidAt: paymentData.paymentStatus === 'paid' ? new Date() : undefined,
        
        // Additional metadata
        description: paymentData.metadata?.description || 'Course payment',
        metadata: paymentData.metadata ? new Map(Object.entries(paymentData.metadata)) : undefined,
        
        // Refund information (defaults)
        refundAmount: 0,
        
        // Risk assessment (defaults)
        riskLevel: 'low',
        
        // Payment source tracking
        source: 'web',
      });

      await paymentRecord.save();

      // Add tokens to user account
      await PaymentService.addTokensToUser(userId, tokens, paymentData.sessionId);

      logger.info(`Payment record created successfully for session: ${paymentData.sessionId}`, {
        userId,
        amount: formatAmount(paymentData.amount),
        netAmount: formatAmount(netAmount),
        processingFee: formatAmount(processingFee),
        tokens,
        status: paymentRecord.status,
        currency: paymentRecord.currency,
        paymentMethod: paymentRecord.paymentMethod?.type,
        transactionId: paymentRecord.transactionId,
        receiptUrl: paymentRecord.receiptUrl ? 'Available' : 'Not available'
      });
      
    } catch (error) {
      logger.error('Error updating payment in database:', error);
      throw error;
    }
  }

  /**
   * Add tokens to user account
   * @param userId - User ID
   * @param tokens - Number of tokens to add
   * @param sessionId - Payment session ID for reference
   */
  private static async addTokensToUser(userId: string, tokens: number, sessionId: string): Promise<void> {
    try {
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
          sessionId
        });
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
          sessionId
        });
      }
      
    } catch (error) {
      logger.error('Error adding tokens to user account:', error);
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
