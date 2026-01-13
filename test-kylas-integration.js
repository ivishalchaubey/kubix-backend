/**
 * Kylas CRM Integration Test Script
 *
 * This script tests the Kylas CRM integration to ensure:
 * 1. Kylas API connection is working
 * 2. Lead creation works
 * 3. Lead search works
 * 4. Activity tracking works
 *
 * Run with: node test-kylas-integration.js
 */

import axios from "axios";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const KYLAS_API_KEY = process.env.KYLAS_API_KEY;
const KYLAS_BASE_URL = process.env.KYLAS_BASE_URL || "https://api.kylas.io/v1";

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Test data
const testEmail = `test-${Date.now()}@example.com`;
const testLead = {
  firstName: "Test Vishal",
  lastName: "Student",
  emails: [
    {
      type: "PERSONAL",
      value: testEmail,
      primary: true,
    },
  ],
  phoneNumbers: [
    {
      type: "MOBILE",
      code: "IN",
      value: "9876543210",
      dialCode: "+91",
      primary: true,
    },
  ],
  city: "Mumbai",
  state: "Maharashtra",
  country: "IN",
  requirementName: "Student Counselling Test",
};

// Create axios client
const kylasClient = axios.create({
  baseURL: KYLAS_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    "api-key": KYLAS_API_KEY,
  },
});

// Test functions
async function testConnection() {
  log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", "cyan");
  log("TEST 1: Testing Kylas API Connection", "cyan");
  log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n", "cyan");

  try {
    // Use a simple GET endpoint to test connectivity
    const response = await kylasClient.get("/users/me");

    log("✓ Successfully connected to Kylas API", "green");
    log(`  User: ${response.data.firstName} ${response.data.lastName}`, "blue");
    log(`  Base URL: ${KYLAS_BASE_URL}`, "blue");
    log(`  API Key: ${KYLAS_API_KEY.substring(0, 10)}...`, "blue");
    return true;
  } catch (error) {
    log("✗ Failed to connect to Kylas API", "red");
    if (error.response) {
      log(`  Status: ${error.response.status}`, "red");
      log(`  Error: ${JSON.stringify(error.response.data)}`, "red");
    } else {
      log(`  Error: ${error.message}`, "red");
    }
    return false;
  }
}

async function testLeadCreation() {
  log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", "cyan");
  log("TEST 2: Testing Lead Creation", "cyan");
  log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n", "cyan");

  try {
    log(`Creating test lead for: ${testEmail}`, "blue");
    const response = await kylasClient.post("/leads/", testLead);

    log("✓ Successfully created lead in Kylas", "green");
    log(`  Lead ID: ${response.data.id}`, "blue");
    log(`  Name: ${response.data.firstName} ${response.data.lastName}`, "blue");
    log(`  Email: ${response.data.emails[0].value}`, "blue");

    return response.data;
  } catch (error) {
    log("✗ Failed to create lead", "red");
    if (error.response) {
      log(`  Status: ${error.response.status}`, "red");
      log(`  Error: ${JSON.stringify(error.response.data, null, 2)}`, "red");
    } else {
      log(`  Error: ${error.message}`, "red");
    }
    return null;
  }
}

async function testLeadSearch(email) {
  log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", "cyan");
  log("TEST 3: Testing Lead Search", "cyan");
  log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n", "cyan");

  const maxAttempts = 5;
  const delayMs = 10000; // 10 seconds between retries

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      log(
        `Searching for lead with email: ${email} (Attempt ${attempt}/${maxAttempts})`,
        "blue"
      );
      if (attempt === 1) {
        log("Waiting for initial search indexing...", "yellow");
        await new Promise((resolve) => setTimeout(resolve, 5000));
      } else {
        log(`Waiting ${delayMs / 1000}s before retry...`, "yellow");
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }

      const response = await kylasClient.post("/search/lead", {
        fields: ["id", "firstName", "lastName", "emails"],
        jsonRule: {
          rules: [
            {
              id: "multi_field",
              field: "multi_field",
              type: "multi_field",
              input: "multi_field",
              operator: "multi_field",
              value: email,
            },
          ],
          condition: "AND",
          valid: true,
        },
        limit: 1,
      });

      if (response.data.totalCount > 0) {
        log("✓ Successfully found lead", "green");
        log(`  Total Count: ${response.data.totalCount}`, "blue");
        log(`  Lead ID: ${response.data.records[0].id}`, "blue");
        log(
          `  Name: ${response.data.records[0].firstName} ${response.data.records[0].lastName}`,
          "blue"
        );
        return response.data.records[0];
      } else {
        log("⚠ Lead not found in this attempt", "yellow");
      }
    } catch (error) {
      log(`✗ Failed attempt ${attempt}`, "red");
      if (error.response) {
        log(`  Status: ${error.response.status}`, "red");
        log(`  Error: ${JSON.stringify(error.response.data)}`, "red");
      } else {
        log(`  Error: ${error.message}`, "red");
      }
    }
  }

  log("✗ Lead search failed after all attempts", "red");
  return null;
}

