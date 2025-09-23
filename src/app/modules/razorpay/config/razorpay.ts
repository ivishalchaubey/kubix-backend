import Razorpay from "razorpay";
import { config } from "../../../config/env.js";

/**
 * Razorpay configuration and initialization
 * This module handles Razorpay API setup and configuration
 */

// Check if Razorpay credentials are available
const hasRazorpayCredentials =
  config.razorpay.keyId && config.razorpay.keySecret;

// Initialize Razorpay with key ID and secret (only if credentials are available)
export const razorpay = hasRazorpayCredentials
  ? new Razorpay({
      key_id: config.razorpay.keyId,
      key_secret: config.razorpay.keySecret,
    })
  : null;

// Razorpay configuration constants
export const RAZORPAY_CONFIG = {
  currency: "INR" as const,
  paymentMethods: ["card", "netbanking", "wallet", "upi", "emi"],
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

// Utility function to generate receipt ID
export const generateReceiptId = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `receipt_${timestamp}_${random}`;
};

export default razorpay;
