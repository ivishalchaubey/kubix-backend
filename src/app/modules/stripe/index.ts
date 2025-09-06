/**
 * Stripe Payment Module
 * Complete Stripe payment gateway integration
 * 
 * Features:
 * - Create checkout sessions with INR currency
 * - Support for Card and UPI payment methods
 * - Webhook handling for payment events
 * - Session status tracking
 * - Production-ready error handling
 */

export { default as stripeRoutes } from './routes/stripe.routes.js';
export { PaymentController } from './controllers/payment.controller.js';
export { PaymentService } from './services/payment.service.js';
export { stripe, STRIPE_CONFIG } from './config/stripe.js';
export * from './types/payment.types.js';
