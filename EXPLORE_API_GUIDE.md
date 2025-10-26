# Explore API Guide

## Overview

The Explore API allows users to browse Careers, Colleges, and Courses with pagination support. The API filters results based on the user's selected categories and provides a unified endpoint with type-based filtering.

## Endpoint

```
GET /api/v1/explore
```

## Authentication

This endpoint requires authentication. Include a Bearer token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Query Parameters

| Parameter | Type   | Required | Default | Description                                                     |
| --------- | ------ | -------- | ------- | --------------------------------------------------------------- |
| type      | string | Yes      | -       | Type of content to explore: `careers`, `colleges`, or `courses` |
| page      | number | No       | 1       | Page number for pagination                                      |
| limit     | number | No       | 10      | Number of items per page (max: 100)                             |
| search    | string | No       | -       | Search query to filter results based on type                    |

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
- Returns courses with university information and categoryId populated

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
      "parentCategoryId": ["60d5ec49f1b2c72b8c8b4565"],
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
  "message": "Type parameter is required. Valid types: careers, colleges, courses",
  "statusCode": 400
}
```

### 400 Bad Request - Invalid Type Parameter

```json
{
  "success": false,
  "message": "Invalid type parameter. Valid types: careers, colleges, courses",
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
3. **Courses**: Returns courses that match any of the user's selected categories, with deduplication and populated categoryId
4. **Type Parameter**: Use lowercase (careers, colleges, courses) - the API automatically converts uppercase to lowercase

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

# Test with Search
curl -X GET 'http://localhost:5000/api/v1/explore?type=careers&page=1&limit=5&search=engineer' \
  -H 'Authorization: Bearer YOUR_TOKEN'

curl -X GET 'http://localhost:5000/api/v1/explore?type=colleges&page=1&limit=5&search=MIT' \
  -H 'Authorization: Bearer YOUR_TOKEN'

curl -X GET 'http://localhost:5000/api/v1/explore?type=courses&page=1&limit=5&search=programming' \
  -H 'Authorization: Bearer YOUR_TOKEN'
```
