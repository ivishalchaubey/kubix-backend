/**
 * Test Script for Course Upload API
 * 
 * This script tests the new course upload endpoints with fuzzy matching
 * for category and university names.
 * 
 * Usage:
 *   node test-course-upload.js
 */

const BASE_URL = 'http://localhost:5001/api/v1/courses';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

// Test data
const singleCourseData = {
  name: "B.A. Theatre Arts",
  categoryName: "Actor",
  description: "Performs characters in theatre, films, television shows through voice, movement and expressions to entertain audiences.",
  duration: "3 years",
  universityName: "Sri Venkateswara University",
  amount: 10000,
  currency: "INR",
  chapters: 1
};

const bulkCoursesData = [
  {
    name: "B.A. Theatre Arts",
    categoryName: "Actor",
    description: "Performs characters in theatre, films, television shows through voice, movement and expressions to entertain audiences.",
    duration: "3 years",
    universityName: "Sri Venkateswara University",
    amount: 10000,
    currency: "INR",
    chapters: 1
  },
  {
    name: "B.Tech Computer Science",
    categoryName: "Software Engineer",
    description: "Software engineering and development course covering programming, algorithms, and system design.",
    duration: "4 years",
    universityName: "MIT",
    amount: 50000,
    currency: "INR",
    chapters: 8
  },
  {
    name: "MBA Finance",
    categoryName: "Finance Manager",
    description: "Master of Business Administration with specialization in Finance.",
    duration: "2 years",
    universityName: "Harvard University",
    amount: 75000,
    currency: "INR",
    chapters: 6
  }
];

// Test with invalid data (should be skipped)
const invalidCourseData = {
  name: "Test Invalid Course",
  categoryName: "NonExistentCategory123",
  description: "This should fail due to invalid category",
  duration: "1 year",
  universityName: "NonExistentUniversity456",
  amount: 5000,
  currency: "INR",
  chapters: 1
};

async function makeRequest(endpoint, method, data) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    return { status: response.status, data: result };
  } catch (error) {
    return { error: error.message };
  }
}

async function testSingleUpload() {
  log(colors.cyan, '\n========================================');
  log(colors.cyan, 'TEST 1: Single Course Upload');
  log(colors.cyan, '========================================\n');

  log(colors.blue, 'Uploading course:');
  console.log(JSON.stringify(singleCourseData, null, 2));

  const result = await makeRequest('/upload', 'POST', singleCourseData);

  if (result.error) {
    log(colors.red, `❌ Error: ${result.error}`);
    return;
  }

  log(colors.blue, `\nResponse Status: ${result.status}`);
  
  if (result.status === 201 || result.status === 200) {
    log(colors.green, '✅ Course uploaded successfully!');
    console.log(JSON.stringify(result.data, null, 2));
  } else {
    log(colors.red, '❌ Upload failed!');
    console.log(JSON.stringify(result.data, null, 2));
  }
}

async function testBulkUpload() {
  log(colors.cyan, '\n========================================');
  log(colors.cyan, 'TEST 2: Bulk Course Upload');
  log(colors.cyan, '========================================\n');

  log(colors.blue, `Uploading ${bulkCoursesData.length} courses...`);

  const result = await makeRequest('/bulk-upload', 'POST', bulkCoursesData);

  if (result.error) {
    log(colors.red, `❌ Error: ${result.error}`);
    return;
  }

  log(colors.blue, `\nResponse Status: ${result.status}`);
  
  if (result.status === 200) {
    log(colors.green, '✅ Bulk upload completed!');
    
    if (result.data.data) {
      const { successCount, failCount, totalProcessed } = result.data.data;
      log(colors.green, `\n📊 Results:`);
      log(colors.green, `   Total Processed: ${totalProcessed}`);
      log(colors.green, `   ✅ Successful: ${successCount}`);
      log(colors.red, `   ❌ Failed: ${failCount}`);

      if (result.data.data.failed.length > 0) {
        log(colors.yellow, '\n⚠️  Failed Courses:');
        result.data.data.failed.forEach((failure, index) => {
          console.log(`   ${index + 1}. ${failure.courseName || 'Unknown'}`);
          console.log(`      Reason: ${failure.message}`);
        });
      }

      if (result.data.data.successful.length > 0) {
        log(colors.green, '\n✅ Successful Courses:');
        result.data.data.successful.forEach((success, index) => {
          console.log(`   ${index + 1}. ${success.course?.name || 'Unknown'}`);
        });
      }
    }
  } else {
    log(colors.red, '❌ Bulk upload failed!');
    console.log(JSON.stringify(result.data, null, 2));
  }
}

