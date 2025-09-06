import Stripe from 'stripe';
import { config } from '../../../config/env.js';

/**
 * Stripe configuration and initialization
 * This module handles Stripe API setup and configuration
 */

// Initialize Stripe with secret key
export const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: '2025-08-27.basil', // Use the latest API version
  typescript: true,
});

// Stripe configuration constants
export const STRIPE_CONFIG = {
  currency: 'inr' as const,
  paymentMethods: ['card', 'upi'] as Stripe.Checkout.SessionCreateParams.PaymentMethodType[],
  successUrl: `${config.frontendUrl}/payment/success`,
  cancelUrl: `${config.frontendUrl}/payment/cancel`,
};

// Payment amount validation
export const validatePaymentAmount = (amount: number): boolean => {
  // Minimum amount in paise (₹1 = 100 paise)
  const minAmount = 100; // ₹1
  // Maximum amount in paise (₹1,00,000 = 10,000,000 paise)
  const maxAmount = 10000000; // ₹1,00,000
  
  return amount >= minAmount && amount <= maxAmount;
};

// Convert amount to display format (paise to rupees)
export const formatAmount = (amountInPaise: number): string => {
  return `₹${(amountInPaise / 100).toFixed(2)}`;
};

export default stripe;
