import { Request, Response, NextFunction } from 'express';
import Stripe from 'stripe';
import { PaymentService } from '../services/payment.service.js';
import { stripe } from '../config/stripe.js';
import { config } from '../../../config/env.js';
import logger from '../../../utils/logger.js';
import asyncHandler from '../../../utils/asyncHandler.js';
import ResponseUtil from '../../../utils/response.js';

/**
 * Payment Status Controller
 * Handles payment verification and status checking
 */
export class PaymentStatusController {

  /**
   * Get detailed payment information
   * GET /api/v1/stripe/payment/:sessionId/details
   */
  static getPaymentDetails = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { sessionId } = req.params;

        if (!sessionId) {
          return ResponseUtil.badRequest(res, 'Session ID is required');
        }

        // Get session details
        const session = await PaymentService.getCheckoutSession(sessionId);
        
        // Get payment intent details if available
        let paymentIntent = null;
        if (session.payment_intent) {
          const paymentIntentResponse = await stripe.paymentIntents.retrieve(session.payment_intent as string, {
            expand: ['charges']
          });
          paymentIntent = paymentIntentResponse;
        }

        // Get customer details if available
        let customer = null;
        if (session.customer) {
          const customerResponse = await stripe.customers.retrieve(session.customer as string);
          customer = customerResponse.deleted ? null : customerResponse;
        }

        const paymentDetails = {
          session: {
            id: session.id,
            status: session.payment_status,
            amount: session.amount_total,
            currency: session.currency,
            customerEmail: session.customer_email,
            createdAt: new Date(session.created * 1000).toISOString(),
            metadata: session.metadata,
          },
          paymentIntent: paymentIntent ? {
            id: paymentIntent.id,
            status: paymentIntent.status,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
            paymentMethod: paymentIntent.payment_method,
            charges: (paymentIntent as any).charges?.data?.map((charge: any) => ({
              id: charge.id,
              status: charge.status,
              amount: charge.amount,
              paid: charge.paid,
              receiptUrl: charge.receipt_url,
            })),
          } : null,
          customer: customer ? {
            id: customer.id,
            email: customer.email,
            name: customer.name,
          } : null,
        };

