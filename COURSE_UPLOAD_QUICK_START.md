# 🚀 Course Upload API - Quick Start

## ✅ Status: WORKING!

Your course upload API is live and fully functional!

---

## 📍 API Endpoints

**Base URL**: `http://localhost:5001/api/v1/courses`

### Single Upload

```
POST /api/v1/courses/upload
```

### Bulk Upload

```
POST /api/v1/courses/bulk-upload
```

---

## 🎯 Quick Test

### Test with cURL

```bash
curl -X POST http://localhost:5001/api/v1/courses/upload \
  -H "Content-Type: application/json" \
  -d '{
    "name": "B.A. Theatre Arts",
    "categoryName": "Actor",
    "universityName": "Sri Venkateswara University",
    "duration": "3 years",
    "amount": 10000,
    "currency": "INR",
    "chapters": 1
  }'
```

### Run Full Test Suite

```bash
node test-course-upload.js
```

---

## ✅ What's Working

Based on your test results:

1. **✅ Single Course Upload**

   - Successfully created course with ID: `68e6466e16303f1d7fe1636a`
   - Category "Actor" → Found and matched to ID: `68d1904d1c39b017056addea`
   - University "Sri Venkateswara University" → Found and matched to ID: `68e16c1fd2459cddccbba8a3`

2. **✅ Bulk Upload**
   - Processed 3 courses
   - 2 successful, 1 failed (Harvard University not in database)
3. **✅ Error Handling**
   - Invalid categories/universities correctly rejected with 400 status
4. **✅ Fuzzy Matching**
   - Extra spaces: `"Actor  "` → ✅ Matched
   - Lowercase: `"actor"` → ✅ Matched
   - Partial: `"Act"` → ✅ Matched

---

## 📝 Request Format

### Required Fields

```json
{
  "name": "Course Name",
  "categoryName": "Category Name", // Matches Category.name
  "universityName": "University Name" // Matches User.collegeName (role=university)
}
```

### Optional Fields

```json
{
  "description": "Course description",
  "duration": "3 years",
  "amount": 10000,
  "currency": "INR",
  "chapters": 1
}
```

---

## 🔍 How Matching Works

### Category Matching

Searches `Category` collection:

- Field: `name`
- Fuzzy matching: case-insensitive, ignores spaces/commas
- Example: `"actor"` matches `"Actor"`

### University Matching

Searches `User` collection:

- Role: `"university"`
- Field: `collegeName`
- Fuzzy matching: case-insensitive, partial matches
- Example: `"venkateswara"` matches `"Sri Venkateswara University"`

---

## 📊 Response Format

### Success (201 Created)

```json
{
  "success": true,
  "message": "Course created successfully",
  "data": {
    "_id": "68e6466e16303f1d7fe1636a",
    "name": "B.A. Theatre Arts",
    "categoryId": ["68d1904d1c39b017056addea"],
    "parentCategoryId": ["68d1901b1c39b017056adde6"],
    "UniversityId": "68e16c1fd2459cddccbba8a3",
    "amount": 10000,
    "currency": "INR",
    ...
  },
  "statusCode": 201
}
```

### Error (400 Bad Request)

```json
{
  "success": false,
  "message": "Category 'InvalidName' not found. Course skipped.",
  "statusCode": 400
}
```

---

## 🧪 Testing Tips

### 1. Verify Prerequisites

```bash
# Check categories exist
# Check universities exist with role='university' and collegeName set
```

### 2. Test Single Upload First

```bash
curl -X POST http://localhost:5001/api/v1/courses/upload \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","categoryName":"Actor","universityName":"Sri Venkateswara University"}'
```

### 3. Run Full Test Suite

```bash
node test-course-upload.js
```

---

## 🎓 Your Test Results

From your last test run:

```
✅ Single Course Upload: SUCCESS
✅ Bulk Upload: SUCCESS (2/3 - Harvard not found)
✅ Invalid Course Rejection: SUCCESS
✅ Fuzzy Matching - Extra spaces: SUCCESS
✅ Fuzzy Matching - Lowercase: SUCCESS
✅ Fuzzy Matching - Partial match: SUCCESS
```

**Overall: 🎉 ALL TESTS PASSING!**

---

## 📚 Full Documentation

- **Quick Start**: `COURSE_UPLOAD_README.md`
- **API Reference**: `COURSE_UPLOAD_GUIDE.md`
- **Code Examples**: `COURSE_UPLOAD_EXAMPLES.md`
- **Implementation**: `COURSE_UPLOAD_IMPLEMENTATION_SUMMARY.md`

---

## 🔧 Common Commands

### Start Server

```bash
npm run dev
```

### Test API

```bash
node test-course-upload.js
```

### Check Server Status

```bash
lsof -i :5001
```

---

## 💡 Pro Tips

1. **Server Port**: Your server runs on port `5001` (not 3000)
2. **API Path**: Always use `/api/v1/courses` prefix
3. **Matching**: Category uses `name` field, University uses `collegeName`
4. **Role**: Universities must have `role: "university"` in User table
5. **Fuzzy Matching**: Handles spaces, case, and partial names automatically

---

## ✨ You're All Set!

Your course upload API is fully functional and ready to use! 🎉

Happy coding! 🚀

