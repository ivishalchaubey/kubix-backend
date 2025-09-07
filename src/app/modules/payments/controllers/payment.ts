import { Request, Response, NextFunction } from "express";
import ResponseUtil from "../../../utils/response.js";
import { API_MESSAGES } from "../../../constants/enums.js";
import PaymentService from "../services/payment.js";
import { AuthRequest } from "../../../types/global.js";

class PaymentController {
    public paymentService: PaymentService;

    constructor() {
        this.paymentService = new PaymentService();
    }

    async createPaymentIntent(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user) {
                ResponseUtil.unauthorized(res, API_MESSAGES.ERROR.UNAUTHORIZED);
                return;
            }

            const { amount } = req.body;
            const userId = req.user._id;
            let tokens = 10 * amount; // 1 INR = 10 tokens

            // Validate input
            if (!amount || amount <= 0) {
                ResponseUtil.badRequest(res, "Amount must be greater than 0");
                return;
            }

            const result = await this.paymentService.createPaymentIntent({
                userId,
                amount,
                tokens
            });

            ResponseUtil.created(res, result, "Payment Intent created successfully");
        } catch (error) {
            next(error);
        }
    }

    async confirmPayment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user) {
                ResponseUtil.unauthorized(res, API_MESSAGES.ERROR.UNAUTHORIZED);
                return;
            }

            const { paymentIntentId, paymentMethodId } = req.body;

            if (!paymentIntentId) {
                ResponseUtil.badRequest(res, "Payment Intent ID is required");
                return;
            }

            const result = await this.paymentService.confirmPayment(paymentIntentId, paymentMethodId);

            ResponseUtil.success(res, result, "Payment confirmed successfully");
        } catch (error) {
            next(error);
        }
    }

    async getPayments(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { page = 1, limit = 10, status } = req.query;
            
            const result = await this.paymentService.getPayments({
                page: Number(page),
                limit: Number(limit),
                status: status as string
            });

            ResponseUtil.success(res, result, "Payments fetched successfully");
        } catch (error) {
            next(error);
        }
    }

    async getPaymentById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const paymentId = req.params.id;
            const result = await this.paymentService.getPaymentById(paymentId);

            ResponseUtil.success(res, result, "Payment fetched successfully");
        } catch (error) {
            next(error);
        }
    }

    async updatePayment(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const paymentId = req.params.id;
            const updateData = req.body;

            const result = await this.paymentService.updatePayment(paymentId, updateData);

            ResponseUtil.success(res, result, "Payment updated successfully");
        } catch (error) {
            next(error);
        }
    }

    async deletePayment(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const paymentId = req.params.id;
            await this.paymentService.deletePayment(paymentId);

            ResponseUtil.success(res, null, "Payment deleted successfully");
        } catch (error) {
            next(error);
        }
    }

    async getUserPayments(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user) {
                ResponseUtil.unauthorized(res, API_MESSAGES.ERROR.UNAUTHORIZED);
                return;
            }

            const userId = req.user._id;
            const { page = 1, limit = 10, status } = req.query;

            const result = await this.paymentService.getUserPayments(userId, {
                page: Number(page),
                limit: Number(limit),
                status: status as string
            });

            ResponseUtil.success(res, result, "User payments fetched successfully");
        } catch (error) {
            next(error);
        }
    }

    async getPaymentByStripeId(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { stripePaymentId } = req.params;
            const result = await this.paymentService.getPaymentByStripeId(stripePaymentId);

            ResponseUtil.success(res, result, "Payment fetched successfully");
        } catch (error) {
            next(error);
        }
    }

    async handleStripeWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const signature = req.headers['stripe-signature'] as string;
            const result = await this.paymentService.handleStripeWebhook(req.body, signature);

            ResponseUtil.success(res, result, "Webhook processed successfully");
        } catch (error) {
            next(error);
        }
    }
}

export default PaymentController;
