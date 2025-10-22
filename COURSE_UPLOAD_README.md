# 🎓 Course Upload Feature - Complete Implementation

## ✅ What's Been Built

A complete course upload system with intelligent fuzzy matching that automatically resolves category and university names to their IDs.

---

## 🚀 Quick Start

### Upload a Single Course

```bash
curl -X POST http://localhost:5001/api/v1/courses/upload \
  -H "Content-Type: application/json" \
  -d '{
    "name": "B.A. Theatre Arts",
    "categoryName": "Actor",
    "universityName": "Sri Venkateswara University",
    "description": "Performs characters in theatre",
    "duration": "3 years",
    "amount": 10000,
    "currency": "INR",
    "chapters": 1
  }'
```

### Upload Multiple Courses

```bash
curl -X POST http://localhost:5001/api/v1/courses/bulk-upload \
  -H "Content-Type: application/json" \
  -d '[
    {
      "name": "Course 1",
      "categoryName": "Actor",
      "universityName": "MIT",
      "duration": "3 years",
      "amount": 10000,
      "currency": "INR",
      "chapters": 1
    },
    {
      "name": "Course 2",
      "categoryName": "Software Engineer",
      "universityName": "Harvard",
      "duration": "4 years",
      "amount": 20000,
      "currency": "INR",
      "chapters": 2
    }
  ]'
```

---

## 🎯 Key Features

### 1. Fuzzy Name Matching

- ✅ Handles spaces, commas, case variations
- ✅ Partial name matching
- ✅ Automatic normalization

**Examples:**

- `"Actor"` → finds `"Actor"` ✅
- `"actor"` → finds `"Actor"` ✅
- `"Act or"` → finds `"Actor"` ✅
- `"software engineer"` → finds `"Software Engineer"` ✅

### 2. Automatic ID Resolution

- ✅ Converts `categoryName` → `categoryId`
- ✅ Converts `universityName` → `UniversityId`
- ✅ Automatically finds parent category

### 3. Smart Error Handling

- ✅ Skips invalid entries
- ✅ Continues processing valid ones
- ✅ Detailed error reporting

### 4. Bulk Upload Support

- ✅ Upload multiple courses at once
- ✅ Detailed success/failure report
- ✅ Individual course error tracking

---

## 📁 Files Modified/Created

### Modified Files

1. ✅ `src/app/modules/courses/services/course.ts` - Added fuzzy matching logic
2. ✅ `src/app/modules/courses/controllers/course.ts` - Added upload endpoints
3. ✅ `src/app/modules/courses/routes/course.ts` - Added new routes

### Documentation Files

1. ✅ `COURSE_UPLOAD_GUIDE.md` - Complete API documentation
2. ✅ `COURSE_UPLOAD_EXAMPLES.md` - Practical examples
3. ✅ `COURSE_UPLOAD_IMPLEMENTATION_SUMMARY.md` - Technical details
4. ✅ `COURSE_UPLOAD_README.md` - This file

### Testing Files

1. ✅ `test-course-upload.js` - Automated test script

---

## 🔌 API Endpoints

### 1. Single Course Upload

```
POST /api/v1/courses/upload
```

**Required Fields:**

- `name` - Course name
- `categoryName` - Category name (fuzzy matched)
- `universityName` - University name (fuzzy matched)

**Optional Fields:**

- `description`, `duration`, `amount`, `currency`, `chapters`

### 2. Bulk Course Upload

```
POST /api/v1/courses/bulk-upload
```

**Body:** Array of course objects (same format as single upload)

---

## 📊 Response Format

### Success Response

```json
{
  "success": true,
  "message": "Course created successfully",
  "data": {
    "_id": "...",
    "name": "B.A. Theatre Arts",
    "categoryId": ["..."],
    "parentCategoryId": ["..."],
    "UniversityId": "...",
    ...
  }
}
```

### Bulk Upload Response

```json
{
  "success": true,
  "message": "Bulk upload completed. Success: 2, Failed: 1",
  "data": {
    "successful": [
      /* array of successful uploads */
    ],
    "failed": [
      /* array of failed uploads with reasons */
    ],
    "totalProcessed": 3,
    "successCount": 2,
    "failCount": 1
  }
}
```

---

## 🧪 Testing

### Run Automated Tests

```bash
node test-course-upload.js
```

This will test:

- ✅ Single course upload
- ✅ Bulk course upload
- ✅ Invalid course handling
- ✅ Fuzzy matching variations

