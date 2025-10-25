import fs from "fs";
import path from "path";

// ============================================
// PRODUCTION-READY COURSE UPLOAD SCRIPT
// ============================================

// Configuration
const CONFIG = {
  API_URL: "http://localhost:5001/api/v1/courses/bulk-upload",
  AUTH_TOKEN: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGFmMmIxZjBkYzhlYTgyMThhN2FjY2MiLCJyb2xlIjoiYWRtaW4iLCJlbWFpbCI6ImFkbWluQGdtYWlsLmNvbSIsImZpcnN0TmFtZSI6IlZpc2hhbCIsImxhc3ROYW1lIjoiQ2hhdWJleSIsInN0cmVhbSI6Ik5vbiBNZWRpY2FsIiwiYm9hcmQiOiJDQlNFIiwiaWF0IjoxNzU5NTk1OTEwfQ.4G0i5lEz9gjgBXjQwoOGd7qg1WY5HU8kDPmDGqgBdG8",
  BATCH_SIZE: 50, // Process 50 courses at a time (bulk upload handles this efficiently)
  DELAY_BETWEEN_BATCHES: 2000, // 2 seconds delay between batches
  MAX_RETRIES: 3, // Retry failed batches 3 times
  TIMEOUT: 60000, // 60 second timeout per batch
};

// Statistics tracking
const stats = {
  total: 0,
  successful: 0,
  failed: 0,
  skipped: 0,
  errors: [],
  categoryNotFound: [],
  universityNotFound: [],
};

// Sleep function for delays
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Fetch with timeout
const fetchWithTimeout = (url, options, timeout = CONFIG.TIMEOUT) => {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timeout")), timeout)
    ),
  ]);
};

// Clean and format course data
function cleanCourseData(course) {
  // Clean amount: remove ?, commas, and convert to number
  let amount = course.amount;
  if (typeof amount === "string") {
    amount = amount.replace(/[?₹,\s]/g, ""); // Remove ?, ₹, commas, spaces
    amount = parseInt(amount) || 0;
  }

  return {
    name: course.name?.trim(),
    categoryName: course.categoryName?.trim(),
    universityName: course.universityName?.trim(),
    description: course.description?.trim() || "",
    duration: course.duration?.trim() || "",
    amount: amount,
    currency: course.currency?.trim() || "INR",
    chapters: course.chapters || 1,
  };
}

// Upload a batch of courses
async function uploadBatch(batch, batchNumber, retryCount = 0) {
  const myHeaders = new Headers();
  myHeaders.append("accept", "application/json, text/plain, */*");
  myHeaders.append("authorization", CONFIG.AUTH_TOKEN);
  myHeaders.append("content-type", "application/json");

  const cleanedBatch = batch.map(cleanCourseData);

  // Debug logging for first batch
  if (batchNumber === 1 && retryCount === 0) {
    console.log("\n🔍 DEBUG - First course data being sent:");
    console.log(JSON.stringify(cleanedBatch[0], null, 2));
    console.log("");
  }

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: JSON.stringify(cleanedBatch),
    redirect: "follow",
  };

  try {
    const response = await fetchWithTimeout(
      CONFIG.API_URL,
      requestOptions,
      CONFIG.TIMEOUT
    );

    const responseText = await response.text();
    let responseData;

    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = { message: responseText };
    }

    if (response.ok || response.status === 200 || response.status === 201) {
      // Process results from bulk upload
      const result = responseData.data || responseData;
      
      if (result.successful) {
        stats.successful += result.successCount || result.successful.length;
        console.log(
          `✅ Batch ${batchNumber}: ${result.successCount || result.successful.length} courses uploaded successfully`
        );
      }

      if (result.failed && result.failed.length > 0) {
        stats.failed += result.failCount || result.failed.length;
        console.log(
          `❌ Batch ${batchNumber}: ${result.failCount || result.failed.length} courses failed`
        );

        // Track reasons for failures
        result.failed.forEach((failure) => {
          const errorMsg = failure.message || "Unknown error";
          stats.errors.push({
            course: failure.courseName || "Unknown",
            batch: batchNumber,
            error: errorMsg,
          });

          // Track category/university not found errors
          if (errorMsg.includes("Category") && errorMsg.includes("not found")) {
            const categoryMatch = errorMsg.match(/Category '([^']+)'/);
            if (categoryMatch) {
              stats.categoryNotFound.push({
                name: categoryMatch[1],
                course: failure.courseName,
              });
            }
          }

          if (errorMsg.includes("University") && errorMsg.includes("not found")) {
            const universityMatch = errorMsg.match(/University '([^']+)'/);
            if (universityMatch) {
              stats.universityNotFound.push({
                name: universityMatch[1],
                course: failure.courseName,
              });
            }
          }
        });
      }

      return { success: true, data: result };
    } else {
      throw new Error(
        `HTTP ${response.status}: ${responseData.message || responseText}`
      );
    }
  } catch (error) {
    if (retryCount < CONFIG.MAX_RETRIES) {
      console.log(
        `⚠️  Retry ${retryCount + 1}/${CONFIG.MAX_RETRIES} for Batch ${batchNumber}: ${error.message}`
      );
      await sleep(2000 * (retryCount + 1)); // Exponential backoff
      return uploadBatch(batch, batchNumber, retryCount + 1);
    } else {
      stats.failed += batch.length;
      const errorMsg = `Failed to upload batch ${batchNumber}: ${error.message}`;
      console.error(`❌ ${errorMsg}`);
      stats.errors.push({
        batch: batchNumber,
        courses: batch.length,
        error: error.message,
      });
      return { success: false, error: error.message };
    }
  }
}

