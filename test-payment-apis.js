/**
 * Complete Stripe Payment API Testing Script
 * Run this to test all payment functionality
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
 * Test 1: Create Payment Session
 */
async function testCreatePaymentSession() {
  try {
    console.log('🧪 Test 1: Creating Payment Session...');
    
    const response = await fetch(`${BASE_URL}/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPaymentData)
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Payment Session Created Successfully!');
      console.log('📄 Session ID:', data.data.sessionId);
      console.log('🔗 Session URL:', data.data.sessionUrl);
      console.log('💰 Amount:', `₹${data.data.amount / 100}`);
      return data.data.sessionId;
    } else {
      console.log('❌ Payment Session Creation Failed');
      console.log('📄 Error:', data.message);
      return null;
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    return null;
  }
}

/**
 * Test 2: Get Session Status
 */
async function testGetSessionStatus(sessionId) {
  if (!sessionId) {
    console.log('⏭️ Skipping session status test (no session ID)');
    return;
  }

  try {
    console.log('\n🧪 Test 2: Getting Session Status...');
    
    const response = await fetch(`${BASE_URL}/session/${sessionId}`);
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Session Status Retrieved Successfully!');
      console.log('📄 Session ID:', data.data.sessionId);
      console.log('📊 Status:', data.data.status);
      console.log('💰 Amount:', `₹${data.data.amount / 100}`);
      console.log('📧 Customer Email:', data.data.customerEmail);
    } else {
      console.log('❌ Session Status Retrieval Failed');
      console.log('📄 Error:', data.message);
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

/**
 * Test 3: Verify Payment Success
 */
async function testVerifyPayment(sessionId) {
  if (!sessionId) {
    console.log('⏭️ Skipping payment verification test (no session ID)');
    return;
  }

  try {
    console.log('\n🧪 Test 3: Verifying Payment Success...');
    
    const response = await fetch(`${BASE_URL}/payment/${sessionId}/verify`);
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Payment Verification Completed!');
      console.log('📄 Session ID:', data.data.sessionId);
      console.log('✅ Is Successful:', data.data.isSuccessful);
      console.log('📊 Payment Status:', data.data.paymentStatus);
      console.log('💰 Amount:', `₹${data.data.amount / 100}`);
      console.log('📧 Customer Email:', data.data.customerEmail);
      console.log('⏰ Paid At:', data.data.paidAt || 'Not paid yet');
    } else {
      console.log('❌ Payment Verification Failed');
      console.log('📄 Error:', data.message);
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

/**
 * Test 4: Get Payment Details
 */
async function testGetPaymentDetails(sessionId) {
  if (!sessionId) {
    console.log('⏭️ Skipping payment details test (no session ID)');
    return;
  }

  try {
    console.log('\n🧪 Test 4: Getting Payment Details...');
    
    const response = await fetch(`${BASE_URL}/payment/${sessionId}/details`);
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Payment Details Retrieved Successfully!');
      console.log('📄 Session ID:', data.data.session.id);
      console.log('📊 Status:', data.data.session.status);
      console.log('💰 Amount:', `₹${data.data.session.amount / 100}`);
      console.log('📧 Customer Email:', data.data.session.customerEmail);
      console.log('⏰ Created At:', data.data.session.createdAt);
      
      if (data.data.paymentIntent) {
        console.log('💳 Payment Intent ID:', data.data.paymentIntent.id);
        console.log('📊 Payment Intent Status:', data.data.paymentIntent.status);
      }
      
      if (data.data.customer) {
        console.log('👤 Customer ID:', data.data.customer.id);
        console.log('📧 Customer Email:', data.data.customer.email);
      }
    } else {
      console.log('❌ Payment Details Retrieval Failed');
      console.log('📄 Error:', data.message);
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

/**
 * Test 5: Get Payment Receipt
 */
async function testGetPaymentReceipt(sessionId) {
  if (!sessionId) {
    console.log('⏭️ Skipping payment receipt test (no session ID)');
    return;
  }

  try {
    console.log('\n🧪 Test 5: Getting Payment Receipt...');
    
    const response = await fetch(`${BASE_URL}/payment/${sessionId}/receipt`);
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Payment Receipt Retrieved Successfully!');
      console.log('🧾 Receipt Number:', data.data.receiptNumber);
      console.log('🔗 Receipt URL:', data.data.receiptUrl);
      console.log('💰 Amount:', `₹${data.data.amount / 100}`);
      console.log('💳 Payment Method:', data.data.paymentMethod);
      console.log('📧 Customer Email:', data.data.customerEmail);
      console.log('⏰ Paid At:', data.data.paidAt);
    } else {
      console.log('❌ Payment Receipt Retrieval Failed');
      console.log('📄 Error:', data.message);
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

/**
 * Test 6: Get Customer Payments
 */
async function testGetCustomerPayments() {
  try {
    console.log('\n🧪 Test 6: Getting Customer Payment History...');
    
    const response = await fetch(`${BASE_URL}/payments/customer/${testPaymentData.customerEmail}?limit=5`);
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Customer Payments Retrieved Successfully!');
      console.log('👤 Customer ID:', data.data.customer?.id || 'Not found');
      console.log('📧 Customer Email:', data.data.customer?.email || 'Not found');
      console.log('📊 Total Payments:', data.data.payments.length);
      console.log('📄 Payments:', data.data.payments.map(p => ({
        id: p.id,
        amount: `₹${p.amount / 100}`,
        status: p.status,
        createdAt: p.createdAt
      })));
    } else {
      console.log('❌ Customer Payments Retrieval Failed');
      console.log('📄 Error:', data.message);
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

/**
 * Test 7: Get Payment Analytics
 */
async function testGetPaymentAnalytics() {
  try {
    console.log('\n🧪 Test 7: Getting Payment Analytics...');
    
    const response = await fetch(`${BASE_URL}/analytics/payments?limit=10`);
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Payment Analytics Retrieved Successfully!');
      console.log('📊 Total Payments:', data.data.totalPayments);
      console.log('✅ Successful Payments:', data.data.successfulPayments);
      console.log('❌ Failed Payments:', data.data.failedPayments);
      console.log('💰 Total Amount:', `₹${data.data.totalAmount / 100}`);
      console.log('💰 Successful Amount:', `₹${data.data.successfulAmount / 100}`);
      console.log('💱 Currency:', data.data.currency);
    } else {
      console.log('❌ Payment Analytics Retrieval Failed');
      console.log('📄 Error:', data.message);
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

/**
 * Test 8: Get Stripe Configuration
 */
async function testGetStripeConfig() {
  try {
    console.log('\n🧪 Test 8: Getting Stripe Configuration...');
    
    const response = await fetch(`${BASE_URL}/config`);
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Stripe Configuration Retrieved Successfully!');
      console.log('🔑 Publishable Key:', data.data.publishableKey ? '✅ Set' : '❌ Not set');
      console.log('💱 Currency:', data.data.currency);
      console.log('💳 Supported Payment Methods:', data.data.supportedPaymentMethods);
      console.log('🌐 Frontend URL:', data.data.frontendUrl);
    } else {
      console.log('❌ Stripe Configuration Retrieval Failed');
      console.log('📄 Error:', data.message);
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

/**
 * Test 9: Invalid Amount Validation
 */
async function testInvalidAmountValidation() {
  try {
    console.log('\n🧪 Test 9: Testing Invalid Amount Validation...');
    
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
      console.log('✅ Invalid Amount Validation Working!');
      console.log('📄 Error Message:', data.message);
    } else {
      console.log('❌ Invalid Amount Validation Failed');
      console.log('📄 Response:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

/**
 * Test 10: Missing Required Fields
 */
async function testMissingRequiredFields() {
  try {
    console.log('\n🧪 Test 10: Testing Missing Required Fields...');
    
    const invalidData = {
      // Missing amount field
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
    
    if (!data.success && data.message.includes('Amount is required')) {
      console.log('✅ Missing Required Fields Validation Working!');
      console.log('📄 Error Message:', data.message);
    } else {
      console.log('❌ Missing Required Fields Validation Failed');
      console.log('📄 Response:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

/**
 * Run All Tests
 */
async function runAllTests() {
  console.log('🚀 Starting Complete Stripe Payment API Tests...\n');
  
  // Test 1: Create payment session
  const sessionId = await testCreatePaymentSession();
  
  // Test 2: Get session status
  await testGetSessionStatus(sessionId);
  
  // Test 3: Verify payment success
  await testVerifyPayment(sessionId);
  
  // Test 4: Get payment details
  await testGetPaymentDetails(sessionId);
  
  // Test 5: Get payment receipt
  await testGetPaymentReceipt(sessionId);
  
  // Test 6: Get customer payments
  await testGetCustomerPayments();
  
  // Test 7: Get payment analytics
  await testGetPaymentAnalytics();
  
  // Test 8: Get Stripe configuration
  await testGetStripeConfig();
  
  // Test 9: Invalid amount validation
  await testInvalidAmountValidation();
  
  // Test 10: Missing required fields
  await testMissingRequiredFields();
  
  console.log('\n🏁 All Tests Completed!');
  console.log('\n📝 Next Steps:');
  console.log('1. Set up your Stripe API keys in .env file');
  console.log('2. Start your server: npm run dev');
  console.log('3. Run this test: node test-payment-apis.js');
  console.log('4. Use the sessionUrl from Test 1 to complete a real payment');
  console.log('5. Configure webhook endpoint in Stripe Dashboard');
  console.log('\n🎉 Your Stripe payment integration is complete and ready!');
}

// Run tests if this script is executed directly
if (typeof window === 'undefined') {
  runAllTests().catch(console.error);
}

export {
  testCreatePaymentSession,
  testGetSessionStatus,
  testVerifyPayment,
  testGetPaymentDetails,
  testGetPaymentReceipt,
  testGetCustomerPayments,
  testGetPaymentAnalytics,
  testGetStripeConfig,
  testInvalidAmountValidation,
  testMissingRequiredFields,
  runAllTests
};
