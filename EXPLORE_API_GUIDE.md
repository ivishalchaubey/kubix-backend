# Explore API Guide

## Overview

The Explore API allows users to browse Careers, Colleges, Courses, and Webinars with pagination support. The API filters results based on the user's selected categories and provides a unified endpoint with type-based filtering.

## Endpoints

### 1. Explore List

```
GET /api/v1/explore
```

### 2. Detail View

```
GET /api/v1/explore/detail
```

## Authentication

This endpoint requires authentication. Include a Bearer token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Query Parameters

| Parameter | Type   | Required | Default | Description                                                                 |
| --------- | ------ | -------- | ------- | --------------------------------------------------------------------------- |
| type      | string | Yes      | -       | Type of content to explore: `careers`, `colleges`, `courses`, or `webinars` |
| page      | number | No       | 1       | Page number for pagination                                                  |
| limit     | number | No       | 10      | Number of items per page (max: 100)                                         |
| search    | string | No       | -       | Search query to filter results based on type                                |

## Type-Based Responses

### 1. Careers (type=careers)

Returns only the siblings of the user's specifically selected categories.

**How it works:**

- Gets the user's selected categories (stored in `categoryIds` from user table)
- For each selected category, finds its siblings (categories with same parentId)
- Returns ONLY siblings of user's selected categories (excludes user's own selected categories)

**Important:** This returns siblings of ONLY the user's selected categories, not all categories.

**Search Fields:**

- `name` - Career name
- `description` - Career description

**Example Request:**

