import Joi from "joi";

export const createPaymentIntentValidation = Joi.object({
  amount: Joi.number()
    .min(1)
    .max(1000000) // Max 10,000 INR
    .required()
    .messages({
      "number.base": "Amount must be a number",
      "number.min": "Amount must be at least 1 INR",
      "number.max": "Amount cannot exceed 10,000 INR",
      "any.required": "Amount is required"
    })
});

export const confirmPaymentValidation = Joi.object({
  paymentIntentId: Joi.string()
    .pattern(/^pi_[a-zA-Z0-9_]+$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid Payment Intent ID format",
      "any.required": "Payment Intent ID is required"
    }),
  paymentMethodId: Joi.string()
    .pattern(/^pm_[a-zA-Z0-9_]+$/)
    .optional()
    .messages({
      "string.pattern.base": "Invalid Payment Method ID format"
    })
});

export const createUPIPaymentMethodValidation = Joi.object({
  upiId: Joi.string()
    .pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z]{3,}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid UPI ID format (e.g., user@paytm)",
      "any.required": "UPI ID is required"
    })
});

export const refundValidation = Joi.object({
  paymentIntentId: Joi.string()
    .pattern(/^pi_[a-zA-Z0-9_]+$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid Payment Intent ID format",
      "any.required": "Payment Intent ID is required"
    }),
  amount: Joi.number()
    .min(1)
    .optional()
    .messages({
      "number.base": "Refund amount must be a number",
      "number.min": "Refund amount must be at least 1 INR"
    }),
  reason: Joi.string()
    .valid("duplicate", "fraudulent", "requested_by_customer")
    .optional()
    .messages({
      "any.only": "Invalid refund reason"
    })
});
