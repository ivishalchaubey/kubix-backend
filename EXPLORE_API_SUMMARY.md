# Explore API - Complete Implementation Summary

## Overview

Two endpoints have been created for the Explore feature:

1. **List Endpoint** - Browse and search careers, colleges, and courses with pagination
2. **Detail Endpoint** - Get detailed information about a specific item with all IDs populated

---

## 1. List Endpoint

### Endpoint

```
GET /api/v1/explore
```

### Authentication

Required - Bearer token in Authorization header

### Query Parameters

| Parameter | Type   | Required | Default | Description                                     |
| --------- | ------ | -------- | ------- | ----------------------------------------------- |
| type      | string | Yes      | -       | `careers`, `colleges`, or `courses` (lowercase) |
| page      | number | No       | 1       | Page number                                     |
| limit     | number | No       | 10      | Items per page (max 100)                        |
| search    | string | No       | -       | Search query to filter results                  |

### Type: Careers

- Returns **siblings only** of user's selected categories
- Populated fields: Full category objects
- Search fields: `name`, `description`
- Example: `GET /api/v1/explore?type=careers&page=1&limit=10&search=engineer`

### Type: Colleges

- Returns all university users
- Search fields: `firstName`, `lastName`, `collegeName`, `email`, `location`
- Example: `GET /api/v1/explore?type=colleges&page=1&limit=10&search=MIT`

### Type: Courses

- Returns courses matching user's selected categories
- **Populated fields:** `UniversityId`, `categoryId`, `parentCategoryId`
- Search fields: `name`, `description`, `duration`
- Example: `GET /api/v1/explore?type=courses&page=1&limit=10&search=programming`

### Response Structure

```json
{
  "success": true,
  "message": "Courses retrieved successfully",
  "data": [...],
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

---

## 2. Detail Endpoint

### Endpoint

```
GET /api/v1/explore/detail
```

### Authentication

Not required (public endpoint)

### Query Parameters

| Parameter | Type   | Required | Description                         |
| --------- | ------ | -------- | ----------------------------------- |
| type      | string | Yes      | `careers`, `colleges`, or `courses` |
| id        | string | Yes      | MongoDB ObjectId of the item        |

### Populated Fields by Type

#### Careers (type=careers)

- `parentId` - Full parent category object

#### Colleges (type=colleges)

- No population needed (returns full user object)
- Excludes: `password`, `refreshToken`, `accessToken`, `otp`, `otpExpires`

#### Courses (type=courses)

- `UniversityId` - Full university object
- `categoryId` - Array of full category objects
- `parentCategoryId` - Array of full parent category objects

### Example Requests

```bash
# Career detail
curl 'http://localhost:5000/api/v1/explore/detail?type=careers&id=60d5ec49f1b2c72b8c8b4567'

# College detail
curl 'http://localhost:5000/api/v1/explore/detail?type=colleges&id=60d5ec49f1b2c72b8c8b4568'

# Course detail with all IDs populated
curl 'http://localhost:5000/api/v1/explore/detail?type=courses&id=60d5ec49f1b2c72b8c8b4569'
```

### Response Structure

```json
{
  "success": true,
  "message": "Course detail retrieved successfully",
  "data": {
    "_id": "...",
    "name": "Introduction to Computer Science",
    "categoryId": [
      {
        "_id": "68d18fe81c39b017056add7a",
        "name": "Computer Science",
        "description": "..."
      }
    ],
    "parentCategoryId": [
      {
        "_id": "60d5ec49f1b2c72b8c8b4565",
        "name": "Engineering",
        "description": "..."
      }
    ],
    "UniversityId": {
      "_id": "60d5ec49f1b2c72b8c8b4564",
      "firstName": "MIT",
      "collegeName": "Massachusetts Institute of Technology"
    }
  },
  "statusCode": 200
}
```

---

## File Structure

```
src/app/modules/explore/
├── repositories/
│   └── exploreRepository.ts    # Database queries with population
├── services/
│   └── exploreService.ts       # Business logic
├── controllers/
│   └── exploreController.ts    # Request handling
└── routes/
    └── exploreRoutes.ts        # Route definitions
```

---

## Key Features

✅ **Type-based filtering** - Single endpoint for careers, colleges, courses  
✅ **Pagination** - Efficient data loading with meta information  
✅ **Search functionality** - Type-specific search across relevant fields  
✅ **Lowercase type handling** - Automatic conversion to lowercase  
✅ **Full population** - All ObjectIds populated with complete data  
✅ **Clean code** - Simple, easy to understand and debug  
✅ **Error handling** - Proper validation and error messages

---

## Integration Routes

Both endpoints are available at:

```
/api/v1/explore         - List with pagination and search
/api/v1/explore/detail  - Detail view with all IDs populated
```

Registered in `src/app.ts`:

```typescript
app.use("/api/v1/explore", exploreRouter);
```

---

## Testing Commands

```bash
# List endpoints
curl 'http://localhost:5000/api/v1/explore?type=careers&page=1&limit=5' \
  -H 'Authorization: Bearer YOUR_TOKEN'

curl 'http://localhost:5000/api/v1/explore?type=colleges&search=MIT' \
  -H 'Authorization: Bearer YOUR_TOKEN'

curl 'http://localhost:5000/api/v1/explore?type=courses&search=programming' \
  -H 'Authorization: Bearer YOUR_TOKEN'

# Detail endpoints
curl 'http://localhost:5000/api/v1/explore/detail?type=careers&id=YOUR_ID'
curl 'http://localhost:5000/api/v1/explore/detail?type=colleges&id=YOUR_ID'
curl 'http://localhost:5000/api/v1/explore/detail?type=courses&id=YOUR_ID'
```

---

## Documentation

- **Full API Documentation:** `EXPLORE_API_GUIDE.md`
- **Quick Summary:** This file

---

## Notes

1. **Careers** - Only shows siblings of user's selected categories (not all categories)
2. **List endpoint** - Requires authentication
3. **Detail endpoint** - Public (no authentication required)
4. **All IDs** - Fully populated in both list and detail views
5. **Search** - Case-insensitive, works on multiple fields per type