async function testLeadUpdate(leadId) {
  log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", "cyan");
  log("TEST 4: Testing Lead Update (Activity Tracking)", "cyan");
  log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n", "cyan");

  try {
    log(`Updating lead ID: ${leadId}`, "blue");

    // Use JSON Patch format as required by Kylas for partial updates
    const patchData = [
      {
        op: "replace",
        path: "/lastName",
        value: "Updated",
      },
    ];

    // Use PATCH with the special content-type
    const response = await kylasClient.patch(`/leads/${leadId}`, patchData, {
      headers: {
        "Content-Type": "application/json-patch+json",
      },
    });

    log("✓ Successfully patched lead", "green");
    log(`  Lead ID: ${leadId}`, "blue");
    return true;
  } catch (error) {
    log("✗ Failed to update lead", "red");
    if (error.response) {
      log(`  Status: ${error.response.status}`, "red");
      log(`  Error: ${JSON.stringify(error.response.data, null, 2)}`, "red");
    } else {
      log(`  Error: ${error.message}`, "red");
    }
    return false;
  }
}

async function testAddNote(leadId) {
  log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", "cyan");
  log("TEST 5: Testing Add Note to Lead", "cyan");
  log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n", "cyan");

  try {
    log(`Adding note to lead ID: ${leadId}`, "blue");

    // Correct documented payload for /v1/notes/relation
    const noteData = {
      targetEntityId: leadId,
      targetEntityType: "LEAD",
      sourceEntity: {
        description: `Test note added by integration test at ${new Date().toISOString()}`,
      },
    };

    await kylasClient.post(`/notes/relation`, noteData);

    log("✓ Successfully added note to lead", "green");
    return true;
  } catch (error) {
    log("✗ Failed to add note to lead", "red");
    if (error.response) {
      log(`  Status: ${error.response.status}`, "red");
      log(`  Error: ${JSON.stringify(error.response.data, null, 2)}`, "red");
    } else {
      log(`  Error: ${error.message}`, "red");
    }
    return false;
  }
}

// Main test runner
async function runTests() {
  log("\n╔═══════════════════════════════════════════╗", "cyan");
  log("║   KYLAS CRM INTEGRATION TEST SUITE      ║", "cyan");
  log("╚═══════════════════════════════════════════╝", "cyan");

  // Check if API key is configured
  if (!KYLAS_API_KEY || KYLAS_API_KEY === "your_kylas_api_key_here") {
    log("\n✗ ERROR: KYLAS_API_KEY is not configured in .env file", "red");
    log("  Please add your Kylas API key to .env file:", "yellow");
    log("  KYLAS_API_KEY=your_actual_api_key_here\n", "yellow");
    process.exit(1);
  }

  const results = {
    connection: false,
    creation: false,
    search: false,
    update: false,
    note: false,
  };

  // Test 1: Connection
  results.connection = await testConnection();
  if (!results.connection) {
    log("\n⚠ Stopping tests - API connection failed", "red");
    printSummary(results);
    process.exit(1);
  }

  // Test 2: Lead Creation
  const createdLead = await testLeadCreation();
  results.creation = !!createdLead;

  if (!createdLead) {
    log("\n⚠ Stopping tests - Lead creation failed", "red");
    printSummary(results);
    process.exit(1);
  }

  // Test 3: Lead Search
  const foundLead = await testLeadSearch(testEmail);
  results.search = !!foundLead;

  // Test 4: Lead Update (only if creation succeeded)
  if (createdLead) {
    const updatedLead = await testLeadUpdate(createdLead.id);
    results.update = !!updatedLead;
  }

  // Test 5: Add Note
  if (createdLead) {
    results.note = await testAddNote(createdLead.id);
  }

  // Print summary
  printSummary(results);

  // Cleanup message
  log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", "cyan");
  log("CLEANUP", "cyan");
  log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n", "cyan");
  log("⚠ Test lead was created in your Kylas CRM:", "yellow");
  log(`  Email: ${testEmail}`, "yellow");
  if (createdLead) {
    log(`  Lead ID: ${createdLead.id}`, "yellow");
  }
  log("  You may want to delete it from Kylas dashboard\n", "yellow");
}

function printSummary(results) {
  log("\n╔═══════════════════════════════════════════╗", "cyan");
  log("║          TEST RESULTS SUMMARY            ║", "cyan");
  log("╚═══════════════════════════════════════════╝\n", "cyan");

  const total = Object.keys(results).length;
  const passed = Object.values(results).filter((r) => r).length;

  log(
    `${results.connection ? "✓" : "✗"} Connection Test:     ${
      results.connection ? "PASSED" : "FAILED"
    }`,
    results.connection ? "green" : "red"
  );
  log(
    `${results.creation ? "✓" : "✗"} Lead Creation Test:  ${
      results.creation ? "PASSED" : "FAILED"
    }`,
    results.creation ? "green" : "red"
  );
  log(
    `${results.search ? "✓" : "✗"} Lead Search Test:    ${
      results.search ? "PASSED" : "FAILED"
    }`,
    results.search ? "green" : "red"
  );
  log(
    `${results.update ? "✓" : "✗"} Lead Update Test:    ${
      results.update ? "PASSED" : "FAILED"
    }`,
    results.update ? "green" : "red"
  );
  log(
    `${results.note ? "✓" : "✗"} Add Note Test:       ${
      results.note ? "PASSED" : "FAILED"
    }`,
    results.note ? "green" : "red"
  );

  log(
    `\nTotal: ${passed}/${total} tests passed`,
    passed === total ? "green" : "yellow"
  );

  if (passed === total) {
    log(
      "\n🎉 All tests passed! Kylas CRM integration is working correctly.\n",
      "green"
    );
  } else {
    log("\n⚠ Some tests failed. Please check the errors above.\n", "yellow");
  }
}

// Run the tests
runTests().catch((error) => {
  log("\n✗ Test suite encountered an unexpected error:", "red");
  log(error.message, "red");
  if (error.stack) {
    log(error.stack, "red");
  }
  process.exit(1);
});
