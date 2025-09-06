import { Request, Response, NextFunction } from 'express';
import Stripe from 'stripe';
import { PaymentService } from '../services/payment.service.js';
import { CreateCheckoutSessionRequest, StripeErrorResponse } from '../types/payment.types.js';
import { config } from '../../../config/env.js';
import logger from '../../../utils/logger.js';
import asyncHandler from '../../../utils/asyncHandler.js';
import ResponseUtil from '../../../utils/response.js';

/**
 * Payment Controller
 * Handles HTTP requests for payment operations
 */
export class PaymentController {

  /**
   * Create Stripe Checkout Session
   * POST /api/v1/stripe/create-checkout-session
   */
  static createCheckoutSession = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const {
          amount,
          currency,
          successUrl,
          cancelUrl,
          customerEmail,
          metadata
        }: CreateCheckoutSessionRequest = req.body;

        // Validate required fields
        if (!amount) {
          return ResponseUtil.badRequest(res, 'Amount is required');
        }

        // Validate amount is a positive number
        if (typeof amount !== 'number' || amount <= 0) {
          return ResponseUtil.badRequest(res, 'Amount must be a positive number');
        }

        // Add userId to metadata if user is authenticated
        const enhancedMetadata = {
          ...metadata,
          ...(req.user?._id && { userId: req.user._id })
        };

        // Create checkout session
        const result = await PaymentService.createCheckoutSession({
          amount,
          currency,
          successUrl,
          cancelUrl,
          customerEmail,
          metadata: enhancedMetadata
        });

        logger.info(`Checkout session created: ${result.sessionId}`);

        return ResponseUtil.success(res, {
          sessionId: result.sessionId,
          sessionUrl: result.sessionUrl,
          amount: amount,
          currency: currency || 'inr'
        }, result.message);

      } catch (error) {
        logger.error('Error in createCheckoutSession controller:', error);
        
        const errorMessage = error instanceof Error ? error.message : 'Internal server error';
        return ResponseUtil.internalServerError(res, errorMessage);
      }
    }
  );

  /**
   * Handle Stripe Webhook Events
   * POST /api/v1/stripe/webhook
   */
  static handleWebhook = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const sig = req.headers['stripe-signature'] as string;
        const webhookSecret = config.stripe.webhookSecret;

        if (!sig) {
          logger.error('Missing Stripe signature header');
          return ResponseUtil.badRequest(res, 'Missing Stripe signature');
        }

        if (!webhookSecret) {
          logger.error('Missing Stripe webhook secret');
          return ResponseUtil.internalServerError(res, 'Webhook secret not configured');
        }

        let event: Stripe.Event;

        try {
          // Verify webhook signature with raw body
          const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
          event = Stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
        } catch (err) {
          logger.error('Webhook signature verification failed:', err);
          return ResponseUtil.badRequest(res, 'Invalid signature');
        }

        logger.info(`Received webhook event: ${event.type}`);

        // Handle the event
        switch (event.type) {
          case 'checkout.session.completed':
            const session = event.data.object as Stripe.Checkout.Session;
            await PaymentController.handleCheckoutSessionCompleted(session);
            break;

          case 'payment_intent.succeeded':
            const paymentIntent = event.data.object as Stripe.PaymentIntent;
            logger.info(`Payment succeeded: ${paymentIntent.id}`);
            break;

          case 'payment_intent.payment_failed':
            const failedPayment = event.data.object as Stripe.PaymentIntent;
            logger.warn(`Payment failed: ${failedPayment.id}`);
            break;

          default:
            logger.info(`Unhandled event type: ${event.type}`);
        }

        return ResponseUtil.success(res, null, 'Webhook processed successfully');

      } catch (error) {
        logger.error('Error in webhook handler:', error);
        return ResponseUtil.internalServerError(res, 'Webhook processing failed');
      }
    }
  );

  /**
   * Handle checkout session completed event
   * @param session - Completed checkout session
   */
  private static async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
    try {
      logger.info(`Processing completed checkout session: ${session.id}`);

      // Handle payment success
      await PaymentService.handlePaymentSuccess(session);

      logger.info(`Successfully processed checkout session: ${session.id}`);

    } catch (error) {
      logger.error(`Error processing checkout session ${session.id}:`, error);
      throw error;
    }
  }

  /**
   * Get payment session status
   * GET /api/v1/stripe/session/:sessionId
   */
  static getSessionStatus = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { sessionId } = req.params;

        if (!sessionId) {
          return ResponseUtil.badRequest(res, 'Session ID is required');
        }

        const session = await PaymentService.getCheckoutSession(sessionId);
        // add data in payment record

        return ResponseUtil.success(res, {
          sessionId: session.id,
          status: session.payment_status,
          amount: session.amount_total,
          currency: session.currency,
          customerEmail: session.customer_email,
          createdAt: new Date(session.created * 1000).toISOString(),
        }, 'Session retrieved successfully');

      } catch (error) {
        logger.error('Error retrieving session status:', error);
        
        const errorMessage = error instanceof Error ? error.message : 'Internal server error';
        return ResponseUtil.internalServerError(res, errorMessage);
      }
    }
  );
}
