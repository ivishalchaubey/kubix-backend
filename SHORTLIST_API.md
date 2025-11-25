# Shortlist API Documentation

Complete API documentation for the Shortlist module. All endpoints require authentication via Bearer token.

**Base URL:** `/api/v1/shortlist`

**Authentication:** All endpoints require `Authorization: Bearer <token>` header

---

## 📋 Table of Contents

1. [Create/Toggle Shortlist](#1-createtoggle-shortlist)
2. [Get All Shortlisted Items](#2-get-all-shortlisted-items)
3. [Get Shortlist by ID](#3-get-shortlist-by-id)
4. [Check if Item is Shortlisted](#4-check-if-item-is-shortlisted)
5. [Delete Shortlist](#5-delete-shortlist)
6. [Type Mappings](#type-mappings)
7. [Error Responses](#error-responses)

---

## 1. Create/Toggle Shortlist

Add or remove an item from shortlist. This endpoint acts as a toggle - if the item is already shortlisted, it will be removed.

**Endpoint:** `POST /api/v1/shortlist`

**Headers:**

```
Authorization: Bearer <your-token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "id": "item_id_here",
  "type": "career" | "colleges" | "course"
}
```

**Request Body Parameters:**

- `id` (string, required): The ID of the item to shortlist
- `type` (string, required): The type of item
  - `"career"` - For Categories
  - `"colleges"` - For Universities
  - `"course"` - For Courses

**Example Request:**

```bash
curl -X POST http://localhost:3000/api/v1/shortlist \
  -H "Authorization: Bearer your-token-here" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "507f1f77bcf86cd799439011",
    "type": "career"
  }'
```

**Success Response (Item Added):** `201 Created`

```json
{
  "success": true,
  "message": "Item shortlisted successfully",
  "data": {
    "shortlisted": true,
    "action": "added",
    "shortlist": {
      "_id": "507f1f77bcf86cd799439012",
      "userId": "507f1f77bcf86cd799439013",
      "itemId": "507f1f77bcf86cd799439011",
      "itemType": "career",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  },
  "statusCode": 201
}
```

**Success Response (Item Removed):** `200 OK`

```json
{
  "success": true,
  "message": "Item removed from shortlist successfully",
  "data": {
    "shortlisted": false,
    "action": "removed"
  },
  "statusCode": 200
}
```

**Error Responses:**

- `400 Bad Request` - Invalid input data
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Access denied
- `404 Not Found` - Item not found (Category/University/Course)

---

## 2. Get All Shortlisted Items

Retrieve all shortlisted items for the authenticated user with optional filtering and pagination.

**Endpoint:** `GET /api/v1/shortlist`

**Headers:**

```
Authorization: Bearer <your-token>
```

**Query Parameters:**

- `type` (string, optional): Filter by item type (`career`, `colleges`, `course`)
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10, max: 100)

**Example Requests:**

```bash
# Get all shortlisted items
curl -X GET "http://localhost:3000/api/v1/shortlist?page=1&limit=10" \
  -H "Authorization: Bearer your-token-here"

# Get only shortlisted courses
curl -X GET "http://localhost:3000/api/v1/shortlist?type=course&page=1&limit=20" \
  -H "Authorization: Bearer your-token-here"

# Get only shortlisted careers
curl -X GET "http://localhost:3000/api/v1/shortlist?type=career" \
  -H "Authorization: Bearer your-token-here"
```

**Success Response:** `200 OK`

```json
{
  "success": true,
  "message": "Shortlisted items fetched successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "itemType": "career",
      "item": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "Software Engineering",
        "description": "...",
        "image": "...",
        ...
      },
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439014",
      "itemType": "course",
      "item": {
        "_id": "507f1f77bcf86cd799439015",
        "name": "Computer Science",
        "UniversityId": { ... },
        "categoryId": [ ... ],
        ...
      },
      "createdAt": "2024-01-15T11:00:00.000Z",
      "updatedAt": "2024-01-15T11:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalResults": 25,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "statusCode": 200
}
```

**Error Responses:**

- `400 Bad Request` - Invalid pagination parameters or item type
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Access denied

---

## 3. Get Shortlist by ID

Get a specific shortlisted item by its shortlist ID.

**Endpoint:** `GET /api/v1/shortlist/:id`

**Headers:**

```
Authorization: Bearer <your-token>
```

**Path Parameters:**

- `id` (string, required): The shortlist ID

**Example Request:**

```bash
curl -X GET "http://localhost:3000/api/v1/shortlist/507f1f77bcf86cd799439012" \
  -H "Authorization: Bearer your-token-here"
```

**Success Response:** `200 OK`

```json
{
  "success": true,
  "message": "Shortlist item fetched successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "itemType": "career",
    "item": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Software Engineering",
      "description": "...",
      ...
    },
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "statusCode": 200
}
```

**Error Responses:**

- `400 Bad Request` - Invalid shortlist ID
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Access denied
- `404 Not Found` - Shortlist item not found

---

## 4. Check if Item is Shortlisted

Check if a specific item is currently shortlisted by the user.

**Endpoint:** `GET /api/v1/shortlist/check`

**Headers:**

```
Authorization: Bearer <your-token>
```

**Query Parameters:**

- `id` (string, required): The item ID to check
- `type` (string, required): The item type (`career`, `colleges`, `course`)

**Example Request:**

```bash
curl -X GET "http://localhost:3000/api/v1/shortlist/check?id=507f1f77bcf86cd799439011&type=career" \
  -H "Authorization: Bearer your-token-here"
```

**Success Response:** `200 OK`

```json
{
  "success": true,
  "message": "Shortlist status checked successfully",
  "data": {
    "isShortlisted": true
  },
  "statusCode": 200
}
```

**Error Responses:**

- `400 Bad Request` - Missing or invalid query parameters
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Access denied

---

## 5. Delete Shortlist

Remove a specific item from shortlist by shortlist ID.

**Endpoint:** `DELETE /api/v1/shortlist/:id`

**Headers:**

```
Authorization: Bearer <your-token>
```

**Path Parameters:**

- `id` (string, required): The shortlist ID to delete

**Example Request:**

```bash
curl -X DELETE "http://localhost:3000/api/v1/shortlist/507f1f77bcf86cd799439012" \
  -H "Authorization: Bearer your-token-here"
```

**Success Response:** `200 OK`

```json
{
  "success": true,
  "message": "Shortlist item deleted successfully",
  "data": null,
  "statusCode": 200
}
```

**Error Responses:**

- `400 Bad Request` - Invalid shortlist ID
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Access denied
- `404 Not Found` - Shortlist item not found

---

## Type Mappings

| Type Value | Description                 | Model Reference                 |
| ---------- | --------------------------- | ------------------------------- |
| `career`   | Categories (Career options) | Category Model                  |
| `colleges` | Universities/Colleges       | User Model (role: "university") |
| `course`   | Courses                     | Course Model                    |

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request

```json
{
  "success": false,
  "message": "Invalid input data",
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

### 403 Forbidden

```json
{
  "success": false,
  "message": "Access denied",
  "statusCode": 403
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "Shortlist item not found",
  "statusCode": 404
}
```

---

## Testing Examples

### Test All Endpoints with cURL

#### 1. Create/Toggle Shortlist

```bash
# Add a category to shortlist
curl -X POST http://localhost:3000/api/v1/shortlist \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"id": "CATEGORY_ID", "type": "career"}'

# Add a university to shortlist
curl -X POST http://localhost:3000/api/v1/shortlist \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"id": "UNIVERSITY_ID", "type": "colleges"}'

# Add a course to shortlist
curl -X POST http://localhost:3000/api/v1/shortlist \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"id": "COURSE_ID", "type": "course"}'
```

#### 2. Get All Shortlisted Items

```bash
# Get all shortlisted items (paginated)
curl -X GET "http://localhost:3000/api/v1/shortlist?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get only courses
curl -X GET "http://localhost:3000/api/v1/shortlist?type=course&page=1&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get only careers
curl -X GET "http://localhost:3000/api/v1/shortlist?type=career" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get only universities
curl -X GET "http://localhost:3000/api/v1/shortlist?type=colleges&page=1&limit=15" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 3. Get Shortlist by ID

```bash
curl -X GET "http://localhost:3000/api/v1/shortlist/SHORTLIST_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 4. Check if Item is Shortlisted

```bash
# Check category
curl -X GET "http://localhost:3000/api/v1/shortlist/check?id=CATEGORY_ID&type=career" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Check university
curl -X GET "http://localhost:3000/api/v1/shortlist/check?id=UNIVERSITY_ID&type=colleges" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Check course
curl -X GET "http://localhost:3000/api/v1/shortlist/check?id=COURSE_ID&type=course" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 5. Delete Shortlist

```bash
curl -X DELETE "http://localhost:3000/api/v1/shortlist/SHORTLIST_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Notes

1. **Toggle Behavior**: The POST endpoint acts as a toggle. If an item is already shortlisted, it will be removed. If not, it will be added.

2. **Unique Constraint**: Each user can only shortlist a specific item once. The combination of `userId`, `itemId`, and `itemType` is unique.

3. **Item Validation**: Before shortlisting, the system validates that the item exists in the database.

4. **Pagination**:

   - Default page: 1
   - Default limit: 10
   - Maximum limit: 100
   - Page numbers start from 1

5. **Item Population**:

   - Categories are returned as-is
   - Universities have sensitive fields (password, tokens) excluded
   - Courses include populated University and Category information

6. **Authentication**: All endpoints require a valid JWT token in the Authorization header.

---

## Quick Reference

| Method | Endpoint                  | Description                              |
| ------ | ------------------------- | ---------------------------------------- |
| POST   | `/api/v1/shortlist`       | Create/toggle shortlist                  |
| GET    | `/api/v1/shortlist`       | Get all shortlisted items (with filters) |
| GET    | `/api/v1/shortlist/:id`   | Get shortlist by ID                      |
| GET    | `/api/v1/shortlist/check` | Check if item is shortlisted             |
| DELETE | `/api/v1/shortlist/:id`   | Delete shortlist item                    |

---

**Last Updated:** January 2024
