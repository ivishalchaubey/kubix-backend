# Course Upload Implementation Summary

## Overview

This implementation adds new course upload endpoints with intelligent fuzzy matching for category and university names. The system automatically resolves category names to category IDs and university names to university IDs.

## What Was Implemented

### 1. Service Layer (`src/app/modules/courses/services/course.ts`)

Added three private helper methods and two public methods:

#### Private Helper Methods:

- **`normalizeString(str: string)`**: Normalizes strings by removing extra spaces, commas, and converting to lowercase for fuzzy matching
- **`findCategoryByName(categoryName: string)`**: Finds category ID by name using:
  - Exact match (case-insensitive)
  - Fuzzy match (partial matching, handles spaces/commas)
- **`findUniversityByName(universityName: string)`**: Finds university ID by name from User table where `role='university'`, checking:
  - `firstName`
  - `lastName`
  - `collegeName`
  - Combined `firstName + lastName`

#### Public Methods:

- **`uploadCourse(courseData)`**: Uploads a single course with fuzzy matching
  - Validates categoryName and universityName
  - Skips if not found (returns error object)
  - Automatically determines parent category
  - Creates course with proper IDs
- **`bulkUploadCourses(coursesData[])`**: Bulk uploads multiple courses
  - Processes each course individually
  - Returns detailed results (successful/failed)
  - Continues processing even if some fail

### 2. Controller Layer (`src/app/modules/courses/controllers/course.ts`)

Added two new controller methods:

- **`uploadCourse(req, res, next)`**: Handles single course upload
  - Validates required fields
  - Returns appropriate success/error responses
- **`bulkUploadCourses(req, res, next)`**: Handles bulk course upload
  - Validates request body is an array
  - Returns summary of successes and failures

### 3. Routes Layer (`src/app/modules/courses/routes/course.ts`)

Added two new routes:

- **POST `/api/courses/upload`**: Single course upload endpoint
- **POST `/api/courses/bulk-upload`**: Bulk course upload endpoint

### 4. Documentation

Created comprehensive documentation files:

- **`COURSE_UPLOAD_GUIDE.md`**: Complete API documentation with examples
- **`test-course-upload.js`**: Test script for the new endpoints

## Key Features

### ✅ Fuzzy Matching Algorithm

The system uses a multi-step matching approach:

1. **Exact Match**: First attempts case-insensitive exact match
2. **Normalization**: Removes spaces, commas, special characters
3. **Partial Matching**: Checks if one string contains the other
4. **Multiple Fields**: For universities, checks multiple fields (firstName, lastName, collegeName)

### ✅ Error Handling

- **Single Upload**: Returns error if category/university not found
- **Bulk Upload**: Skips invalid entries, continues with valid ones
- **Detailed Feedback**: Provides clear messages about what went wrong

### ✅ Automatic Parent Category Resolution

- Checks if category has a `parentId`
- Uses parent if available, otherwise uses category itself
- Properly populates both `categoryId` and `parentCategoryId` arrays

### ✅ Logging

All operations are logged for debugging:

- Successful course creations
- Skipped courses with reasons
- Errors during processing

## Request/Response Format

### Single Upload Request

```json
POST /api/courses/upload
{
  "name": "B.A. Theatre Arts",
  "categoryName": "Actor",
  "description": "Course description",
  "duration": "3 years",
  "universityName": "Sri Venkateswara University",
  "amount": 10000,
  "currency": "INR",
  "chapters": 1
}
```

### Bulk Upload Request

```json
POST /api/courses/bulk-upload
[
  { /* course 1 */ },
  { /* course 2 */ },
  { /* course 3 */ }
]
```

### Success Response (Single)

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
    "successful": [...],
    "failed": [...],
    "totalProcessed": 3,
    "successCount": 2,
    "failCount": 1
  }
}
```

## How to Use

### Prerequisites

1. **Categories must exist** in the `Category` collection
2. **Universities must exist** in the `User` collection with `role: "university"`

### Testing

Run the provided test script:

```bash
node test-course-upload.js
```

### Using cURL

```bash
# Single upload
curl -X POST http://localhost:3000/api/courses/upload \
  -H "Content-Type: application/json" \
  -d '{"name":"B.A. Theatre Arts","categoryName":"Actor","universityName":"Sri Venkateswara University","duration":"3 years","amount":10000,"currency":"INR","chapters":1}'

# Bulk upload
curl -X POST http://localhost:3000/api/courses/bulk-upload \
  -H "Content-Type: application/json" \
  -d '[{"name":"Course 1",...},{"name":"Course 2",...}]'
```

## Technical Details

### Data Transformation

Input payload:

```javascript
{
  categoryName: "Actor",           // ← User provides name
  universityName: "MIT",           // ← User provides name
  ...other fields
}
```

System transforms to:

```javascript
{
  categoryId: ["65abc..."],        // ← System finds ID
  parentCategoryId: ["65xyz..."],  // ← System finds parent ID
  UniversityId: "65uni...",        // ← System finds ID
  ...other fields
}
```

### Fuzzy Matching Examples

| Input                 | Database                                     | Match? |
| --------------------- | -------------------------------------------- | ------ |
| `"Actor"`             | `"Actor"`                                    | ✅     |
| `"actor"`             | `"Actor"`                                    | ✅     |
| `"Act or"`            | `"Actor"`                                    | ✅     |
| `"Software Engineer"` | `"SoftwareEngineer"`                         | ✅     |
| `"sri venkateswara"`  | `collegeName: "Sri Venkateswara University"` | ✅     |

## Modified Files

1. ✅ `/src/app/modules/courses/services/course.ts`
2. ✅ `/src/app/modules/courses/controllers/course.ts`
3. ✅ `/src/app/modules/courses/routes/course.ts`

## New Files

1. ✅ `/COURSE_UPLOAD_GUIDE.md`
2. ✅ `/test-course-upload.js`
3. ✅ `/COURSE_UPLOAD_IMPLEMENTATION_SUMMARY.md`

## No Breaking Changes

- All existing routes and functionality remain unchanged
- New endpoints are additions only
- Backward compatible with existing course creation

## Next Steps

1. **Verify Categories**: Ensure all required categories exist in database
2. **Verify Universities**: Ensure universities exist with `role: "university"`
3. **Test**: Run the test script to verify functionality
4. **Deploy**: Deploy the changes to your environment
5. **Monitor**: Check logs for any issues with fuzzy matching

## Support

If a course is skipped:

1. Check the response `failed` array for the reason
2. Verify the category name exists in the database
3. Verify the university name exists with correct role
4. Check application logs for detailed error messages
5. Adjust the input names to match database entries more closely

## Performance Considerations

- Fuzzy matching loads all categories/universities into memory
- For large datasets (1000+ categories/universities), consider:
  - Caching category/university lookups
  - Using database-level fuzzy search (e.g., MongoDB text search)
  - Pre-processing/normalizing names in database

Current implementation is suitable for typical datasets (< 1000 entries).

