/**
 * Test script for Stripe Payment Integration
 * Run this script to test the Stripe endpoints
 */

const BASE_URL = 'http://localhost:5000/api/v1/stripe';

// Test data
const testPaymentData = {
  amount: 49900, // ₹499
  customerEmail: 'test@example.com',
  metadata: {
    courseId: 'course_123',
    userId: 'user_456',
    testMode: 'true'
  }
};

/**
 * Test create checkout session endpoint
 */
async function testCreateCheckoutSession() {
  try {
    console.log('🧪 Testing Create Checkout Session...');
    
    const response = await fetch(`${BASE_URL}/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPaymentData)
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Create Checkout Session Test Passed');
      console.log('📄 Response:', JSON.stringify(data, null, 2));
      return data.data.sessionId;
    } else {
      console.log('❌ Create Checkout Session Test Failed');
      console.log('📄 Error:', data.message);
      return null;
    }
  } catch (error) {
    console.log('❌ Create Checkout Session Test Error:', error.message);
    return null;
  }
}

/**
 * Test get session status endpoint
 */
async function testGetSessionStatus(sessionId) {
  if (!sessionId) {
    console.log('⏭️ Skipping session status test (no session ID)');
    return;
  }

  try {
    console.log('🧪 Testing Get Session Status...');
    
    const response = await fetch(`${BASE_URL}/session/${sessionId}`);
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Get Session Status Test Passed');
      console.log('📄 Response:', JSON.stringify(data, null, 2));
    } else {
      console.log('❌ Get Session Status Test Failed');
      console.log('📄 Error:', data.message);
    }
  } catch (error) {
    console.log('❌ Get Session Status Test Error:', error.message);
  }
}

/**
 * Test get config endpoint
 */
async function testGetConfig() {
  try {
    console.log('🧪 Testing Get Config...');
    
    const response = await fetch(`${BASE_URL}/config`);
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Get Config Test Passed');
      console.log('📄 Response:', JSON.stringify(data, null, 2));
    } else {
      console.log('❌ Get Config Test Failed');
      console.log('📄 Error:', data.message);
    }
  } catch (error) {
    console.log('❌ Get Config Test Error:', error.message);
  }
}

/**
 * Test invalid amount validation
 */
async function testInvalidAmount() {
  try {
    console.log('🧪 Testing Invalid Amount Validation...');
    
    const invalidData = {
      amount: 50, // Too small (less than ₹1)
      customerEmail: 'test@example.com'
    };

    const response = await fetch(`${BASE_URL}/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidData)
    });

    const data = await response.json();
    
    if (!data.success && data.message.includes('Invalid amount')) {
      console.log('✅ Invalid Amount Validation Test Passed');
      console.log('📄 Error Message:', data.message);
    } else {
      console.log('❌ Invalid Amount Validation Test Failed');
      console.log('📄 Response:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.log('❌ Invalid Amount Validation Test Error:', error.message);
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('🚀 Starting Stripe Integration Tests...\n');
  
  // Test 1: Get config
  await testGetConfig();
  console.log('');
  
  // Test 2: Create checkout session
  const sessionId = await testCreateCheckoutSession();
  console.log('');
  
  // Test 3: Get session status
  await testGetSessionStatus(sessionId);
  console.log('');
  
  // Test 4: Invalid amount validation
  await testInvalidAmount();
  console.log('');
  
  console.log('🏁 All tests completed!');
  console.log('\n📝 Next Steps:');
  console.log('1. Set up your Stripe API keys in .env file');
  console.log('2. Start your server: npm run dev');
  console.log('3. Run this test: node test-stripe-integration.js');
  console.log('4. Configure webhook endpoint in Stripe Dashboard');
}

// Run tests if this script is executed directly
if (typeof window === 'undefined') {
  runTests().catch(console.error);
}

module.exports = {
  testCreateCheckoutSession,
  testGetSessionStatus,
  testGetConfig,
  testInvalidAmount,
  runTests
};
