import { Router } from "express";
import PaymentController from "../controllers/payment.js";
import AuthMiddleware from "../../../middlewares/auth.js";

const router = Router();
const paymentController = new PaymentController();

// Payment routes
router.post("/create-intent", AuthMiddleware.authenticate, paymentController.createPaymentIntent.bind(paymentController));
router.post("/confirm", AuthMiddleware.authenticate, paymentController.confirmPayment.bind(paymentController));
router.get("/", paymentController.getPayments.bind(paymentController));
router.get("/:id", paymentController.getPaymentById.bind(paymentController));
router.get("/stripe/:stripePaymentId", paymentController.getPaymentByStripeId.bind(paymentController));
router.put("/:id", paymentController.updatePayment.bind(paymentController));
router.delete("/:id", paymentController.deletePayment.bind(paymentController));
router.get("/user/payments", AuthMiddleware.authenticate, paymentController.getUserPayments.bind(paymentController));
router.post("/webhook/stripe", paymentController.handleStripeWebhook.bind(paymentController));

export default router;
