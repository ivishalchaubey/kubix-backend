# 📚 Course Bulk Upload Guide

## Overview

This guide explains how to bulk upload all courses from `all-cources-data.json` to your database using the automated upload script.

---

## 🚀 Quick Start

### Option 1: Use Shell Script (Recommended)

#### macOS/Linux:

```bash
./upload-courses.sh
```

#### Windows:

```cmd
upload-courses.bat
```

### Option 2: Direct Node.js

```bash
node upload-courses.js
```

---

## 📋 Prerequisites

### 1. **Server Must Be Running**

```bash
npm run dev
```

Server should be running on `http://localhost:5001`

### 2. **Data File Must Exist**

Ensure `all-cources-data.json` is in the root directory

### 3. **Categories Must Exist**

All categories referenced in courses must already exist in the database

### 4. **Universities Must Exist**

All universities must exist in the User table with:

- `role: "university"`
- `collegeName` field populated

---

## 📊 What the Script Does

### 1. **Data Cleaning**

- Removes currency symbols (`?`, `₹`) from amounts
- Removes commas from numbers
- Converts amounts to integers
- Trims whitespace from all fields

### 2. **Batch Processing**

- Processes courses in batches of 50
- Uses bulk upload API for efficiency
- Adds delays between batches to prevent overload

### 3. **Fuzzy Matching**

- Automatically finds category IDs from category names
- Automatically finds university IDs from university names (collegeName)
- Handles variations in names (spaces, case, etc.)

### 4. **Error Handling**

- Retries failed batches up to 3 times
- Tracks which categories/universities weren't found
- Provides detailed error reporting

### 5. **Progress Tracking**

- Shows real-time upload progress
- Displays batch completion status
- Provides comprehensive summary at the end

---

## ⚙️ Configuration

Edit `upload-courses.js` to modify:

```javascript
const CONFIG = {
  API_URL: "http://localhost:5001/api/v1/courses/bulk-upload",
  BATCH_SIZE: 50, // Courses per batch
  DELAY_BETWEEN_BATCHES: 2000, // 2 seconds
  MAX_RETRIES: 3, // Retry attempts
  TIMEOUT: 60000, // 60 seconds
};
```

---

## 📝 Data Format

### Input Format (all-cources-data.json)

```json
[
  {
    "name": "B.A. Theatre Arts",
    "categoryName": "Actor",
    "description": "Course description...",
    "duration": "3 years",
    "universityName": "Sri Venkateswara University",
    "amount": "?10,000",
    "currency": "INR",
    "chapters": 1
  }
]
```

### What Gets Uploaded

```json
{
  "name": "B.A. Theatre Arts",
  "categoryName": "Actor",
  "universityName": "Sri Venkateswara University",
  "description": "Course description...",
  "duration": "3 years",
  "amount": 10000, // ← Cleaned (no ?, commas)
  "currency": "INR",
  "chapters": 1
}
```

---

## 📊 Output Example

```
╔════════════════════════════════════════════════════════════╗
║       COURSE DATA UPLOAD SCRIPT - PRODUCTION MODE         ║
╚════════════════════════════════════════════════════════════╝

📂 Reading course data from: /path/to/all-cources-data.json
✅ Successfully loaded 9532 courses

📊 Total courses to upload: 9532
⚙️  Batch size: 50
⏱️  Delay between batches: 2000ms
🔄 Max retries per batch: 3
🌐 API URL: http://localhost:5001/api/v1/courses/bulk-upload

Starting upload process...

============================================================

🔍 DEBUG - First course data being sent:
{
  "name": "B.A. Theatre Arts",
  "categoryName": "Actor",
  "universityName": "Sri Venkateswara University",
  "description": "Performs characters...",
  "duration": "3 years",
  "amount": 10000,
  "currency": "INR",
  "chapters": 1
}

📦 Processing Batch 1 (50 courses)...
✅ Batch 1: 48 courses uploaded successfully
❌ Batch 1: 2 courses failed
✓ Batch 1 completed
⏳ Waiting 2000ms before next batch...

📦 Processing Batch 2 (50 courses)...
✅ Batch 2: 50 courses uploaded successfully
✓ Batch 2 completed
...

============================================================

📋 UPLOAD SUMMARY
============================================================
✅ Successful uploads: 9400
❌ Failed uploads: 132
📊 Total processed: 9532/9532
⏱️  Total time: 425.34 seconds
⚡ Average time per course: 0.045 seconds

⚠️  CATEGORIES NOT FOUND:
============================================================
1. "Invalid Category" (5 courses affected)
2. "Another Missing Category" (3 courses affected)

⚠️  UNIVERSITIES NOT FOUND:
============================================================
1. "Harvard University" (124 courses affected)

✨ Upload process completed!
============================================================

💡 SUGGESTIONS:
============================================================
• Add missing categories to your database before re-uploading
• Ensure universities exist with role='university' and collegeName set
• Check for spelling differences in university names
```

