# Razorpay Integration Guide

This guide covers the Razorpay payment integration for the Kubix backend API.

## Overview

The Razorpay integration provides a complete payment solution with:

- Order creation
- Payment verification
- Webhook handling
- Payment status tracking
- Receipt generation

## Environment Setup

Add the following environment variables to your `.env` file:

```bash
# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_your_key_id_here
RAZORPAY_KEY_SECRET=your_key_secret_here
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
```

Get these credentials from your [Razorpay Dashboard](https://dashboard.razorpay.com/app/keys).

## API Endpoints

### 1. Create Order

**POST** `/api/v1/razorpay/create-order`

Creates a new Razorpay order for payment processing.

**Request Body:**

```json
{
  "amount": 100000,
  "currency": "INR",
  "customerEmail": "customer@example.com",
  "metadata": {
    "description": "Token purchase"
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "orderId": "order_ABC123",
    "orderKey": "order_ABC123",
    "keyId": "rzp_test_xyz",
    "currency": "INR",
    "amount": 100000,
    "message": "Order created successfully"
  }
}
```

### 2. Verify Payment

**POST** `/api/v1/razorpay/verify-payment`

Verifies payment signature after successful payment on frontend.

**Request Body:**

```json
{
  "razorpay_order_id": "order_ABC123",
  "razorpay_payment_id": "pay_XYZ789",
  "razorpay_signature": "signature_hash"
}
```

### 3. Webhook Endpoint

**POST** `/api/v1/razorpay/webhook`

Handles Razorpay webhook events for payment status updates.

Configure this URL in your Razorpay Dashboard webhook settings.

### 4. Get Order Status

**GET** `/api/v1/razorpay/order/:orderId`

Retrieves the current status of a payment order.

### 5. Get Configuration

**GET** `/api/v1/razorpay/config`

Returns Razorpay configuration for frontend initialization.

**Response:**

```json
{
  "success": true,
  "data": {
    "keyId": "rzp_test_xyz",
    "currency": "INR",
    "supportedPaymentMethods": ["card", "netbanking", "wallet", "upi"],
    "frontendUrl": "http://localhost:3000"
  }
}
```

## Frontend Integration

### 1. Initialize Razorpay

```javascript
// Get config from backend
const config = await fetch("/api/v1/razorpay/config").then((r) => r.json());

// Load Razorpay script
const script = document.createElement("script");
script.src = "https://checkout.razorpay.com/v1/checkout.js";
document.head.appendChild(script);
```

### 2. Create Order and Process Payment

```javascript
// Create order
const orderResponse = await fetch("/api/v1/razorpay/create-order", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    amount: 100000, // Amount in paise
    customerEmail: "customer@example.com",
  }),
});

const order = await orderResponse.json();

// Initialize Razorpay checkout
const options = {
  key: config.data.keyId,
  amount: order.data.amount,
  currency: order.data.currency,
  order_id: order.data.orderId,
  name: "Kubix",
  description: "Token Purchase",
  handler: async function (response) {
    // Verify payment
    const verifyResponse = await fetch("/api/v1/razorpay/verify-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
      }),
    });

    if (verifyResponse.ok) {
      // Payment successful
      console.log("Payment verified successfully");
    }
  },
};

const rzp = new Razorpay(options);
rzp.open();
```

## Webhook Events

The webhook endpoint handles the following Razorpay events:

- `payment.captured` - Payment successfully captured
- `payment.failed` - Payment failed
- `order.paid` - Order fully paid

## Testing

### Test Credentials

Use Razorpay test credentials for development:

- Test Key ID starts with `rzp_test_`
- Use test card numbers from Razorpay documentation

### Test Cards

```
Card Number: 4111 1111 1111 1111
CVV: Any 3 digits
Expiry: Any future date
```

## Security Notes

1. **Webhook Secret**: Always verify webhook signatures using the webhook secret
2. **Payment Verification**: Always verify payment signatures on the backend
3. **Environment Variables**: Keep all credentials in environment variables
4. **HTTPS**: Use HTTPS in production for webhook endpoints

## Error Handling

Common error scenarios and handling:

1. **Invalid Amount**: Validate amount is between ₹1 and ₹1,00,000
2. **Signature Verification**: Always verify Razorpay signatures
3. **Network Issues**: Implement retry logic for API calls
4. **Webhook Failures**: Log and monitor webhook processing

## Support

For issues related to Razorpay integration:

1. Check Razorpay Dashboard logs
2. Review webhook delivery status
3. Validate environment variables
4. Check application logs