async function testInvalidUpload() {
  log(colors.cyan, '\n========================================');
  log(colors.cyan, 'TEST 3: Invalid Course Upload (Expected to Fail)');
  log(colors.cyan, '========================================\n');

  log(colors.blue, 'Uploading course with invalid category and university:');
  console.log(JSON.stringify(invalidCourseData, null, 2));

  const result = await makeRequest('/upload', 'POST', invalidCourseData);

  if (result.error) {
    log(colors.red, `❌ Error: ${result.error}`);
    return;
  }

  log(colors.blue, `\nResponse Status: ${result.status}`);
  
  if (result.status === 400 || result.status === 404) {
    log(colors.green, '✅ Test passed! Invalid course was correctly rejected.');
    console.log(JSON.stringify(result.data, null, 2));
  } else if (result.status === 201 || result.status === 200) {
    log(colors.yellow, '⚠️  Warning: Invalid course was accepted (unexpected)');
    console.log(JSON.stringify(result.data, null, 2));
  } else {
    log(colors.red, '❌ Unexpected response!');
    console.log(JSON.stringify(result.data, null, 2));
  }
}

async function testFuzzyMatching() {
  log(colors.cyan, '\n========================================');
  log(colors.cyan, 'TEST 4: Fuzzy Matching Tests');
  log(colors.cyan, '========================================\n');

  const fuzzyTests = [
    {
      name: "Test with extra spaces",
      categoryName: "Actor  ",  // Extra spaces
      universityName: "Sri Venkateswara University"
    },
    {
      name: "Test with lowercase",
      categoryName: "actor",  // Lowercase
      universityName: "sri venkateswara university"
    },
    {
      name: "Test with partial match",
      categoryName: "Act",  // Partial
      universityName: "Venkateswara"
    }
  ];

  for (let i = 0; i < fuzzyTests.length; i++) {
    const testCase = fuzzyTests[i];
    log(colors.blue, `\n${i + 1}. ${testCase.name}`);
    console.log(`   categoryName: "${testCase.categoryName}"`);
    console.log(`   universityName: "${testCase.universityName}"`);

    const courseData = {
      name: `Test Course ${i + 1}`,
      categoryName: testCase.categoryName,
      universityName: testCase.universityName,
      description: "Test description",
      duration: "1 year",
      amount: 5000,
      currency: "INR",
      chapters: 1
    };

    const result = await makeRequest('/upload', 'POST', courseData);

    if (result.error) {
      log(colors.red, `   ❌ Error: ${result.error}`);
      continue;
    }

    if (result.status === 201 || result.status === 200) {
      log(colors.green, '   ✅ Fuzzy matching worked!');
    } else {
      log(colors.red, '   ❌ Fuzzy matching failed');
      console.log(`   ${result.data.message}`);
    }
  }
}

async function runAllTests() {
  log(colors.green, '\n╔════════════════════════════════════════╗');
  log(colors.green, '║  Course Upload API Test Suite         ║');
  log(colors.green, '╚════════════════════════════════════════╝\n');

  try {
    await testSingleUpload();
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second

    await testBulkUpload();
    await new Promise(resolve => setTimeout(resolve, 1000));

    await testInvalidUpload();
    await new Promise(resolve => setTimeout(resolve, 1000));

    await testFuzzyMatching();

    log(colors.green, '\n========================================');
    log(colors.green, '✅ All tests completed!');
    log(colors.green, '========================================\n');
  } catch (error) {
    log(colors.red, `\n❌ Test suite error: ${error.message}`);
    console.error(error);
  }
}

// Run the tests
runAllTests().catch(console.error);

