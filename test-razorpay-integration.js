/**
 * Razorpay Integration Test Script
 *
 * This script tests the Razorpay payment integration endpoints.
 * Make sure to set up your environment variables before running.
 *
 * Usage: node test-razorpay-integration.js
 */

const API_BASE_URL = "http://localhost:5000/api/v1/razorpay";

// Test data
const testPayment = {
  amount: 100000, // ₹1000 in paise
  currency: "INR",
  customerEmail: "test@example.com",
  metadata: {
    description: "Test token purchase",
    userId: "507f1f77bcf86cd799439011",
  },
};

/**
 * Test 1: Get Razorpay Configuration
 */
async function testGetConfig() {
  console.log("\n🔧 Testing Razorpay Configuration...");

  try {
    const response = await fetch(`${API_BASE_URL}/config`);
    const data = await response.json();

    if (response.ok) {
      console.log("✅ Config retrieved successfully");
      console.log("📄 Config data:", JSON.stringify(data.data, null, 2));
      return data.data;
    } else {
      console.log("❌ Failed to get config:", data.message);
      return null;
    }
  } catch (error) {
    console.error("💥 Error fetching config:", error.message);
    return null;
  }
}

/**
 * Test 2: Create Order
 */
async function testCreateOrder() {
  console.log("\n📦 Testing Order Creation...");

  try {
    const response = await fetch(`${API_BASE_URL}/create-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testPayment),
    });

    const data = await response.json();

    if (response.ok) {
      console.log("✅ Order created successfully");
      console.log("📦 Order ID:", data.data.orderId);
      console.log("💰 Amount:", data.data.amount, data.data.currency);
      console.log("🔑 Key ID:", data.data.keyId);
      return data.data;
    } else {
      console.log("❌ Failed to create order:", data.message);
      return null;
    }
  } catch (error) {
    console.error("💥 Error creating order:", error.message);
    return null;
  }
}

/**
 * Test 3: Get Order Status
 */
async function testGetOrderStatus(orderId) {
  if (!orderId) {
    console.log("\n⏭️  Skipping order status test (no order ID)");
    return;
  }

  console.log("\n📊 Testing Order Status...");

  try {
    const response = await fetch(`${API_BASE_URL}/order/${orderId}`);
    const data = await response.json();

    if (response.ok) {
      console.log("✅ Order status retrieved successfully");
      console.log("📊 Order Status:", data.data.order.status);
      console.log("💳 Payment attempts:", data.data.order.attempts);
      console.log("💰 Amount paid:", data.data.order.amount_paid);
      console.log("🔄 Amount due:", data.data.order.amount_due);
    } else {
      console.log("❌ Failed to get order status:", data.message);
    }
  } catch (error) {
    console.error("💥 Error fetching order status:", error.message);
  }
}

/**
 * Test 4: Test Payment Verification (Mock)
 */
async function testPaymentVerification(orderId) {
  if (!orderId) {
    console.log("\n⏭️  Skipping payment verification test (no order ID)");
    return;
  }

  console.log("\n🔒 Testing Payment Verification (Mock)...");

  // Note: This is a mock test since we need actual Razorpay payment data
  console.log("ℹ️  Payment verification requires actual Razorpay payment data");
  console.log("ℹ️  Use the frontend integration to complete a real payment");
  console.log("ℹ️  Example verification payload:");
  console.log(
    JSON.stringify(
      {
        razorpay_order_id: orderId,
        razorpay_payment_id: "pay_example123",
        razorpay_signature: "signature_example",
      },
      null,
      2
    )
  );
}

/**
 * Test 5: Test Webhook (Info)
 */
function testWebhookInfo() {
  console.log("\n🔗 Webhook Information...");
  console.log("📍 Webhook URL:", `${API_BASE_URL}/webhook`);
  console.log("📋 Configure this URL in your Razorpay Dashboard");
  console.log("⚙️  Webhook events handled:");
  console.log("   - payment.captured");
  console.log("   - payment.failed");
  console.log("   - order.paid");
  console.log("🔐 Make sure to set RAZORPAY_WEBHOOK_SECRET in environment");
}

/**
 * Test 6: Test Error Handling
 */
async function testErrorHandling() {
  console.log("\n❌ Testing Error Handling...");

  // Test invalid amount
  try {
    const response = await fetch(`${API_BASE_URL}/create-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: -100, // Invalid negative amount
        currency: "INR",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.log("✅ Error handling works - Invalid amount rejected");
      console.log("📄 Error message:", data.message);
    } else {
      console.log("⚠️  Error handling issue - Invalid amount accepted");
    }
  } catch (error) {
    console.error("💥 Error in error handling test:", error.message);
  }

  // Test missing amount
  try {
    const response = await fetch(`${API_BASE_URL}/create-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        currency: "INR",
        // Missing amount
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.log("✅ Error handling works - Missing amount rejected");
      console.log("📄 Error message:", data.message);
    } else {
      console.log("⚠️  Error handling issue - Missing amount accepted");
    }
  } catch (error) {
    console.error("💥 Error in error handling test:", error.message);
  }
}

/**
 * Run All Tests
 */
async function runAllTests() {
  console.log("🚀 Starting Razorpay Integration Tests...");
  console.log("🌐 API Base URL:", API_BASE_URL);

  // Test configuration
  const config = await testGetConfig();

  // Test order creation
  const order = await testCreateOrder();

  // Test order status
  await testGetOrderStatus(order?.orderId);

  // Test payment verification (mock)
  await testPaymentVerification(order?.orderId);

  // Show webhook info
  testWebhookInfo();

  // Test error handling
  await testErrorHandling();

  console.log("\n✨ Razorpay Integration Tests Completed!");
  console.log("\n📝 Next Steps:");
  console.log("1. Complete a real payment using the frontend integration");
  console.log("2. Check webhook delivery in Razorpay Dashboard");
  console.log("3. Monitor application logs for payment processing");
  console.log("4. Test with different payment methods (UPI, cards, etc.)");
}

// Run tests if this file is executed directly
if (typeof window === "undefined") {
  runAllTests().catch(console.error);
}

export {
  testGetConfig,
  testCreateOrder,
  testGetOrderStatus,
  testPaymentVerification,
  testWebhookInfo,
  testErrorHandling,
  runAllTests,
};