        return ResponseUtil.success(res, paymentDetails, 'Payment details retrieved successfully');

      } catch (error) {
        logger.error('Error retrieving payment details:', error);
        const errorMessage = error instanceof Error ? error.message : 'Internal server error';
        return ResponseUtil.internalServerError(res, errorMessage);
      }
    }
  );

  /**
   * Verify payment success
   * GET /api/v1/stripe/payment/:sessionId/verify
   */
  static verifyPaymentSuccess = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { sessionId } = req.params;

        if (!sessionId) {
          return ResponseUtil.badRequest(res, 'Session ID is required');
        }

        const session = await PaymentService.getCheckoutSession(sessionId);
        
        const isPaymentSuccessful = session.payment_status === 'paid';
        
        const verificationResult = {
          sessionId: session.id,
          isSuccessful: isPaymentSuccessful,
          paymentStatus: session.payment_status,
          amount: session.amount_total,
          currency: session.currency,
          customerEmail: session.customer_email,
          paidAt: isPaymentSuccessful ? new Date(session.created * 1000).toISOString() : null,
          verificationTimestamp: new Date().toISOString(),
        };

        logger.info(`Payment verification for session ${sessionId}: ${isPaymentSuccessful ? 'SUCCESS' : 'FAILED'}`);

        return ResponseUtil.success(res, verificationResult, 
          isPaymentSuccessful ? 'Payment verified successfully' : 'Payment not successful'
        );

      } catch (error) {
        logger.error('Error verifying payment:', error);
        const errorMessage = error instanceof Error ? error.message : 'Internal server error';
        return ResponseUtil.internalServerError(res, errorMessage);
      }
    }
  );

  /**
   * Get payment receipt/confirmation
   * GET /api/v1/stripe/payment/:sessionId/receipt
   */
  static getPaymentReceipt = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { sessionId } = req.params;

        if (!sessionId) {
          return ResponseUtil.badRequest(res, 'Session ID is required');
        }

        const session = await PaymentService.getCheckoutSession(sessionId);
        
        if (session.payment_status !== 'paid') {
          return ResponseUtil.badRequest(res, 'Payment not completed yet');
        }

        // Get payment intent and charges
        let receiptData = null;
        if (session.payment_intent) {
          const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent as string, {
            expand: ['charges']
          });
          
          if ((paymentIntent as any).charges?.data?.[0]) {
            const charge = (paymentIntent as any).charges.data[0];
            receiptData = {
              receiptNumber: charge.id,
              receiptUrl: charge.receipt_url,
              amount: charge.amount,
              currency: charge.currency.toUpperCase(),
              paidAt: new Date(charge.created * 1000).toISOString(),
              paymentMethod: charge.payment_method_details?.type,
              customerEmail: session.customer_email,
              description: 'Course Payment',
            };
          }
        }

        if (!receiptData) {
          return ResponseUtil.badRequest(res, 'Receipt not available');
        }

        return ResponseUtil.success(res, receiptData, 'Payment receipt retrieved successfully');

      } catch (error) {
        logger.error('Error retrieving payment receipt:', error);
        const errorMessage = error instanceof Error ? error.message : 'Internal server error';
        return ResponseUtil.internalServerError(res, errorMessage);
      }
    }
  );

  /**
   * Get all payments for a customer
   * GET /api/v1/stripe/payments/customer/:email
   */
  static getCustomerPayments = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { email } = req.params;
        const { limit = 10, starting_after } = req.query;

        if (!email) {
          return ResponseUtil.badRequest(res, 'Customer email is required');
        }

        // Search for customer by email
        const customers = await stripe.customers.list({
          email: email,
          limit: 1,
        });

        if (customers.data.length === 0) {
          return ResponseUtil.success(res, [], 'No customer found with this email');
        }

        const customer = customers.data[0];

        // Get payment intents for this customer
        const paymentIntents = await stripe.paymentIntents.list({
          customer: customer.id,
          limit: parseInt(limit as string),
          ...(starting_after && { starting_after: starting_after as string }),
        });

        const payments = paymentIntents.data.map(intent => ({
          id: intent.id,
          amount: intent.amount,
          currency: intent.currency,
          status: intent.status,
          createdAt: new Date(intent.created * 1000).toISOString(),
          customerEmail: email,
          metadata: intent.metadata,
        }));

        return ResponseUtil.success(res, {
          customer: {
            id: customer.id,
            email: customer.email,
            name: customer.name,
          },
          payments,
          hasMore: paymentIntents.has_more,
        }, 'Customer payments retrieved successfully');

      } catch (error) {
        logger.error('Error retrieving customer payments:', error);
        const errorMessage = error instanceof Error ? error.message : 'Internal server error';
        return ResponseUtil.internalServerError(res, errorMessage);
      }
    }
  );

  /**
   * Get payment analytics for owner/admin
   * GET /api/v1/stripe/analytics/payments
   */
  static getPaymentAnalytics = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { start_date, end_date, limit = 100 } = req.query;

        // Get payment intents within date range
        const paymentIntents = await stripe.paymentIntents.list({
          limit: parseInt(limit as string),
          ...(start_date && { created: { gte: Math.floor(new Date(start_date as string).getTime() / 1000) } }),
          ...(end_date && { created: { lte: Math.floor(new Date(end_date as string).getTime() / 1000) } }),
        });

        const analytics = {
          totalPayments: paymentIntents.data.length,
          successfulPayments: paymentIntents.data.filter(p => p.status === 'succeeded').length,
          failedPayments: paymentIntents.data.filter(p => p.status === 'requires_payment_method').length,
          totalAmount: paymentIntents.data.reduce((sum, p) => sum + p.amount, 0),
          successfulAmount: paymentIntents.data
            .filter(p => p.status === 'succeeded')
            .reduce((sum, p) => sum + p.amount, 0),
          currency: 'inr',
          payments: paymentIntents.data.map(intent => ({
            id: intent.id,
            amount: intent.amount,
            currency: intent.currency,
            status: intent.status,
            createdAt: new Date(intent.created * 1000).toISOString(),
            customerEmail: intent.receipt_email,
            metadata: intent.metadata,
          })),
        };

        return ResponseUtil.success(res, analytics, 'Payment analytics retrieved successfully');

      } catch (error) {
        logger.error('Error retrieving payment analytics:', error);
        const errorMessage = error instanceof Error ? error.message : 'Internal server error';
        return ResponseUtil.internalServerError(res, errorMessage);
      }
    }
  );
}