```bash
# Without search
curl -X GET 'http://localhost:5000/api/v1/explore?type=careers&page=1&limit=10' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'

# With search
curl -X GET 'http://localhost:5000/api/v1/explore?type=careers&page=1&limit=10&search=software' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

**Example Response:**

```json
{
  "success": true,
  "message": "Careers retrieved successfully",
  "data": [
    {
      "_id": "60d5ec49f1b2c72b8c8b4567",
      "name": "Software Engineer",
      "description": "Develops software applications",
      "image": "https://example.com/career-image.jpg",
      "parentId": "60d5ec49f1b2c72b8c8b4566",
      "isLeafNode": true,
      "core_skills": {
        "technical": ["JavaScript", "Python"],
        "soft": ["Communication", "Problem Solving"]
      },
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalPages": 3,
    "totalResults": 25,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "statusCode": 200
}
```

### 2. Colleges (type=colleges)

Returns all university/college users in the system.

**How it works:**

- Finds all users with role = "university"
- Returns their profile information (excluding sensitive data like passwords)

**Search Fields:**

- `firstName` - College first name
- `lastName` - College last name
- `collegeName` - Full college name
- `email` - College email
- `location` - College location

**Example Request:**

```bash
# Without search
curl -X GET 'http://localhost:5000/api/v1/explore?type=colleges&page=1&limit=10' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'

# With search
curl -X GET 'http://localhost:5000/api/v1/explore?type=colleges&page=1&limit=10&search=MIT' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

**Example Response:**

```json
{
  "success": true,
  "message": "Colleges retrieved successfully",
  "data": [
    {
      "_id": "60d5ec49f1b2c72b8c8b4567",
      "firstName": "MIT",
      "lastName": "University",
      "email": "info@mit.edu",
      "phoneNumber": "1234567890",
      "countryCode": "+1",
      "role": "university",
      "collegeName": "Massachusetts Institute of Technology",
      "location": "Cambridge, MA",
      "description": "Leading research university",
      "bannerYoutubeVideoLink": "https://youtube.com/watch?v=...",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalPages": 5,
    "totalResults": 48,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "statusCode": 200
}
```

### 3. Courses (type=courses)

Returns all courses relevant to the user's selected categories with populated categoryId.

**How it works:**

- Gets the user's selected categories (stored in `categoryIds`)
- Finds all courses that have at least one matching category
- Deduplicates courses (in case a course matches multiple user categories)
- Returns courses with university information, categoryId, and parentCategoryId populated

**Search Fields:**

- `name` - Course name
- `description` - Course description
- `duration` - Course duration

**Example Request:**

```bash
# Without search
curl -X GET 'http://localhost:5000/api/v1/explore?type=courses&page=1&limit=10' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'

# With search
curl -X GET 'http://localhost:5000/api/v1/explore?type=courses&page=1&limit=10&search=computer' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

**Example Response:**

```json
{
  "success": true,
  "message": "Courses retrieved successfully",
  "data": [
    {
      "_id": "60d5ec49f1b2c72b8c8b4567",
      "name": "Introduction to Computer Science",
      "description": "Learn the fundamentals of computer science",
      "image": "https://example.com/course-image.jpg",
      "duration": "12 weeks",
      "amount": 4999,
      "currency": "INR",
      "chapters": 10,
      "categoryId": [
        {
          "_id": "68d18fe81c39b017056add7a",
          "name": "Computer Science",
          "description": "Computer science career",
          "parentId": "60d5ec49f1b2c72b8c8b4565",
          "order": 3
        }
      ],
      "parentCategoryId": [
        {
          "_id": "60d5ec49f1b2c72b8c8b4565",
          "name": "Engineering",
          "description": "Engineering field",
          "order": 2
        }
      ],
      "UniversityId": {
        "_id": "60d5ec49f1b2c72b8c8b4564",
        "firstName": "MIT",
        "lastName": "University",
        "email": "info@mit.edu"
      },
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalPages": 8,
    "totalResults": 75,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "statusCode": 200
}
```

### 4. Webinars (type=webinars)

Returns published/live webinars with associated university details.

**How it works:**

- Fetches webinars with status `published` or `live`
- Populates `universityId` with college information
- Supports search across webinar metadata (title, description, tags, etc.)

**Search Fields:**

- `title`
- `description`
- `universityName`
- `courseDetails`
- `targetAudience`
- `speakerName`
- `tags`
- `domains`

**Example Request:**

```bash
# Without search
curl -X GET 'http://localhost:5000/api/v1/explore?type=webinars&page=1&limit=10' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'

# With search
curl -X GET 'http://localhost:5000/api/v1/explore?type=webinars&page=1&limit=10&search=technology' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

**Example Response:**

```json
{
  "success": true,
  "message": "Webinars retrieved successfully",
  "data": [
    {
      "_id": "60d5ec49f1b2c72b8c8b4568",
      "title": "Careers in Emerging Technologies",
      "description": "Discover opportunities in AI, ML, and Robotics",
      "courseDetails": "B.Tech CS / AI / Robotics",
      "targetAudience": "12th grade students",
      "tags": ["AI", "Robotics"],
      "domains": ["Technology"],
      "speakerName": "Dr. Jane Doe",
      "scheduledDate": "2025-01-15T10:00:00.000Z",
      "scheduledTime": "10:00 AM",
      "duration": 60,
      "status": "published",
      "universityId": {
        "_id": "60d5ec49f1b2c72b8c8b4564",
        "collegeName": "MIT",
        "email": "info@mit.edu",
        "location": "Cambridge, MA",
        "profileImage": "https://example.com/mit-logo.jpg"
      },
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalPages": 2,
    "totalResults": 12,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "statusCode": 200
}
```

## Response Structure

All responses follow this structure:

```typescript
{
  success: boolean;
  message: string;
  data: Array<any>;
  meta: {
    page: number;
    limit: number;
    totalPages: number;
    totalResults: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  }
  statusCode: number;
}
```

## Error Responses

### 400 Bad Request - Missing Type Parameter

```json
{
  "success": false,
  "message": "Type parameter is required. Valid types: careers, colleges, courses, webinars",
  "statusCode": 400
}
```

### 400 Bad Request - Invalid Type Parameter

```json
{
  "success": false,
  "message": "Invalid type parameter. Valid types: careers, colleges, courses, webinars",
  "statusCode": 400
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "message": "Unauthorized access",
  "statusCode": 401
}
```

### 404 Not Found - User Not Found

```json
{
  "success": false,
  "message": "User not found",
  "statusCode": 404
}
```

## Use Cases

### 1. Browse Related Careers

When a user selects categories, they can explore related career options:

```
GET /api/v1/explore?type=careers&page=1&limit=20
```

### 2. Discover Colleges

Users can browse all available colleges/universities:

```
GET /api/v1/explore?type=colleges&page=1&limit=15
```

### 3. Find Relevant Courses

Get personalized course recommendations based on selected categories:

```
GET /api/v1/explore?type=courses&page=1&limit=12
```

## Pagination Tips

1. **Default Page Size**: 10 items per page
2. **Maximum Page Size**: 100 items per page (enforced by PAGINATION.MAX_LIMIT)
3. **First Page**: Start at page 1, not 0
4. **Navigation**: Use `hasNextPage` and `hasPrevPage` to determine if more pages exist

## Search Functionality

The search parameter filters results based on the type:

### For Careers (type=careers):

- Searches in: `name`, `description`
- Case-insensitive partial matching
- Example: `search=software` will find careers with "Software Engineer", "Software Developer", etc.

### For Colleges (type=colleges):

- Searches in: `firstName`, `lastName`, `collegeName`, `email`, `location`
- Uses MongoDB regex for flexible matching
- Example: `search=MIT` will find colleges with MIT in any of the searchable fields

### For Courses (type=courses):

- Searches in: `name`, `description`, `duration`
- Case-insensitive partial matching
- Example: `search=programming` will find courses with "Programming", "Web Programming", etc.

### For Webinars (type=webinars):

- Searches in: `title`, `description`, `universityName`, `courseDetails`, `targetAudience`, `speakerName`, `tags`, `domains`
- Case-insensitive partial matching
- Example: `search=technology` will find webinars related to technology topics

**Usage Examples:**

```bash
# Search for software-related careers
GET /api/v1/explore?type=careers&search=software

# Search for colleges in a specific location
GET /api/v1/explore?type=colleges&search=california

# Search for programming courses
GET /api/v1/explore?type=courses&search=javascript
```

## Implementation Notes

1. **Careers**: Returns ONLY siblings of user's selected categories, helping discover related career paths to their specific choices
2. **Colleges**: Does not require user category selection - returns all universities
3. **Courses**: Returns courses that match any of the user's selected categories, with deduplication and all IDs populated (UniversityId, categoryId, parentCategoryId)
4. **Type Parameter**: Use lowercase (careers, colleges, courses, webinars) - the API automatically converts uppercase to lowercase

## Integration Example

```javascript
// React/Next.js example
async function fetchExploreData(type, page = 1, limit = 10) {
  const response = await fetch(
    `http://localhost:5000/api/v1/explore?type=${type}&page=${page}&limit=${limit}`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  const data = await response.json();
  return data;
}

// Usage
const careers = await fetchExploreData("Careers", 1, 20);
const colleges = await fetchExploreData("Colleges");
const courses = await fetchExploreData("Courses", 1, 15);
const webinars = await fetchExploreData("Webinars", 1, 10);
```

## Testing

Use the following curl commands to test the API:

```bash
# Test Careers (lowercase)
curl -X GET 'http://localhost:5000/api/v1/explore?type=careers&page=1&limit=5' \
  -H 'Authorization: Bearer YOUR_TOKEN'

# Test Colleges (lowercase)
curl -X GET 'http://localhost:5000/api/v1/explore?type=colleges&page=1&limit=5' \
  -H 'Authorization: Bearer YOUR_TOKEN'

# Test Courses (lowercase)
curl -X GET 'http://localhost:5000/api/v1/explore?type=courses&page=1&limit=5' \
  -H 'Authorization: Bearer YOUR_TOKEN'

# Test Webinars (lowercase)
curl -X GET 'http://localhost:5000/api/v1/explore?type=webinars&page=1&limit=5' \
  -H 'Authorization: Bearer YOUR_TOKEN'

# Test with Search
curl -X GET 'http://localhost:5000/api/v1/explore?type=careers&page=1&limit=5&search=engineer' \
  -H 'Authorization: Bearer YOUR_TOKEN'

curl -X GET 'http://localhost:5000/api/v1/explore?type=colleges&page=1&limit=5&search=MIT' \
  -H 'Authorization: Bearer YOUR_TOKEN'

curl -X GET 'http://localhost:5000/api/v1/explore?type=courses&page=1&limit=5&search=programming' \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

---

## Detail Endpoint

The detail endpoint returns comprehensive information about a specific item with all IDs populated.

### Endpoint

```
GET /api/v1/explore/detail
```

### Authentication

This endpoint requires authentication. Include a Bearer token in the Authorization header.

### Query Parameters

| Parameter | Type   | Required | Description                                          |
| --------- | ------ | -------- | ---------------------------------------------------- |
| type      | string | Yes      | Type of content: `careers`, `colleges`, or `courses` |
| id        | string | Yes      | MongoDB ObjectId of the item                         |

### Response Examples

#### Career Detail (type=careers)

**Request:**

```bash
curl -X GET 'http://localhost:5000/api/v1/explore/detail?type=careers&id=60d5ec49f1b2c72b8c8b4567'
```

**Response:**

```json
{
  "success": true,
  "message": "Career detail retrieved successfully",
  "data": {
    "_id": "60d5ec49f1b2c72b8c8b4567",
    "name": "Software Engineer",
    "description": "Develops software applications and systems",
    "image": "https://example.com/career-image.jpg",
    "parentId": {
      "_id": "60d5ec49f1b2c72b8c8b4566",
      "name": "Engineering",
      "description": "Engineering field"
    },
    "order": 3,
    "isLeafNode": true,
    "a_day_in_life": "Start day with standup meeting...",
    "core_skills": {
      "technical": ["JavaScript", "Python", "React"],
      "soft": ["Communication", "Problem Solving"]
    },
    "educational_path": {
      "ug_courses": ["Computer Science", "Software Engineering"],
      "pg_courses": ["Advanced Software Engineering", "Data Science"]
    },
    "salary_range": "3-8 LPA",
    "future_outlook": {
      "demand": "High",
      "reason": "Digital transformation and increased tech adoption"
    },
    "soft_skills": ["Teamwork", "Adaptability"],
    "checklist": ["Learn programming", "Build projects", "Get internship"],
    "education_10_2": "Science stream preferred",
    "education_graduation": "B.Tech/BE in Computer Science",
    "myth": "You need to be a math genius",
    "reality": "Problem-solving skills are more important",
    "pros": ["High salary", "Remote work options", "Creative work"],
    "cons": ["Long hours", "Constant learning required"],
    "superstar1": "Sundar Pichai",
    "superstar2": "Satya Nadella",
    "superstar3": "Tim Cook",
    "related_careers": ["Data Scientist", "DevOps Engineer"],
    "growth_path": "Junior → Senior → Tech Lead → Architect",
    "qualifying_exams": ["GATE", "JEE"],
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  "statusCode": 200
}
```

#### College Detail (type=colleges)

**Request:**

```bash
curl -X GET 'http://localhost:5000/api/v1/explore/detail?type=colleges&id=60d5ec49f1b2c72b8c8b4567'
```

**Response:**

```json
{
  "success": true,
  "message": "College detail retrieved successfully",
  "data": {
    "_id": "60d5ec49f1b2c72b8c8b4567",
    "firstName": "MIT",
    "lastName": "University",
    "email": "info@mit.edu",
    "phoneNumber": "1234567890",
    "countryCode": "+1",
    "role": "university",
    "collegeName": "Massachusetts Institute of Technology",
    "collegeCode": "MIT001",
    "location": "Cambridge, MA",
    "address": "77 Massachusetts Ave, Cambridge, MA 02139",
    "specialization": "Technology and Engineering",
    "description": "Leading research university focusing on science and technology",
    "status": "active",
    "bannerYoutubeVideoLink": "https://youtube.com/watch?v=...",
    "profileImage": "https://example.com/mit-logo.jpg",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  "statusCode": 200
}
```

#### Course Detail (type=courses)

**Request:**

```bash
curl -X GET 'http://localhost:5000/api/v1/explore/detail?type=courses&id=60d5ec49f1b2c72b8c8b4567'
```

**Response:**

```json
{
  "success": true,
  "message": "Course detail retrieved successfully",
  "data": {
    "_id": "60d5ec49f1b2c72b8c8b4567",
    "name": "Introduction to Computer Science",
    "description": "Learn the fundamentals of computer science and programming",
    "image": "https://example.com/course-image.jpg",
    "duration": "12 weeks",
    "amount": 4999,
    "currency": "INR",
    "chapters": 10,
    "categoryId": [
      {
        "_id": "68d18fe81c39b017056add7a",
        "name": "Computer Science",
        "description": "Computer science career path",
        "parentId": "60d5ec49f1b2c72b8c8b4565",
        "order": 3,
        "isLeafNode": true
      }
    ],
    "parentCategoryId": [
      {
        "_id": "60d5ec49f1b2c72b8c8b4565",
        "name": "Engineering",
        "description": "Engineering field",
        "order": 2
      }
    ],
    "UniversityId": {
      "_id": "60d5ec49f1b2c72b8c8b4564",
      "firstName": "MIT",
      "lastName": "University",
      "email": "info@mit.edu",
      "collegeName": "Massachusetts Institute of Technology",
      "location": "Cambridge, MA",
      "profileImage": "https://example.com/mit-logo.jpg"
    },
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  "statusCode": 200
}
```

#### Webinar Detail (type=webinars)

**Request:**

```bash
curl -X GET 'http://localhost:5000/api/v1/explore/detail?type=webinars&id=60d5ec49f1b2c72b8c8b4568'
```

**Response:**

```json
{
  "success": true,
  "message": "Webinar detail retrieved successfully",
  "data": {
    "_id": "60d5ec49f1b2c72b8c8b4568",
    "title": "Careers in Emerging Technologies",
    "description": "Discover opportunities in AI, ML, and Robotics",
    "courseDetails": "B.Tech CS / AI / Robotics",
    "targetAudience": "12th grade students",
    "tags": ["AI", "Robotics"],
    "domains": ["Technology"],
    "speakerName": "Dr. Jane Doe",
    "speakerBio": "Head of AI Research at MIT",
    "scheduledDate": "2025-01-15T10:00:00.000Z",
    "scheduledTime": "10:00 AM",
    "duration": 60,
    "status": "published",
    "webinarLink": "https://example.com/webinar-link",
    "pocName": "John Smith",
    "pocEmail": "john.smith@mit.edu",
    "pocPhone": "+1-555-123-4567",
    "universityId": {
      "_id": "60d5ec49f1b2c72b8c8b4564",
      "collegeName": "MIT",
      "email": "info@mit.edu",
      "location": "Cambridge, MA",
      "profileImage": "https://example.com/mit-logo.jpg",
      "bannerYoutubeVideoLink": "https://youtube.com/watch?v=..."
    },
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  "statusCode": 200
}
```

### Error Responses for Detail Endpoint

#### 400 Bad Request - Missing Type

```json
{
  "success": false,
  "message": "Type parameter is required. Valid types: careers, colleges, courses, webinars",
  "statusCode": 400
}
```

#### 400 Bad Request - Missing ID

```json
{
  "success": false,
  "message": "ID parameter is required",
  "statusCode": 400
}
```

#### 400 Bad Request - Invalid ID Format

```json
{
  "success": false,
  "message": "Invalid career ID",
  "statusCode": 400
}
```

#### 404 Not Found - Item Not Found

```json
{
  "success": false,
  "message": "Career not found",
  "statusCode": 404
}
```

### Detail Endpoint Testing

```bash
# Get career detail
curl -X GET 'http://localhost:5000/api/v1/explore/detail?type=careers&id=YOUR_CAREER_ID'

# Get college detail
curl -X GET 'http://localhost:5000/api/v1/explore/detail?type=colleges&id=YOUR_COLLEGE_ID'

# Get course detail
curl -X GET 'http://localhost:5000/api/v1/explore/detail?type=courses&id=YOUR_COURSE_ID'

# Get webinar detail
curl -X GET 'http://localhost:5000/api/v1/explore/detail?type=webinars&id=YOUR_WEBINAR_ID'
```
