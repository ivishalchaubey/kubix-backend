/**
 * Simple test to verify Razorpay integration is working
 */

console.log("Testing Razorpay integration...");

// Test the config endpoint
fetch("http://localhost:5000/api/v1/razorpay/config")
  .then((response) => response.json())
  .then((data) => {
    console.log("✅ Razorpay config endpoint working:");
    console.log(JSON.stringify(data, null, 2));
  })
  .catch((error) => {
    console.error("❌ Error testing Razorpay config:", error.message);
  });

// Test basic order creation (this will fail without proper credentials, but should show the endpoint is accessible)
fetch("http://localhost:5000/api/v1/razorpay/create-order", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    amount: 100000,
    customerEmail: "test@example.com",
  }),
})
  .then((response) => response.json())
  .then((data) => {
    console.log("\n📦 Razorpay order creation endpoint response:");
    console.log(JSON.stringify(data, null, 2));
  })
  .catch((error) => {
    console.error("❌ Error testing order creation:", error.message);
  });
