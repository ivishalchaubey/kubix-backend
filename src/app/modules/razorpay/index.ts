/**
 * Razorpay Module Index
 * Exports all Razorpay-related functionality
 */

export { PaymentController } from "./controllers/payment.controller.js";
export { PaymentStatusController } from "./controllers/payment-status.controller.js";
export { PaymentService } from "./services/payment.service.js";
export { razorpay, RAZORPAY_CONFIG } from "./config/razorpay.js";
export * from "./types/payment.types.js";

// Import and export routes as default
import razorpayRoutes from "./routes/razorpay.routes.js";
export default razorpayRoutes;
