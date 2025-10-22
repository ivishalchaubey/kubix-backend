# Course Upload API Guide

This guide explains how to use the new course upload endpoints with fuzzy matching for category and university names.

## Features

✅ **Fuzzy Matching**: Automatically finds category and university IDs by name with intelligent matching
✅ **Error Handling**: Skips courses with invalid category or university names
✅ **Bulk Upload**: Upload multiple courses at once
✅ **Flexible Name Matching**: Handles spaces, commas, and case variations

## Endpoints

### 1. Upload Single Course

**POST** `/api/courses/upload`

Uploads a single course with fuzzy matching for category and university names.

#### Request Body

```json
{
  "name": "B.A. Theatre Arts",
  "categoryName": "Actor",
  "description": "Performs characters in theatre, films, television shows through voice, movement and expressions to entertain audiences.",
  "duration": "3 years",
  "universityName": "Sri Venkateswara University",
  "amount": "10000",
  "currency": "INR",
  "chapters": 1
}
```

#### Field Descriptions

- `name` (required): Course name
- `categoryName` (required): Category name (will be fuzzy matched to find category ID)
- `universityName` (required): University name (will be fuzzy matched to find university ID from User table with role='university')
- `description` (optional): Course description
- `duration` (optional): Course duration
- `amount` (optional): Course fee amount
- `currency` (optional): Currency code (default: INR)
- `chapters` (optional): Number of chapters

#### Success Response

```json
{
  "success": true,
  "message": "Course created successfully",
  "data": {
    "_id": "65abc123...",
    "name": "B.A. Theatre Arts",
    "categoryId": ["65xyz789..."],
    "parentCategoryId": ["65parent..."],
    "UniversityId": "65uni456...",
    "description": "Performs characters...",
    "duration": "3 years",
    "amount": 10000,
    "currency": "INR",
    "chapters": 1,
    "createdAt": "2025-01-08T...",
    "updatedAt": "2025-01-08T..."
  }
}
```

#### Error Response (Category/University Not Found)

```json
{
  "success": false,
  "message": "Category 'Actor' not found. Course skipped."
}
```

---

### 2. Bulk Upload Courses

**POST** `/api/courses/bulk-upload`

Upload multiple courses at once. Returns detailed results showing which courses succeeded and which failed.

#### Request Body (Array)

```json
[
  {
    "name": "B.A. Theatre Arts",
    "categoryName": "Actor",
    "description": "Performs characters in theatre...",
    "duration": "3 years",
    "universityName": "Sri Venkateswara University",
    "amount": "10000",
    "currency": "INR",
    "chapters": 1
  },
  {
    "name": "B.Tech Computer Science",
    "categoryName": "Software Engineer",
    "description": "Software engineering and development...",
    "duration": "4 years",
    "universityName": "MIT",
    "amount": "50000",
    "currency": "INR",
    "chapters": 8
  }
]
```

#### Success Response

```json
{
  "success": true,
  "message": "Bulk upload completed. Success: 2, Failed: 0",
  "data": {
    "successful": [
      {
        "success": true,
        "message": "Course created successfully",
        "course": { ... }
      },
      {
        "success": true,
        "message": "Course created successfully",
        "course": { ... }
      }
    ],
    "failed": [],
    "totalProcessed": 2,
    "successCount": 2,
    "failCount": 0
  }
}
```

#### Partial Success Response (Some Failed)

```json
{
  "success": true,
  "message": "Bulk upload completed. Success: 1, Failed: 1",
  "data": {
    "successful": [
      {
        "success": true,
        "message": "Course created successfully",
        "course": { ... }
      }
    ],
    "failed": [
      {
        "success": false,
        "message": "University 'Invalid University' not found. Course skipped.",
        "courseName": "B.Tech Computer Science"
      }
    ],
    "totalProcessed": 2,
    "successCount": 1,
    "failCount": 1
  }
}
```

---

## Fuzzy Matching Logic

The system uses intelligent fuzzy matching to find categories and universities by name.

### How it Works

1. **Exact Match First**: Tries to find an exact match (case-insensitive)
2. **Normalization**: Removes extra spaces, commas, and converts to lowercase
3. **Partial Matching**: Checks if normalized names contain each other

### Examples of Fuzzy Matching

#### Category Matching

| Input Name            | Database Name         | Match? | Reason                                |
| --------------------- | --------------------- | ------ | ------------------------------------- |
| `"Actor"`             | `"Actor"`             | ✅     | Exact match                           |
| `"actor"`             | `"Actor"`             | ✅     | Case-insensitive                      |
| `"Actor "`            | `"Actor"`             | ✅     | Trailing space removed                |
| `"Act or"`            | `"Actor"`             | ✅     | Space removed (normalized to "actor") |
| `"Theatre Actor"`     | `"Actor"`             | ✅     | Contains "actor"                      |
| `"Software Engineer"` | `"Software Engineer"` | ✅     | Exact match                           |
| `"SoftwareEngineer"`  | `"Software Engineer"` | ✅     | Normalized matching                   |

