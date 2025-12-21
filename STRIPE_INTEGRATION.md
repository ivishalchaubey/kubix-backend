# Stripe Payment Gateway Integration

This document provides a complete guide for the Stripe payment gateway integration in your Node.js TypeScript backend.

## 🚀 Features

- **INR Currency Support**: All payments are processed in Indian Rupees
- **Multiple Payment Methods**: Supports Card and UPI payments
- **Secure Webhook Handling**: Verified webhook events with signature validation
- **Production Ready**: Complete error handling and logging
- **TypeScript Support**: Fully typed implementation

## 📋 API Endpoints

### 1. Create Checkout Session
```
POST /api/v1/stripe/create-checkout-session
```

**Request Body:**
```json
{
  "amount": 49900,
  "currency": "inr",
  "successUrl": "http://localhost:3000/payment/success",
  "cancelUrl": "http://localhost:3000/payment/cancel",
  "customerEmail": "customer@example.com",
  "metadata": {
    "courseId": "course_123",
    "userId": "user_456"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Checkout session created successfully for ₹499.00",
  "data": {
    "sessionId": "cs_test_...",
    "sessionUrl": "https://checkout.stripe.com/pay/cs_test_...",
    "amount": 49900,
    "currency": "inr"
  }
}
```

### 2. Webhook Handler
```
POST /api/v1/stripe/webhook
```

This endpoint handles Stripe webhook events:
- `checkout.session.completed`: Payment successful
- `payment_intent.succeeded`: Payment completed
- `payment_intent.payment_failed`: Payment failed

### 3. Get Session Status
```
GET /api/v1/stripe/session/:sessionId
```

**Response:**
```json
{
  "success": true,
  "message": "Session retrieved successfully",
  "data": {
    "sessionId": "cs_test_...",
    "status": "paid",
    "amount": 49900,
    "currency": "inr",
    "customerEmail": "customer@example.com",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 4. Get Stripe Configuration
```
GET /api/v1/stripe/config
```

**Response:**
```json
{
  "success": true,
  "message": "Stripe configuration retrieved successfully",
  "data": {
    "publishableKey": "pk_test_...",
    "currency": "inr",
    "supportedPaymentMethods": ["card", "upi"],
    "frontendUrl": "http://localhost:3000"
  }
}
```

## 🔧 Setup Instructions

### 1. Environment Variables

Add these variables to your `.env` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### 2. Stripe Dashboard Setup

1. **Get API Keys:**
   - Go to [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
   - Copy your Secret Key and Publishable Key

2. **Create Webhook Endpoint:**
   - Go to [Webhooks](https://dashboard.stripe.com/webhooks)
   - Click "Add endpoint"
   - URL: `https://yourdomain.com/api/v1/stripe/webhook`
   - Events to send: `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Copy the webhook signing secret

### 3. Test the Integration

#### Test Payment Flow:
```bash
# 1. Create a checkout session
curl -X POST http://localhost:5000/api/v1/stripe/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 49900,
    "customerEmail": "test@example.com"
  }'

# 2. Use the sessionUrl in the response to complete payment
# 3. Check webhook logs for payment completion
```

#### Test Webhook Locally:
```bash
# Install Stripe CLI
stripe listen --forward-to localhost:5000/api/v1/stripe/webhook

# Trigger a test event
stripe trigger checkout.session.completed
```

## 💰 Payment Amounts

- **Amount Format**: All amounts are in paise (smallest currency unit)
- **Example**: ₹499 = 49900 paise
- **Validation**: Minimum ₹1 (100 paise), Maximum ₹1,00,000 (10,000,000 paise)

## 🔒 Security Features

1. **Webhook Signature Verification**: All webhooks are verified using Stripe's signature
2. **Raw Body Parser**: Webhook endpoint uses raw body parsing for signature verification
3. **Input Validation**: All inputs are validated before processing
4. **Error Handling**: Comprehensive error handling with logging

## 📝 Usage Examples

### Frontend Integration

```javascript
// Create checkout session
const response = await fetch('/api/v1/stripe/create-checkout-session', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    amount: 49900, // ₹499
    customerEmail: 'user@example.com',
    metadata: {
      courseId: 'course_123',
      userId: 'user_456'
    }
  })
});

const data = await response.json();
if (data.success) {
  // Redirect to Stripe Checkout
  window.location.href = data.data.sessionUrl;
}
```

### Webhook Processing

The webhook automatically handles:
- Payment success logging
- Database updates (implement in `PaymentService.updatePaymentInDatabase`)
- Email notifications (add your email service)
- Course access granting (add your business logic)

## 🐛 Troubleshooting

### Common Issues:

1. **Webhook Signature Verification Failed**
   - Check if `STRIPE_WEBHOOK_SECRET` is correct
   - Ensure webhook endpoint URL matches exactly
   - Verify raw body parser is configured

2. **Payment Methods Not Available**
   - Ensure Stripe account supports UPI
   - Check if account is properly activated for India

3. **Amount Validation Errors**
   - Ensure amount is in paise (₹499 = 49900)
   - Check amount is within valid range (₹1 - ₹1,00,000)

## 📚 Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe India Integration](https://stripe.com/docs/payments/payment-methods/overview#india)
- [Webhook Security](https://stripe.com/docs/webhooks/signatures)

## 🔄 Next Steps

1. Implement database models for payment tracking
2. Add email notifications for payment success/failure
3. Implement refund functionality
4. Add payment analytics and reporting
5. Set up production webhook endpoints
