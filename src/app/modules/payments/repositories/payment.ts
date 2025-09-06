import { Types } from "mongoose";
import Payment from "../models/payment.js";
import { IPayment, QueryOptions } from "../../../types/global.js";
import { AppError } from "../../../middlewares/errorHandler.js";
import { API_MESSAGES, HttpStatus } from "../../../constants/enums.js";

class PaymentRepository {
  
  async createPayment(paymentData: Partial<IPayment>): Promise<IPayment> {
    try {
      const payment = new Payment(paymentData);
      return await payment.save();
    } catch (error) {
      throw new AppError(
        "Failed to create payment",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getPaymentById(paymentId: string): Promise<IPayment | null> {
    if (!Types.ObjectId.isValid(paymentId)) {
      throw new AppError(
        API_MESSAGES.ERROR.NOT_FOUND,
        HttpStatus.NOT_FOUND
      );
    }

    return await Payment.findById(paymentId).populate("userId", "firstName lastName email");
  }

  async getPayments(options: QueryOptions & { status?: string }): Promise<{
    payments: IPayment[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10, status, sortBy = "-createdAt" } = options;
    const skip = (page - 1) * limit;

    const query: any = {};
    if (status) {
      query.status = status;
    }

    const [payments, total] = await Promise.all([
      Payment.find(query)
        .populate("userId", "firstName lastName email")
        .sort(sortBy)
        .skip(skip)
        .limit(limit)
        .lean(),
      Payment.countDocuments(query)
    ]);

    return {
      payments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getUserPayments(
    userId: string,
    options: QueryOptions & { status?: string }
  ): Promise<{
    payments: IPayment[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new AppError(
        API_MESSAGES.ERROR.USER_NOT_FOUND,
        HttpStatus.NOT_FOUND
      );
    }

    const { page = 1, limit = 10, status, sortBy = "-createdAt" } = options;
    const skip = (page - 1) * limit;

    const query: any = { userId: new Types.ObjectId(userId) };
    if (status) {
      query.status = status;
    }

    const [payments, total] = await Promise.all([
      Payment.find(query)
        .populate("userId", "firstName lastName email")
        .sort(sortBy)
        .skip(skip)
        .limit(limit)
        .lean(),
      Payment.countDocuments(query)
    ]);

    return {
      payments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async updatePayment(paymentId: string, updateData: Partial<IPayment>): Promise<IPayment | null> {
    if (!Types.ObjectId.isValid(paymentId)) {
      throw new AppError(
        API_MESSAGES.ERROR.NOT_FOUND,
        HttpStatus.NOT_FOUND
      );
    }

    return await Payment.findByIdAndUpdate(
      paymentId,
      updateData,
      { new: true, runValidators: true }
    ).populate("userId", "firstName lastName email");
  }

  async deletePayment(paymentId: string): Promise<IPayment | null> {
    if (!Types.ObjectId.isValid(paymentId)) {
      throw new AppError(
        API_MESSAGES.ERROR.NOT_FOUND,
        HttpStatus.NOT_FOUND
      );
    }

    return await Payment.findByIdAndDelete(paymentId);
  }

  async getPaymentByStripeId(stripePaymentId: string): Promise<IPayment | null> {
    return await Payment.findOne({ stripePaymentId }).populate("userId", "firstName lastName email");
  }

  async updatePaymentStatus(stripePaymentId: string, status: string): Promise<IPayment | null> {
    return await Payment.findOneAndUpdate(
      { stripePaymentId },
      { status },
      { new: true, runValidators: true }
    ).populate("userId", "firstName lastName email");
  }

  async getPaymentStats(): Promise<{
    totalPayments: number;
    totalAmount: number;
    successfulPayments: number;
    failedPayments: number;
    pendingPayments: number;
  }> {
    const [totalPayments, totalAmount, successfulPayments, failedPayments, pendingPayments] = await Promise.all([
      Payment.countDocuments(),
      Payment.aggregate([
        { $match: { status: "succeeded" } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      Payment.countDocuments({ status: "succeeded" }),
      Payment.countDocuments({ status: "failed" }),
      Payment.countDocuments({ status: "pending" })
    ]);

    return {
      totalPayments,
      totalAmount: totalAmount[0]?.total || 0,
      successfulPayments,
      failedPayments,
      pendingPayments
    };
  }
}

export default PaymentRepository;
