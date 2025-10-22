# Course Upload API - Quick Examples

## Simple Single Course Upload

### Example 1: Basic Course Upload

```bash
curl -X POST http://localhost:5001/api/v1/courses/upload \
  -H "Content-Type: application/json" \
  -d '{
    "name": "B.A. Theatre Arts",
    "categoryName": "Actor",
    "description": "Performs characters in theatre, films, television shows through voice, movement and expressions to entertain audiences.",
    "duration": "3 years",
    "universityName": "Sri Venkateswara University",
    "amount": 10000,
    "currency": "INR",
    "chapters": 1
  }'
```

### Example 2: Course with Different Formatting

```bash
curl -X POST http://localhost:5001/api/v1/courses/upload \
  -H "Content-Type: application/json" \
  -d '{
    "name": "B.Tech Computer Science",
    "categoryName": "software engineer",
    "description": "Bachelor of Technology in Computer Science",
    "duration": "4 years",
    "universityName": "MIT",
    "amount": 50000,
    "currency": "INR",
    "chapters": 8
  }'
```

### Example 3: Course with Partial Names

```bash
curl -X POST http://localhost:5001/api/v1/courses/upload \
  -H "Content-Type: application/json" \
  -d '{
    "name": "MBA Finance",
    "categoryName": "Finance",
    "description": "Master of Business Administration",
    "duration": "2 years",
    "universityName": "Harvard",
    "amount": 75000,
    "currency": "INR",
    "chapters": 6
  }'
```

## Bulk Upload Examples

### Example 1: Upload Multiple Courses

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
      "amount": 10000,
      "currency": "INR",
      "chapters": 1
    },
    {
      "name": "B.Tech Computer Science",
      "categoryName": "Software Engineer",
      "description": "Software development and engineering",
      "duration": "4 years",
      "universityName": "MIT",
      "amount": 50000,
      "currency": "INR",
      "chapters": 8
    },
    {
      "name": "MBA Finance",
      "categoryName": "Finance Manager",
      "description": "Business administration with finance focus",
      "duration": "2 years",
      "universityName": "Harvard University",
      "amount": 75000,
      "currency": "INR",
      "chapters": 6
    }
  ]'
```

## JavaScript/Node.js Examples

### Example 1: Using Fetch API

```javascript
const courseData = {
  name: "B.A. Theatre Arts",
  categoryName: "Actor",
  description: "Performs characters in theatre",
  duration: "3 years",
  universityName: "Sri Venkateswara University",
  amount: 10000,
  currency: "INR",
  chapters: 1,
};

const response = await fetch("http://localhost:5001/api/v1/courses/upload", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(courseData),
});

const result = await response.json();
console.log(result);
```

### Example 2: Bulk Upload with Fetch

```javascript
const courses = [
  {
    name: "Course 1",
    categoryName: "Category 1",
    universityName: "University 1",
    duration: "3 years",
    amount: 10000,
    currency: "INR",
    chapters: 1,
  },
  {
    name: "Course 2",
    categoryName: "Category 2",
    universityName: "University 2",
    duration: "4 years",
    amount: 20000,
    currency: "INR",
    chapters: 2,
  },
];

const response = await fetch("http://localhost:5001/api/v1/courses/bulk-upload", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(courses),
});

const result = await response.json();
console.log(
  `Success: ${result.data.successCount}, Failed: ${result.data.failCount}`
);
```

### Example 3: Error Handling

```javascript
async function uploadCourse(courseData) {
  try {
    const response = await fetch("http://localhost:5001/api/v1/courses/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(courseData),
    });

    const result = await response.json();

    if (response.ok && result.success) {
      console.log("✅ Course uploaded:", result.data.name);
      return result.data;
    } else {
      console.error("❌ Upload failed:", result.message);
      return null;
    }
  } catch (error) {
    console.error("❌ Network error:", error.message);
    return null;
  }
}

// Usage
const course = {
  name: "B.A. Theatre Arts",
  categoryName: "Actor",
  universityName: "Sri Venkateswara University",
  duration: "3 years",
  amount: 10000,
  currency: "INR",
  chapters: 1,
};

uploadCourse(course);
```

## Python Examples

### Example 1: Using Requests Library

```python
import requests
import json

url = "http://localhost:5001/api/v1/courses/upload"
headers = {"Content-Type": "application/json"}

course_data = {
    "name": "B.A. Theatre Arts",
    "categoryName": "Actor",
    "description": "Theatre and performing arts",
    "duration": "3 years",
    "universityName": "Sri Venkateswara University",
    "amount": 10000,
    "currency": "INR",
    "chapters": 1
}

response = requests.post(url, headers=headers, json=course_data)
result = response.json()

if response.status_code == 201:
    print(f"✅ Course uploaded: {result['data']['name']}")
else:
    print(f"❌ Upload failed: {result['message']}")
```

### Example 2: Bulk Upload in Python

```python
import requests

url = "http://localhost:5001/api/v1/courses/bulk-upload"
headers = {"Content-Type": "application/json"}

courses = [
    {
        "name": "Course 1",
        "categoryName": "Category 1",
        "universityName": "University 1",
        "duration": "3 years",
        "amount": 10000,
        "currency": "INR",
        "chapters": 1
    },
    {
        "name": "Course 2",
        "categoryName": "Category 2",
        "universityName": "University 2",
        "duration": "4 years",
        "amount": 20000,
        "currency": "INR",
        "chapters": 2
    }
]

