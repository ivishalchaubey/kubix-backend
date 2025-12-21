# Payment API Testing Guide

This guide provides comprehensive APIs to check payment status, verify successful payments, and confirm that the owner has received the payment.

## 🚀 Complete Payment Flow APIs

### 1. Create Payment Session
```bash
POST /api/v1/stripe/create-checkout-session
```

**Request:**
```json
{
  "amount": 49900,
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
    "sessionId": "cs_test_1234567890",
    "sessionUrl": "https://checkout.stripe.com/pay/cs_test_1234567890",
    "amount": 49900,
    "currency": "inr"
  }
}
```

---

## 🔍 Payment Verification APIs

### 2. Verify Payment Success
```bash
GET /api/v1/stripe/payment/{sessionId}/verify
```

**Example:**
```bash
curl -X GET "http://localhost:5000/api/v1/stripe/payment/cs_test_1234567890/verify"
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "data": {
    "sessionId": "cs_test_1234567890",
    "isSuccessful": true,
    "paymentStatus": "paid",
    "amount": 49900,
    "currency": "inr",
    "customerEmail": "customer@example.com",
    "paidAt": "2024-01-15T10:30:00.000Z",
    "verificationTimestamp": "2024-01-15T10:35:00.000Z"
  }
}
```

**Response (Failed):**
```json
{
  "success": true,
  "message": "Payment not successful",
  "data": {
    "sessionId": "cs_test_1234567890",
    "isSuccessful": false,
    "paymentStatus": "unpaid",
    "amount": 49900,
    "currency": "inr",
    "customerEmail": "customer@example.com",
    "paidAt": null,
    "verificationTimestamp": "2024-01-15T10:35:00.000Z"
  }
}
```

### 3. Get Detailed Payment Information
```bash
GET /api/v1/stripe/payment/{sessionId}/details
```

**Example:**
```bash
curl -X GET "http://localhost:5000/api/v1/stripe/payment/cs_test_1234567890/details"
```

**Response:**
```json
{
  "success": true,
  "message": "Payment details retrieved successfully",
  "data": {
    "session": {
      "id": "cs_test_1234567890",
      "status": "paid",
      "amount": 49900,
      "currency": "inr",
      "customerEmail": "customer@example.com",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "metadata": {
        "courseId": "course_123",
        "userId": "user_456"
      }
    },
    "paymentIntent": {
      "id": "pi_1234567890",
      "status": "succeeded",
      "amount": 49900,
      "currency": "inr",
      "paymentMethod": "pm_1234567890",
      "charges": [
        {
          "id": "ch_1234567890",
          "status": "succeeded",
          "amount": 49900,
          "paid": true,
          "receiptUrl": "https://pay.stripe.com/receipts/..."
        }
      ]
    },
    "customer": {
      "id": "cus_1234567890",
      "email": "customer@example.com",
      "name": "John Doe"
    }
  }
}
```

### 4. Get Payment Receipt
```bash
GET /api/v1/stripe/payment/{sessionId}/receipt
```

**Example:**
```bash
curl -X GET "http://localhost:5000/api/v1/stripe/payment/cs_test_1234567890/receipt"
```

**Response:**
```json
{
  "success": true,
  "message": "Payment receipt retrieved successfully",
  "data": {
    "receiptNumber": "ch_1234567890",
    "receiptUrl": "https://pay.stripe.com/receipts/...",
    "amount": 49900,
    "currency": "INR",
    "paidAt": "2024-01-15T10:30:00.000Z",
    "paymentMethod": "card",
    "customerEmail": "customer@example.com",
    "description": "Course Payment"
  }
}
```

---

## 👥 Customer Payment History

### 5. Get Customer Payment History
```bash
GET /api/v1/stripe/payments/customer/{email}?limit=10&starting_after=pi_123
```

**Example:**
```bash
curl -X GET "http://localhost:5000/api/v1/stripe/payments/customer/customer@example.com?limit=5"
```

**Response:**
```json
{
  "success": true,
  "message": "Customer payments retrieved successfully",
  "data": {
    "customer": {
      "id": "cus_1234567890",
      "email": "customer@example.com",
      "name": "John Doe"
    },
    "payments": [
      {
        "id": "pi_1234567890",
        "amount": 49900,
        "currency": "inr",
        "status": "succeeded",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "customerEmail": "customer@example.com",
        "metadata": {
          "courseId": "course_123"
        }
      }
    ],
    "hasMore": false
  }
}
```

---

