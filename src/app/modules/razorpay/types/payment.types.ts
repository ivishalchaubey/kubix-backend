/**
 * TypeScript types for Razorpay payment functionality
 */

export interface CreateOrderRequest {
  amount: number; // Amount in paise
  currency?: string; // Defaults to 'INR'
  customerEmail?: string;
  metadata?: Record<string, string>;
}

export interface CreateOrderResponse {
  success: boolean;
  orderId: string;
  orderKey: string;
  message: string;
  keyId: string;
  currency: string;
  amount: number;
}

export interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  verified: boolean;
  message: string;
  paymentId?: string;
}

export interface WebhookEventData {
  entity: string;
  account_id: string;
  event: string;
  contains: string[];
  payload: {
    payment:
      | {
          entity: RazorpayPayment;
        }
      | {
          order: {
            entity: RazorpayOrder;
          };
        };
  };
  created_at: number;
}

export interface RazorpayPayment {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  status: string;
  order_id: string;
  invoice_id?: string;
  international: boolean;
  method: string;
  amount_refunded: number;
  refund_status?: string;
  captured: boolean;
  description?: string;
  card_id?: string;
  bank?: string;
  wallet?: string;
  vpa?: string;
  email: string;
  contact: string;
  notes: Record<string, string>;
  fee?: number;
  tax?: number;
  error_code?: string;
  error_description?: string;
  error_source?: string;
  error_step?: string;
  error_reason?: string;
  acquirer_data?: Record<string, any>;
  created_at: number;
}

export interface RazorpayOrder {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt?: string;
  offer_id?: string;
  status: string;
  attempts: number;
  notes: Record<string, string>;
  created_at: number;
}

export interface PaymentSuccessData {
  orderId: string;
  paymentId: string;
  customerEmail?: string;
  amount: number;
  currency: string;
  paymentStatus: string;
  metadata?: Record<string, string>;
  method?: string;
  bank?: string;
  wallet?: string;
  vpa?: string;
  contact?: string;
}

export interface RazorpayErrorResponse {
  success: false;
  error: string;
  message: string;
}

export interface RazorpayWebhookEvent {
  entity: string;
  account_id: string;
  event: string;
  contains: string[];
  payload: any;
  created_at: number;
}