response = requests.post(url, headers=headers, json=courses)
result = response.json()

print(f"Total: {result['data']['totalProcessed']}")
print(f"✅ Success: {result['data']['successCount']}")
print(f"❌ Failed: {result['data']['failCount']}")

# Print failed courses
for failed in result['data']['failed']:
    print(f"  - {failed['courseName']}: {failed['message']}")
```

## Postman Collection

### Single Upload Request

1. **Method**: POST
2. **URL**: `http://localhost:5001/api/v1/courses/upload`
3. **Headers**:
   ```
   Content-Type: application/json
   ```
4. **Body** (raw JSON):
   ```json
   {
     "name": "B.A. Theatre Arts",
     "categoryName": "Actor",
     "description": "Performs characters in theatre",
     "duration": "3 years",
     "universityName": "Sri Venkateswara University",
     "amount": 10000,
     "currency": "INR",
     "chapters": 1
   }
   ```

### Bulk Upload Request

1. **Method**: POST
2. **URL**: `http://localhost:5001/api/v1/courses/bulk-upload`
3. **Headers**:
   ```
   Content-Type: application/json
   ```
4. **Body** (raw JSON):
   ```json
   [
     {
       "name": "Course 1",
       "categoryName": "Category 1",
       "universityName": "University 1",
       "duration": "3 years",
       "amount": 10000,
       "currency": "INR",
       "chapters": 1
     },
     {
       "name": "Course 2",
       "categoryName": "Category 2",
       "universityName": "University 2",
       "duration": "4 years",
       "amount": 20000,
       "currency": "INR",
       "chapters": 2
     }
   ]
   ```

## Response Examples

### Successful Single Upload

```json
{
  "success": true,
  "message": "Course created successfully",
  "statusCode": 201,
  "data": {
    "_id": "65abc123def456...",
    "name": "B.A. Theatre Arts",
    "categoryId": ["65category123..."],
    "parentCategoryId": ["65parent456..."],
    "description": "Performs characters in theatre...",
    "image": "",
    "duration": "3 years",
    "UniversityId": "65university789...",
    "amount": 10000,
    "currency": "INR",
    "chapters": 1,
    "createdAt": "2025-10-08T10:30:00.000Z",
    "updatedAt": "2025-10-08T10:30:00.000Z"
  }
}
```

### Failed Single Upload (Category Not Found)

```json
{
  "success": false,
  "message": "Category 'InvalidCategory' not found. Course skipped.",
  "statusCode": 400
}
```

### Successful Bulk Upload

```json
{
  "success": true,
  "message": "Bulk upload completed. Success: 3, Failed: 0",
  "statusCode": 200,
  "data": {
    "successful": [
      {
        "success": true,
        "message": "Course created successfully",
        "course": {
          /* course 1 data */
        }
      },
      {
        "success": true,
        "message": "Course created successfully",
        "course": {
          /* course 2 data */
        }
      },
      {
        "success": true,
        "message": "Course created successfully",
        "course": {
          /* course 3 data */
        }
      }
    ],
    "failed": [],
    "totalProcessed": 3,
    "successCount": 3,
    "failCount": 0
  }
}
```

### Partial Success Bulk Upload

```json
{
  "success": true,
  "message": "Bulk upload completed. Success: 2, Failed: 1",
  "statusCode": 200,
  "data": {
    "successful": [
      {
        "success": true,
        "message": "Course created successfully",
        "course": {
          /* course 1 data */
        }
      },
      {
        "success": true,
        "message": "Course created successfully",
        "course": {
          /* course 2 data */
        }
      }
    ],
    "failed": [
      {
        "success": false,
        "message": "University 'InvalidUniversity' not found. Course skipped.",
        "courseName": "Failed Course Name"
      }
    ],
    "totalProcessed": 3,
    "successCount": 2,
    "failCount": 1
  }
}
```

## Common Pitfalls and Solutions

### 1. Category Not Found

**Problem**: `"Category 'XYZ' not found"`

**Solution**:

- Check the exact category name in your database
- Use fuzzy matching variations (lowercase, without spaces)
- Verify the category exists before uploading

### 2. University Not Found

**Problem**: `"University 'ABC' not found"`

**Solution**:

- Ensure the university exists in the User table
- Verify the user has `role: "university"`
- Check `firstName`, `lastName`, or `collegeName` fields
- Try using the college name instead of university name

### 3. Amount Format

**Problem**: Amount not saving correctly

**Solution**:

- Send amount as a number: `10000` (not `"10000"` or `"₹10,000"`)
- Don't include currency symbols in the amount field
- Use the separate `currency` field for currency code

### 4. Invalid Request Format

**Problem**: `"Request body must be a non-empty array"`

**Solution**:

- For single upload, use `/upload` endpoint with object
- For bulk upload, use `/bulk-upload` endpoint with array
- Ensure proper JSON formatting

## Tips for Best Results

1. **Use Exact Names**: Start with exact category/university names
2. **Test Single First**: Test single upload before bulk upload
3. **Check Response**: Review the response to understand failures
4. **Verify Prerequisites**: Ensure categories and universities exist
5. **Use Fuzzy Matching**: Leverage fuzzy matching for variations
6. **Monitor Logs**: Check server logs for detailed error information