// Process courses in batches
async function processBatch(batch, batchNumber) {
  console.log(
    `\n📦 Processing Batch ${batchNumber} (${batch.length} courses)...`
  );

  await uploadBatch(batch, batchNumber);
  console.log(`✓ Batch ${batchNumber} completed`);
}

// Main upload function
async function uploadAllCourses() {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║       COURSE DATA UPLOAD SCRIPT - PRODUCTION MODE         ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  // Load course data from JSON file
  const jsonFilePath = path.join(process.cwd(), "bulk-upload/courses/courses-data-part-1.json");
  
  console.log(`📂 Reading course data from: ${jsonFilePath}`);
  
  let coursesData;
  try {
    const fileContent = fs.readFileSync(jsonFilePath, "utf-8");
    coursesData = JSON.parse(fileContent);
    console.log(`✅ Successfully loaded ${coursesData.length} courses\n`);
  } catch (error) {
    console.error(`❌ Error reading JSON file: ${error.message}`);
    process.exit(1);
  }

  stats.total = coursesData.length;

  console.log(`📊 Total courses to upload: ${stats.total}`);
  console.log(`⚙️  Batch size: ${CONFIG.BATCH_SIZE}`);
  console.log(`⏱️  Delay between batches: ${CONFIG.DELAY_BETWEEN_BATCHES}ms`);
  console.log(`🔄 Max retries per batch: ${CONFIG.MAX_RETRIES}`);
  console.log(`🌐 API URL: ${CONFIG.API_URL}\n`);
  console.log("Starting upload process...\n");
  console.log("═".repeat(60) + "\n");

  const startTime = Date.now();

  // Split data into batches
  const batches = [];
  for (let i = 0; i < coursesData.length; i += CONFIG.BATCH_SIZE) {
    batches.push(coursesData.slice(i, i + CONFIG.BATCH_SIZE));
  }

  console.log(`📦 Total batches: ${batches.length}\n`);

  // Process each batch
  for (let i = 0; i < batches.length; i++) {
    await processBatch(batches[i], i + 1);

    // Add delay between batches (except for the last batch)
    if (i < batches.length - 1) {
      console.log(
        `⏳ Waiting ${CONFIG.DELAY_BETWEEN_BATCHES}ms before next batch...\n`
      );
      await sleep(CONFIG.DELAY_BETWEEN_BATCHES);
    }
  }

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  // Final summary
  console.log("\n" + "═".repeat(60));
  console.log("\n📋 UPLOAD SUMMARY");
  console.log("═".repeat(60));
  console.log(`✅ Successful uploads: ${stats.successful}`);
  console.log(`❌ Failed uploads: ${stats.failed}`);
  console.log(
    `📊 Total processed: ${stats.successful + stats.failed}/${stats.total}`
  );
  console.log(`⏱️  Total time: ${duration} seconds`);
  console.log(
    `⚡ Average time per course: ${(duration / stats.total).toFixed(3)} seconds`
  );

  // Category not found summary
  if (stats.categoryNotFound.length > 0) {
    console.log("\n⚠️  CATEGORIES NOT FOUND:");
    console.log("═".repeat(60));
    const uniqueCategories = [
      ...new Set(stats.categoryNotFound.map((c) => c.name)),
    ];
    uniqueCategories.forEach((cat, idx) => {
      const count = stats.categoryNotFound.filter((c) => c.name === cat).length;
      console.log(`${idx + 1}. "${cat}" (${count} courses affected)`);
    });
  }

  // University not found summary
  if (stats.universityNotFound.length > 0) {
    console.log("\n⚠️  UNIVERSITIES NOT FOUND:");
    console.log("═".repeat(60));
    const uniqueUniversities = [
      ...new Set(stats.universityNotFound.map((u) => u.name)),
    ];
    uniqueUniversities.forEach((uni, idx) => {
      const count = stats.universityNotFound.filter((u) => u.name === uni).length;
      console.log(`${idx + 1}. "${uni}" (${count} courses affected)`);
    });
  }

  // Detailed errors
  if (stats.errors.length > 0 && stats.errors.length <= 50) {
    console.log("\n❌ DETAILED ERRORS:");
    console.log("═".repeat(60));
    stats.errors.slice(0, 50).forEach((err, idx) => {
      console.log(
        `${idx + 1}. ${err.course || `Batch ${err.batch}`} ${err.batch ? `(Batch ${err.batch})` : ""}`
      );
      console.log(`   Error: ${err.error}\n`);
    });
    if (stats.errors.length > 50) {
      console.log(`... and ${stats.errors.length - 50} more errors`);
    }
  }

  console.log("\n" + "═".repeat(60));
  console.log("✨ Upload process completed!");
  console.log("═".repeat(60) + "\n");

  // Suggestions
  if (stats.categoryNotFound.length > 0 || stats.universityNotFound.length > 0) {
    console.log("💡 SUGGESTIONS:");
    console.log("═".repeat(60));
    if (stats.categoryNotFound.length > 0) {
      console.log(
        "• Add missing categories to your database before re-uploading failed courses"
      );
    }
    if (stats.universityNotFound.length > 0) {
      console.log(
        "• Ensure universities exist with role='university' and collegeName field set"
      );
      console.log(
        "• Check for spelling differences or variations in university names"
      );
    }
    console.log("");
  }
}

// Start the upload process
uploadAllCourses().catch((error) => {
  console.error("💥 Fatal error during upload process:", error);
  process.exit(1);
});