---

## 📋 Prerequisites

Before uploading courses:

1. **Categories must exist** in the database

   ```javascript
   // Make sure categories like "Actor", "Software Engineer" exist
   ```

2. **Universities must exist** with `role: "university"`
   ```javascript
   // User table entries with:
   // - role: "university"
   // - collegeName or firstName/lastName set
   ```

---

## 🔍 How It Works

### Input (What You Send)

```json
{
  "name": "B.A. Theatre Arts",
  "categoryName": "Actor",           ← name string
  "universityName": "MIT"            ← name string
}
```

### Processing

1. System finds category by name → gets category ID
2. System finds parent category → gets parent ID
3. System finds university by name → gets university ID
4. System creates course with proper IDs

### Output (What Gets Saved)

```json
{
  "name": "B.A. Theatre Arts",
  "categoryId": ["65abc123..."],     ← resolved ID
  "parentCategoryId": ["65xyz789..."],← resolved parent ID
  "UniversityId": "65uni456..."      ← resolved ID
}
```

---

## 🎨 Fuzzy Matching Examples

| You Send              | Database Has                                 | Result                      |
| --------------------- | -------------------------------------------- | --------------------------- |
| `"Actor"`             | `"Actor"`                                    | ✅ Match                    |
| `"actor"`             | `"Actor"`                                    | ✅ Match (case-insensitive) |
| `"Act or"`            | `"Actor"`                                    | ✅ Match (space removed)    |
| `"Software Engineer"` | `"SoftwareEngineer"`                         | ✅ Match (normalized)       |
| `"MIT"`               | `collegeName: "MIT"`                         | ✅ Match                    |
| `"sri venkateswara"`  | `collegeName: "Sri Venkateswara University"` | ✅ Match (partial)          |

---

## 🚨 Common Issues & Solutions

### Issue: "Category not found"

**Solution:**

- Check category name spelling
- Verify category exists in database
- Try variations (lowercase, without spaces)

### Issue: "University not found"

**Solution:**

- Verify user exists with `role: "university"`
- Check `collegeName`, `firstName`, or `lastName` fields
- Try using college name instead

### Issue: "Amount not saving"

**Solution:**

- Send as number: `10000` not `"10000"`
- Don't include currency symbols: `10000` not `"₹10,000"`

---

## 📚 Documentation

For more details, see:

- 📖 **COURSE_UPLOAD_GUIDE.md** - Complete API reference
- 💡 **COURSE_UPLOAD_EXAMPLES.md** - Code examples in multiple languages
- 🔧 **COURSE_UPLOAD_IMPLEMENTATION_SUMMARY.md** - Technical implementation details

---

## 🎯 Usage Examples

### JavaScript

```javascript
const course = {
  name: "B.A. Theatre Arts",
  categoryName: "Actor",
  universityName: "Sri Venkateswara University",
  duration: "3 years",
  amount: 10000,
  currency: "INR",
  chapters: 1,
};

const response = await fetch("http://localhost:5001/api/v1/courses/upload", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(course),
});

const result = await response.json();
console.log(result);
```

### Python

```python
import requests

course = {
    "name": "B.A. Theatre Arts",
    "categoryName": "Actor",
    "universityName": "Sri Venkateswara University",
    "duration": "3 years",
    "amount": 10000,
    "currency": "INR",
    "chapters": 1
}

response = requests.post(
    'http://localhost:5001/api/v1/courses/upload',
    json=course
)

print(response.json())
```

---

## ✨ Benefits

1. **No Manual ID Lookup**: Send names, not IDs
2. **Flexible Input**: Handles various name formats
3. **Bulk Processing**: Upload many courses at once
4. **Error Resilient**: Continues despite individual failures
5. **Detailed Feedback**: Know exactly what succeeded/failed
6. **Easy Integration**: Simple REST API

---

## 🔐 Security Notes

- No authentication required on routes (add if needed)
- Validates required fields
- Handles errors gracefully
- Logs all operations
- No sensitive data exposure

**To add authentication**, modify routes:

```javascript
// In src/app/modules/courses/routes/course.ts
courseRouter.post(
  "/upload",
  AuthMiddleware.authenticate, // Add this
  courseController.uploadCourse.bind(courseController)
);
```

---

## 🎉 You're Ready!

Start uploading courses with just names - the system handles the rest!

```bash
# Test it now
node test-course-upload.js
```

For questions or issues, check the logs and documentation files.