---

## 🔍 Understanding Results

### Success Count

Number of courses successfully created in the database

### Failed Count

Number of courses that couldn't be uploaded due to:

- Category not found
- University not found
- Invalid data
- Server errors

### Categories Not Found

Lists all category names that don't exist in your database

### Universities Not Found

Lists all university names (collegeName) that don't exist or don't have role='university'

---

## 🛠️ Troubleshooting

### Issue: "Category not found"

**Solution:**

1. Check category names in database
2. Ensure exact match or similar fuzzy match possible
3. Add missing categories before uploading
4. Update course data with correct category names

### Issue: "University not found"

**Solution:**

1. Verify university exists in User table
2. Check `role: "university"`
3. Ensure `collegeName` field is populated
4. Compare names in data vs database (fuzzy matching helps but isn't perfect)

### Issue: "Request timeout"

**Solution:**

1. Reduce `BATCH_SIZE` (try 25 instead of 50)
2. Increase `TIMEOUT` (try 90000ms)
3. Check server performance
4. Ensure database connection is stable

### Issue: Server not responding

**Solution:**

1. Verify server is running: `lsof -i :5001`
2. Check server logs for errors
3. Restart server: `npm run dev`
4. Test API manually: `curl http://localhost:5001/api/v1/courses/upload`

---

## 📈 Performance Tips

### 1. **Optimize Batch Size**

- Larger batches = faster overall
- Smaller batches = more reliable
- Recommended: 50-100 courses per batch

### 2. **Pre-verify Data**

Before running the full upload:

```bash
# Check first 10 courses manually
node -e "console.log(JSON.stringify(require('./all-cources-data.json').slice(0,10), null, 2))"
```

### 3. **Monitor Server**

Keep an eye on:

- Memory usage
- CPU usage
- Database connections
- Response times

### 4. **Run During Off-Peak Hours**

For production, schedule uploads when traffic is low

---

## 🔄 Re-uploading Failed Courses

### Option 1: Manual Fix

1. Review categories/universities not found
2. Add missing entries to database
3. Re-run the upload script (it will skip existing courses)

### Option 2: Filter and Re-upload

Create a filtered JSON with only failed courses:

```javascript
// filter-failed.js
import fs from "fs";

const failedCourseNames = [
  "Course Name 1",
  "Course Name 2",
  // ... from error report
];

const allCourses = JSON.parse(fs.readFileSync("all-cources-data.json"));
const failedCourses = allCourses.filter((c) =>
  failedCourseNames.includes(c.name)
);

fs.writeFileSync("failed-courses.json", JSON.stringify(failedCourses, null, 2));
```

Then modify `upload-courses.js` to use `failed-courses.json`

---

## 📊 Expected Timeline

For **9,532 courses**:

- **Batch Size**: 50 courses
- **Total Batches**: ~191 batches
- **Delay Between Batches**: 2 seconds
- **Estimated Time**: 7-10 minutes (depending on server speed)

---

## ✅ Verification

After upload, verify in your database:

```javascript
// In MongoDB shell or compass
db.courses.countDocuments(); // Should match successful uploads
db.courses.find().limit(10); // Check sample data
```

Or use your API:

```bash
curl http://localhost:5001/api/v1/courses | jq '.data | length'
```

---

## 🎯 Best Practices

1. ✅ **Backup Database** before bulk uploads
2. ✅ **Test with Small Sample** (first 10-20 courses)
3. ✅ **Verify Prerequisites** (categories, universities exist)
4. ✅ **Monitor Progress** (watch console output)
5. ✅ **Review Summary** (check failed courses)
6. ✅ **Fix Issues** before re-uploading
7. ✅ **Document Changes** (track what was uploaded when)

---

## 📞 Support

If you encounter issues:

1. Check server logs: `tail -f server.log`
2. Review error messages in upload output
3. Verify data format matches expected structure
4. Test single course upload first
5. Check database connections

---

## 🎉 Success Criteria

Upload is successful when:

- ✅ All or most courses uploaded
- ✅ Failed courses have clear reasons
- ✅ Categories/universities identified for missing entries
- ✅ Database contains expected number of courses
- ✅ Sample courses can be fetched via API

---

**Happy Uploading! 🚀**

