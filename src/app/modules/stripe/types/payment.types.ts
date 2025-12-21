/**
 * TypeScript types for Stripe payment functionality
 */

export interface CreateCheckoutSessionRequest {
  amount: number; // Amount in paise
  currency: string | undefined; // Defaults to 'inr'
  successUrl: string | undefined;
  cancelUrl: string | undefined;
  customerEmail: string | undefined;
  metadata?: Record<string, string> | undefined;
}

export interface CreateCheckoutSessionResponse {
  success: boolean;
  sessionId: string;
  sessionUrl: string;
  message: string;
}

export interface WebhookEventData {
  id: string;
  object: string;
  type: string;
  data: {
    object: any;
  };
}

export interface PaymentSuccessData {
  sessionId: string;
  customerEmail: string | undefined;
  amount: number;
  currency: string;
  paymentStatus: string | undefined;
  metadata: Record<string, string> | undefined;
  paymentIntentId?: string | undefined;
  customerId?: string | undefined;
  paymentMethodId?: string | undefined;
}

export interface StripeErrorResponse {
  success: false;
  error: string;
  message: string;
}