## 📊 Owner/Admin Analytics

### 6. Get Payment Analytics
```bash
GET /api/v1/stripe/analytics/payments?start_date=2024-01-01&end_date=2024-01-31&limit=100
```

**Example:**
```bash
curl -X GET "http://localhost:5000/api/v1/stripe/analytics/payments?start_date=2024-01-01&end_date=2024-01-31"
```

**Response:**
```json
{
  "success": true,
  "message": "Payment analytics retrieved successfully",
  "data": {
    "totalPayments": 25,
    "successfulPayments": 23,
    "failedPayments": 2,
    "totalAmount": 1247500,
    "successfulAmount": 1177500,
    "currency": "inr",
    "payments": [
      {
        "id": "pi_1234567890",
        "amount": 49900,
        "currency": "inr",
        "status": "succeeded",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "customerEmail": "customer@example.com",
        "metadata": {
          "courseId": "course_123"
        }
      }
    ]
  }
}
```

---

## 🔧 Testing Script

Create a test file `test-payment-apis.js`:

```javascript
const BASE_URL = 'http://localhost:5000/api/v1/stripe';

// Test payment creation
async function testPaymentFlow() {
  try {
    // 1. Create payment session
    console.log('🧪 Creating payment session...');
    const createResponse = await fetch(`${BASE_URL}/create-checkout-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: 49900,
        customerEmail: 'test@example.com',
        metadata: { courseId: 'test_course' }
      })
    });
    
    const createData = await createResponse.json();
    console.log('✅ Payment session created:', createData.data.sessionId);
    
    const sessionId = createData.data.sessionId;
    
    // 2. Verify payment (simulate after payment completion)
    console.log('🧪 Verifying payment...');
    const verifyResponse = await fetch(`${BASE_URL}/payment/${sessionId}/verify`);
    const verifyData = await verifyResponse.json();
    console.log('✅ Payment verification:', verifyData.data.isSuccessful);
    
    // 3. Get payment details
    console.log('🧪 Getting payment details...');
    const detailsResponse = await fetch(`${BASE_URL}/payment/${sessionId}/details`);
    const detailsData = await detailsResponse.json();
    console.log('✅ Payment details:', detailsData.data.session.status);
    
    // 4. Get analytics
    console.log('🧪 Getting payment analytics...');
    const analyticsResponse = await fetch(`${BASE_URL}/analytics/payments`);
    const analyticsData = await analyticsResponse.json();
    console.log('✅ Analytics:', analyticsData.data.totalPayments, 'total payments');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testPaymentFlow();
```

---

## 🎯 How to Confirm Payment Success

### For Customers:
1. **After Payment**: Use `/verify` endpoint to check if payment was successful
2. **Get Receipt**: Use `/receipt` endpoint to get official receipt
3. **Check Details**: Use `/details` endpoint for complete payment information

### For Owner/Admin:
1. **Real-time Monitoring**: Use webhook endpoint to get instant notifications
2. **Analytics Dashboard**: Use `/analytics/payments` to see all payments
3. **Customer History**: Use `/payments/customer/{email}` to check specific customers
4. **Stripe Dashboard**: Check your Stripe dashboard for detailed financial reports

### Webhook Events to Monitor:
- `checkout.session.completed` - Payment successful
- `payment_intent.succeeded` - Money received
- `payment_intent.payment_failed` - Payment failed

---

## 🚨 Important Notes

1. **Webhook Security**: Always verify webhook signatures
2. **Idempotency**: Handle duplicate webhook events
3. **Error Handling**: Implement proper error handling for all API calls
4. **Rate Limiting**: Respect Stripe's API rate limits
5. **Testing**: Use Stripe test mode for development

---

## 📱 Frontend Integration Example

```javascript
// Check payment status after redirect
async function checkPaymentStatus(sessionId) {
  try {
    const response = await fetch(`/api/v1/stripe/payment/${sessionId}/verify`);
    const data = await response.json();
    
    if (data.data.isSuccessful) {
      // Payment successful - show success message
      showSuccessMessage('Payment completed successfully!');
      // Redirect to course access page
      window.location.href = '/course-access';
    } else {
      // Payment failed - show error message
      showErrorMessage('Payment was not successful. Please try again.');
    }
  } catch (error) {
    console.error('Error checking payment status:', error);
    showErrorMessage('Unable to verify payment status.');
  }
}
```

This comprehensive API suite gives you complete visibility into payment status, customer history, and financial analytics! 🎉
