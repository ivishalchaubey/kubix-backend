import { Router } from "express";
import { PaymentController } from "../controllers/payment.controller";
import { PaymentStatusController } from "../controllers/payment-status.controller";
import { config } from "../../../config/env.js";
import AuthMiddleware from "../../../middlewares/auth.js";

/**
 * Razorpay Payment Routes
 * Handles all payment-related API endpoints
 */
const router = Router();

/**
 * @route   POST /api/v1/razorpay/create-order
 * @desc    Create a Razorpay order for payment
 * @access  Public
 * @body    {
 *   amount: number (required) - Amount in paise
 *   currency?: string (optional) - Currency code (default: 'INR')
 *   customerEmail?: string (optional) - Customer email
 *   metadata?: object (optional) - Additional metadata
 * }
 */
router.post("/create-order", PaymentController.createOrder);

/**
 * @route   POST /api/v1/razorpay/webhook
 * @desc    Handle Razorpay webhook events
 * @access  Public (Razorpay only)
 * @note    This endpoint should be configured in Razorpay dashboard
 * @note    Requires raw body parser middleware
 */
router.post(
  "/webhook",
  // Middleware to capture raw body for webhook signature verification
  (req, res, next) => {
    if (req.get("content-type")?.includes("application/json")) {
      let data = "";
      req.setEncoding("utf8");
      req.on("data", (chunk) => {
        data += chunk;
      });
      req.on("end", () => {
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
 * @route   POST /api/v1/razorpay/verify-payment
 * @desc    Verify Razorpay payment signature
 * @access  Public
 * @body    {
 *   razorpay_order_id: string,
 *   razorpay_payment_id: string,
 *   razorpay_signature: string
 * }
 */
router.post("/verify-payment", PaymentController.verifyPayment);

/**
 * @route   GET /api/v1/razorpay/order/:orderId
 * @desc    Get payment order status
 * @access  Public
 * @params  orderId - Razorpay order ID
 */
router.get("/order/:orderId", PaymentController.getOrderStatus);

/**
 * @route   GET /api/v1/razorpay/config
 * @desc    Get Razorpay configuration for frontend
 * @access  Public
 */
router.get("/config", (req, res) => {
  res.json({
    success: true,
    message: "Razorpay configuration retrieved successfully",
    data: {
      keyId: config.razorpay.keyId,
      currency: "INR",
      supportedPaymentMethods: ["card", "netbanking", "wallet", "upi"],
      frontendUrl: config.frontendUrl,
    },
  });
});

// Payment Status and Verification Routes

/**
 * @route   GET /api/v1/razorpay/payment/:paymentId/details
 * @desc    Get detailed payment information
 * @access  Public
 */
router.get(
  "/payment/:paymentId/details",
  PaymentStatusController.getPaymentDetails
);

/**
 * @route   GET /api/v1/razorpay/payment/:paymentId/verify
 * @desc    Verify if payment was successful
 * @access  Public
 */
router.get(
  "/payment/:paymentId/verify",
  AuthMiddleware.authenticate,
  PaymentStatusController.verifyPaymentSuccess
);

/**
 * @route   GET /api/v1/razorpay/payment/:paymentId/receipt
 * @desc    Get payment receipt/confirmation
 * @access  Public
 */
router.get(
  "/payment/:paymentId/receipt",
  PaymentStatusController.getPaymentReceipt
);

/**
 * @route   GET /api/v1/razorpay/payments/customer/:email
 * @desc    Get all payments for a specific customer
 * @access  Public
 * @query   limit, offset
 */
router.get(
  "/payments/customer/:email",
  PaymentStatusController.getCustomerPayments
);

/**
 * @route   GET /api/v1/razorpay/analytics/payments
 * @desc    Get payment analytics for owner/admin
 * @access  Public
 * @query   start_date, end_date, limit
 */
router.get("/analytics/payments", PaymentStatusController.getPaymentAnalytics);

/**
 * @route   GET /api/v1/razorpay/payment-history
 * @desc    Get payment history for authenticated user
 * @access  Private
 */
router.get(
  "/payment-history",
  AuthMiddleware.authenticate,
  PaymentController.getPaymentHistory
);

export default router;
