import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller.js';
import { PaymentStatusController } from '../controllers/payment-status.controller.js';
import { config } from '../../../config/env.js';
import AuthMiddleware from '../../../middlewares/auth.js';

/**
 * Stripe Payment Routes
 * Handles all payment-related API endpoints
 */
const router = Router();

/**
 * @route   POST /api/v1/stripe/create-checkout-session
 * @desc    Create a Stripe checkout session for payment
 * @access  Public
 * @body    {
 *   amount: number (required) - Amount in paise
 *   currency?: string (optional) - Currency code (default: 'inr')
 *   successUrl?: string (optional) - Success redirect URL
 *   cancelUrl?: string (optional) - Cancel redirect URL
 *   customerEmail?: string (optional) - Customer email
 *   metadata?: object (optional) - Additional metadata
 * }
 */
router.post('/create-checkout-session', PaymentController.createCheckoutSession);

/**
 * @route   POST /api/v1/stripe/webhook
 * @desc    Handle Stripe webhook events
 * @access  Public (Stripe only)
 * @note    This endpoint should be configured in Stripe dashboard
 * @note    Requires raw body parser middleware
 */
router.post('/webhook', 
  // Middleware to capture raw body for webhook signature verification
  (req, res, next) => {
    if (req.get('content-type')?.includes('application/json')) {
      let data = '';
      req.setEncoding('utf8');
      req.on('data', (chunk) => {
        data += chunk;
      });
      req.on('end', () => {
        req.body = data;
        next();
      });
    } else {
      next();
    }
  },
  PaymentController.handleWebhook
);

/**
 * @route   GET /api/v1/stripe/session/:sessionId
 * @desc    Get payment session status
 * @access  Public
 * @params  sessionId - Stripe session ID
 */
router.get('/session/:sessionId', PaymentController.getSessionStatus);

/**
 * @route   GET /api/v1/stripe/config
 * @desc    Get Stripe configuration for frontend
 * @access  Public
 */
router.get('/config', (req, res) => {
  res.json({
    success: true,
    message: 'Stripe configuration retrieved successfully',
    data: {
      publishableKey: config.stripe.publishableKey,
      currency: 'inr',
      supportedPaymentMethods: ['card', 'upi'],
      frontendUrl: config.frontendUrl,
    }
  });
});

// Payment Status and Verification Routes

/**
 * @route   GET /api/v1/stripe/payment/:sessionId/details
 * @desc    Get detailed payment information
 * @access  Public
 */
router.get('/payment/:sessionId/details', PaymentStatusController.getPaymentDetails);

/**
 * @route   GET /api/v1/stripe/payment/:sessionId/verify
 * @desc    Verify if payment was successful
 * @access  Public
 */
router.get('/payment/:sessionId/verify',AuthMiddleware.authenticate, PaymentStatusController.verifyPaymentSuccess);

/**
 * @route   GET /api/v1/stripe/payment/:sessionId/receipt
 * @desc    Get payment receipt/confirmation
 * @access  Public
 */
router.get('/payment/:sessionId/receipt', PaymentStatusController.getPaymentReceipt);

/**
 * @route   GET /api/v1/stripe/payments/customer/:email
 * @desc    Get all payments for a specific customer
 * @access  Public
 * @query   limit, starting_after
 */
router.get('/payments/customer/:email', PaymentStatusController.getCustomerPayments);

/**
 * @route   GET /api/v1/stripe/analytics/payments
 * @desc    Get payment analytics for owner/admin
 * @access  Public
 * @query   start_date, end_date, limit
 */
router.get('/analytics/payments', PaymentStatusController.getPaymentAnalytics);

export default router;