#### University Matching

The system checks:

- `firstName`
- `lastName`
- `collegeName`
- Combined `firstName + lastName`

| Input Name                      | DB Fields                                    | Match? | Reason        |
| ------------------------------- | -------------------------------------------- | ------ | ------------- |
| `"Sri Venkateswara University"` | `collegeName: "Sri Venkateswara University"` | ✅     | Exact match   |
| `"sri venkateswara"`            | `collegeName: "Sri Venkateswara University"` | ✅     | Partial match |
| `"MIT"`                         | `collegeName: "MIT"`                         | ✅     | Exact match   |
| `"Harvard University"`          | `collegeName: "Harvard"`                     | ✅     | Contains      |

---

## Important Notes

### 1. University Requirements

- Universities must exist in the `User` table with `role: "university"`
- The matching checks: `firstName`, `lastName`, `collegeName`
- Create universities first before uploading courses

### 2. Category Requirements

- Categories must exist in the `Category` collection
- The system will automatically find the parent category if available
- Create categories first before uploading courses

### 3. Skip Behavior

If a category or university is not found:

- **Single Upload**: Returns error response with details
- **Bulk Upload**: Skips that course and continues with others

### 4. Parent Category

The system automatically determines the parent category:

- If the category has a `parentId`, it uses that
- Otherwise, uses the category itself as the parent

---

## Testing Examples

### cURL Examples

#### Single Course Upload

```bash
curl -X POST http://localhost:5001/api/v1/courses/upload \
  -H "Content-Type: application/json" \
  -d '{
    "name": "B.A. Theatre Arts",
    "categoryName": "Actor",
    "description": "Performs characters in theatre",
    "duration": "3 years",
    "universityName": "Sri Venkateswara University",
    "amount": "10000",
    "currency": "INR",
    "chapters": 1
  }'
```

#### Bulk Upload

```bash
curl -X POST http://localhost:5001/api/v1/courses/bulk-upload \
  -H "Content-Type: application/json" \
  -d '[
    {
      "name": "B.A. Theatre Arts",
      "categoryName": "Actor",
      "description": "Theatre and performing arts",
      "duration": "3 years",
      "universityName": "Sri Venkateswara University",
      "amount": "10000",
      "currency": "INR",
      "chapters": 1
    },
    {
      "name": "B.Tech Computer Science",
      "categoryName": "Software Engineer",
      "description": "Software development",
      "duration": "4 years",
      "universityName": "MIT",
      "amount": "50000",
      "currency": "INR",
      "chapters": 8
    }
  ]'
```

### Postman

1. **Method**: POST
2. **URL**: `http://localhost:5001/api/v1/courses/upload`
3. **Headers**:
   - `Content-Type: application/json`
4. **Body** (raw JSON): Use the JSON examples above

---

## Error Handling

### Common Errors

1. **Missing Required Fields**

   ```json
   {
     "success": false,
     "message": "Missing required fields: name, categoryName, or universityName"
   }
   ```

2. **Category Not Found**

   ```json
   {
     "success": false,
     "message": "Category 'InvalidCategory' not found. Course skipped.",
     "courseName": "B.A. Theatre Arts"
   }
   ```

3. **University Not Found**

   ```json
   {
     "success": false,
     "message": "University 'InvalidUniversity' not found. Course skipped.",
     "courseName": "B.A. Theatre Arts"
   }
   ```

4. **Invalid Bulk Upload Format**
   ```json
   {
     "success": false,
     "message": "Request body must be a non-empty array of courses"
   }
   ```

---

## Best Practices

1. **Verify Data First**

   - Ensure categories exist in the database
   - Ensure universities exist with `role: "university"`
   - Use consistent naming

2. **Use Bulk Upload for Large Datasets**

   - More efficient than individual uploads
   - Provides detailed summary of results
   - Continues processing even if some fail

3. **Review Failed Uploads**

   - Check the `failed` array in bulk upload response
   - Correct category/university names
   - Re-upload failed courses

4. **Amount Format**

   - Send amount as a number (e.g., `10000`)
   - Don't include currency symbols in the amount field

5. **Name Consistency**
   - Use the same naming convention as in your database
   - The fuzzy matching will handle minor variations

---

## Logs

The system logs all upload operations:

```
✅ Course created successfully: B.A. Theatre Arts
⚠️  Category not found for name: InvalidCategory. Skipping course: Test Course
⚠️  University not found for name: InvalidUniversity. Skipping course: Test Course
```

Check your application logs for detailed information about upload operations.

