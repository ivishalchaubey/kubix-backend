# Application Form API Documentation

Complete API documentation for the Application Form module. All endpoints require authentication via Bearer token.

**Base URL:** `/api/v1/application-form`

**Authentication:** All endpoints require `Authorization: Bearer <token>` header

---

## 📋 Table of Contents

1. [Create/Apply Application Form](#1-createapply-application-form)
2. [Edit Application Form](#2-edit-application-form)
3. [Get Application by College ID](#3-get-application-by-college-id)
4. [Get All User Applications](#4-get-all-user-applications)
5. [Get All College Applications](#5-get-all-college-applications)
6. [Delete Application](#6-delete-application)
7. [Request/Response Examples](#requestresponse-examples)
8. [Field Requirements](#field-requirements)
9. [Error Responses](#error-responses)

---

## 1. Create/Apply Application Form

Create a new application form or automatically update if one already exists for the college.

**Endpoint:** `POST /api/v1/application-form`

**Headers:**

```
Authorization: Bearer <your-token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "collegeId": "68e16c2bd2459cddccbba8cd",
  "firstName": "Vishal",
  "middleName": "Kumar",
  "lastName": "Chaubey",
  "dateOfBirth": "1989-11-29",
  "email": "vishal@yopmail.com",
  "phoneCountryCode": "+91",
  "phoneNumber": "+919519922769",
  "permanentAddress": "Gorakhpur (UP)",
  "tenthPercentage": "84",
  "tenthMarksheet": "https://kubixfiles3.s3.ap-south-1.amazonaws.com/shard1-4R2BRR55WwvABV5WXupcQxzFvnMbuNkJVVUGYGoGjsw2.pdf",
  "twelfthStatus": "passed",
  "twelfthPercentage": "83",
  "twelfthSchoolName": "Saraswati Institute",
  "twelfthMarksheet": "https://kubixfiles3.s3.ap-south-1.amazonaws.com/shard1-4R2BRR55WwvABV5WXupcQxzFvnMbuNkJVVUGYGoGjsw2.pdf",
  "passingYear": "2020",
  "guardianName": "Sudhakar Chaubey",
  "guardianOccupation": "Shopkeeper",
  "guardianPhoneCountryCode": "+91",
  "guardianPhoneNumber": "+919794756567"
}
```

**Request Body Parameters:**

### Required Fields

- `collegeId` (string, required): The ID of the college/university
- `firstName` (string, required): First name of the applicant
- `lastName` (string, required): Last name of the applicant
- `dateOfBirth` (string, required): Date of birth in YYYY-MM-DD format
- `phoneCountryCode` (string, required): Phone country code (e.g., "+91")
- `phoneNumber` (string, required): Phone number
- `email` (string, required): Valid email address
- `tenthPercentage` (string, required): 10th grade percentage
- `tenthMarksheet` (string, required): URL to 10th marksheet document
- `guardianName` (string, required): Guardian's full name
- `guardianPhoneCountryCode` (string, required): Guardian's phone country code
- `guardianPhoneNumber` (string, required): Guardian's phone number

### Optional Fields

- `middleName` (string, optional): Middle name
- `permanentAddress` (string, optional): Permanent address
- `twelfthStatus` (string, optional): Status of 12th grade ("passed", "failed", "pending")
- `twelfthPercentage` (string, required if twelfthStatus provided): 12th grade percentage
- `twelfthSchoolName` (string, required if twelfthStatus provided): 12th grade school name
- `twelfthMarksheet` (string, required if twelfthStatus provided): URL to 12th marksheet document
- `passingYear` (string, required if twelfthStatus provided): Year of passing (4-digit year)
- `guardianOccupation` (string, optional): Guardian's occupation

**Example Request:**

```bash
curl -X POST http://localhost:3000/api/v1/application-form \
  -H "Authorization: Bearer your-token-here" \
  -H "Content-Type: application/json" \
  -d '{
    "collegeId": "68e16c2bd2459cddccbba8cd",
    "firstName": "Vishal",
    "lastName": "Chaubey",
    "dateOfBirth": "1989-11-29",
    "email": "vishal@yopmail.com",
    "phoneCountryCode": "+91",
    "phoneNumber": "+919519922769",
    "tenthPercentage": "84",
    "tenthMarksheet": "https://example.com/marksheet.pdf",
    "guardianName": "Sudhakar Chaubey",
    "guardianPhoneCountryCode": "+91",
    "guardianPhoneNumber": "+919794756567"
  }'
```

**Success Response:** `200 OK`

```json
{
  "success": true,
  "message": "Application form created/updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "collegeId": {
      "_id": "68e16c2bd2459cddccbba8cd",
      "collegeName": "ABC University",
      "email": "contact@abcuniversity.edu"
    },
    "firstName": "Vishal",
    "middleName": "Kumar",
    "lastName": "Chaubey",
    "dateOfBirth": "1989-11-29",
    "email": "vishal@yopmail.com",
    "phoneCountryCode": "+91",
    "phoneNumber": "+919519922769",
    "permanentAddress": "Gorakhpur (UP)",
    "tenthPercentage": "84",
    "tenthMarksheet": "https://kubixfiles3.s3.ap-south-1.amazonaws.com/...",
    "twelfthStatus": "passed",
    "twelfthPercentage": "83",
    "twelfthSchoolName": "Saraswati Institute",
    "twelfthMarksheet": "https://kubixfiles3.s3.ap-south-1.amazonaws.com/...",
    "passingYear": "2020",
    "guardianName": "Sudhakar Chaubey",
    "guardianOccupation": "Shopkeeper",
    "guardianPhoneCountryCode": "+91",
    "guardianPhoneNumber": "+919794756567",
    "status": "draft",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "statusCode": 200
}
```

**Error Responses:**

- `400 Bad Request` - Missing required fields or invalid data
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Access denied
- `404 Not Found` - College not found

---

## 2. Edit Application Form

Update an existing application form. Uses the same endpoint as create but with PUT method.

**Endpoint:** `PUT /api/v1/application-form`

**Headers:**

```
Authorization: Bearer <your-token>
Content-Type: application/json
```

**Request Body:** Same as Create/Apply endpoint

**Note:** This endpoint automatically detects if an application already exists for the user and college combination. If it exists, it updates; otherwise, it creates a new one.

**Example Request:**

```bash
curl -X PUT http://localhost:3000/api/v1/application-form \
  -H "Authorization: Bearer your-token-here" \
  -H "Content-Type: application/json" \
  -d '{
    "collegeId": "68e16c2bd2459cddccbba8cd",
    "firstName": "Vishal",
    "lastName": "Chaubey",
    "dateOfBirth": "1989-11-29",
    "email": "vishal.updated@yopmail.com",
    "phoneCountryCode": "+91",
    "phoneNumber": "+919519922769",
    "tenthPercentage": "85",
    "tenthMarksheet": "https://example.com/updated-marksheet.pdf",
    "guardianName": "Sudhakar Chaubey",
    "guardianPhoneCountryCode": "+91",
    "guardianPhoneNumber": "+919794756567"
  }'
```

**Success Response:** `200 OK` (Same format as Create)

---

## 3. Get Application by College ID

Retrieve a specific application form for the logged-in user by college ID.

**Endpoint:** `GET /api/v1/application-form/college/:collegeId`

**Headers:**

```
Authorization: Bearer <your-token>
```

**Path Parameters:**

- `collegeId` (string, required): The ID of the college

**Example Request:**

```bash
curl -X GET "http://localhost:3000/api/v1/application-form/college/68e16c2bd2459cddccbba8cd" \
  -H "Authorization: Bearer your-token-here"
```

**Success Response:** `200 OK`

```json
{
  "success": true,
  "message": "Application form fetched successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": {
      "_id": "507f1f77bcf86cd799439012",
      "firstName": "Vishal",
      "lastName": "Chaubey",
      "email": "vishal@yopmail.com"
    },
    "collegeId": {
      "_id": "68e16c2bd2459cddccbba8cd",
      "collegeName": "ABC University",
      "email": "contact@abcuniversity.edu"
    },
    "firstName": "Vishal",
    "middleName": "Kumar",
    "lastName": "Chaubey",
    "dateOfBirth": "1989-11-29",
    "email": "vishal@yopmail.com",
    "phoneCountryCode": "+91",
    "phoneNumber": "+919519922769",
    "permanentAddress": "Gorakhpur (UP)",
    "tenthPercentage": "84",
    "tenthMarksheet": "https://kubixfiles3.s3.ap-south-1.amazonaws.com/...",
    "twelfthStatus": "passed",
    "twelfthPercentage": "83",
    "twelfthSchoolName": "Saraswati Institute",
    "twelfthMarksheet": "https://kubixfiles3.s3.ap-south-1.amazonaws.com/...",
    "passingYear": "2020",
    "guardianName": "Sudhakar Chaubey",
    "guardianOccupation": "Shopkeeper",
    "guardianPhoneCountryCode": "+91",
    "guardianPhoneNumber": "+919794756567",
    "status": "draft",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "statusCode": 200
}
```

**Error Responses:**

- `400 Bad Request` - Invalid college ID
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Access denied
- `404 Not Found` - Application form not found

---

## 4. Get All User Applications

Retrieve all application forms submitted by the logged-in user across all colleges.

**Endpoint:** `GET /api/v1/application-form`

**Headers:**

```
Authorization: Bearer <your-token>
```

**Example Request:**

```bash
curl -X GET "http://localhost:3000/api/v1/application-form" \
  -H "Authorization: Bearer your-token-here"
```

**Success Response:** `200 OK`

```json
{
  "success": true,
  "message": "Applications fetched successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "collegeId": {
        "_id": "68e16c2bd2459cddccbba8cd",
        "collegeName": "ABC University"
      },
      "firstName": "Vishal",
      "lastName": "Chaubey",
      "status": "draft",
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "collegeId": {
        "_id": "68e16c2bd2459cddccbba8cd",
        "collegeName": "XYZ College"
      },
      "firstName": "Vishal",
      "lastName": "Chaubey",
      "status": "submitted",
      "createdAt": "2024-01-14T09:20:00.000Z"
    }
  ],
  "statusCode": 200
}
```

**Error Responses:**

- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Access denied

---

## 5. Get All College Applications

Retrieve all application forms submitted to a specific college. Useful for universities to view all applications.

**Endpoint:** `GET /api/v1/application-form/college/:collegeId/all`

**Headers:**

```
Authorization: Bearer <your-token>
```

**Path Parameters:**

- `collegeId` (string, required): The ID of the college

**Example Request:**

```bash
curl -X GET "http://localhost:3000/api/v1/application-form/college/68e16c2bd2459cddccbba8cd/all" \
  -H "Authorization: Bearer your-token-here"
```

**Success Response:** `200 OK`

```json
{
  "success": true,
  "message": "Applications fetched successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "userId": {
        "_id": "507f1f77bcf86cd799439012",
        "firstName": "Vishal",
        "lastName": "Chaubey",
        "email": "vishal@yopmail.com"
      },
      "collegeId": {
        "_id": "68e16c2bd2459cddccbba8cd",
        "collegeName": "ABC University"
      },
      "firstName": "Vishal",
      "lastName": "Chaubey",
      "status": "draft",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "statusCode": 200
}
```

**Error Responses:**

- `400 Bad Request` - Invalid college ID
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Access denied

---

## 6. Delete Application

Delete an application form for the logged-in user by college ID.

**Endpoint:** `DELETE /api/v1/application-form/college/:collegeId`

**Headers:**

```
Authorization: Bearer <your-token>
```

**Path Parameters:**

- `collegeId` (string, required): The ID of the college

**Example Request:**

```bash
curl -X DELETE "http://localhost:3000/api/v1/application-form/college/68e16c2bd2459cddccbba8cd" \
  -H "Authorization: Bearer your-token-here"
```

**Success Response:** `200 OK`

```json
{
  "success": true,
  "message": "Application form deleted successfully",
  "data": null,
  "statusCode": 200
}
```

**Error Responses:**

- `400 Bad Request` - Invalid college ID
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Access denied
- `404 Not Found` - Application form not found

---

## Request/Response Examples

### Complete Example Payload

```json
{
  "collegeId": "68e16c2bd2459cddccbba8cd",
  "firstName": "Vishal",
  "middleName": "Kumar",
  "lastName": "Chaubey",
  "dateOfBirth": "1989-11-29",
  "email": "vishal@yopmail.com",
  "phoneCountryCode": "+91",
  "phoneNumber": "+919519922769",
  "permanentAddress": "Gorakhpur (UP)",
  "tenthPercentage": "84",
  "tenthMarksheet": "https://kubixfiles3.s3.ap-south-1.amazonaws.com/shard1-4R2BRR55WwvABV5WXupcQxzFvnMbuNkJVVUGYGoGjsw2.pdf",
  "twelfthStatus": "passed",
  "twelfthPercentage": "83",
  "twelfthSchoolName": "Saraswati Institute",
  "twelfthMarksheet": "https://kubixfiles3.s3.ap-south-1.amazonaws.com/shard1-4R2BRR55WwvABV5WXupcQxzFvnMbuNkJVVUGYGoGjsw2.pdf",
  "passingYear": "2020",
  "guardianName": "Sudhakar Chaubey",
  "guardianOccupation": "Shopkeeper",
  "guardianPhoneCountryCode": "+91",
  "guardianPhoneNumber": "+919794756567"
}
```

### Minimal Required Payload (Without 12th Grade)

```json
{
  "collegeId": "68e16c2bd2459cddccbba8cd",
  "firstName": "Vishal",
  "lastName": "Chaubey",
  "dateOfBirth": "1989-11-29",
  "email": "vishal@yopmail.com",
  "phoneCountryCode": "+91",
  "phoneNumber": "+919519922769",
  "tenthPercentage": "84",
  "tenthMarksheet": "https://example.com/marksheet.pdf",
  "guardianName": "Sudhakar Chaubey",
  "guardianPhoneCountryCode": "+91",
  "guardianPhoneNumber": "+919794756567"
}
```

---

## Field Requirements

### Required Fields

All of these fields must be provided:

1. **collegeId** - Valid college/university ID (must exist and have role "university")
2. **firstName** - Applicant's first name
3. **lastName** - Applicant's last name
4. **dateOfBirth** - Date of birth in YYYY-MM-DD format
5. **email** - Valid email address format
6. **phoneCountryCode** - Phone country code (e.g., "+91")
7. **phoneNumber** - Phone number
8. **tenthPercentage** - 10th grade percentage as string
9. **tenthMarksheet** - URL to 10th marksheet document
10. **guardianName** - Guardian's full name
11. **guardianPhoneCountryCode** - Guardian's phone country code
12. **guardianPhoneNumber** - Guardian's phone number

### Conditional Required Fields

If `twelfthStatus` is provided, the following fields become required:

1. **twelfthPercentage** - 12th grade percentage
2. **twelfthSchoolName** - Name of the 12th grade school
3. **passingYear** - Year of passing (4-digit year, e.g., "2020")
4. **twelfthMarksheet** - URL to 12th marksheet document

### Optional Fields

- **middleName** - Middle name (if applicable)
- **permanentAddress** - Permanent address
- **guardianOccupation** - Guardian's occupation
- **twelfthStatus** - Status of 12th grade ("passed", "failed", "pending")

### Field Validations

- **dateOfBirth**: Must be in YYYY-MM-DD format
- **email**: Must be a valid email address format
- **passingYear**: Must be a 4-digit year (e.g., "2020")
- **twelfthStatus**: Must be one of: "passed", "failed", "pending" (if provided)
- **firstName, lastName**: Maximum 50 characters
- **middleName**: Maximum 50 characters
- **permanentAddress**: Maximum 500 characters
- **guardianName**: Maximum 100 characters
- **guardianOccupation**: Maximum 100 characters
- **twelfthSchoolName**: Maximum 200 characters

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request

```json
{
  "success": false,
  "message": "Missing required fields: firstName, lastName",
  "statusCode": 400
}
```

```json
{
  "success": false,
  "message": "If twelfthStatus is provided, twelfthPercentage, twelfthSchoolName, passingYear, and twelfthMarksheet are required",
  "statusCode": 400
}
```

```json
{
  "success": false,
  "message": "Invalid email format",
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
  "message": "College not found",
  "statusCode": 404
}
```

```json
{
  "success": false,
  "message": "Application form not found",
  "statusCode": 404
}
```

---

## Testing Examples

### Test All Endpoints with cURL

#### 1. Create Application Form

```bash
curl -X POST http://localhost:3000/api/v1/application-form \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "collegeId": "68e16c2bd2459cddccbba8cd",
    "firstName": "Vishal",
    "lastName": "Chaubey",
    "dateOfBirth": "1989-11-29",
    "email": "vishal@yopmail.com",
    "phoneCountryCode": "+91",
    "phoneNumber": "+919519922769",
    "tenthPercentage": "84",
    "tenthMarksheet": "https://example.com/marksheet.pdf",
    "guardianName": "Sudhakar Chaubey",
    "guardianPhoneCountryCode": "+91",
    "guardianPhoneNumber": "+919794756567"
  }'
```

#### 2. Update Application Form

```bash
curl -X PUT http://localhost:3000/api/v1/application-form \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "collegeId": "68e16c2bd2459cddccbba8cd",
    "firstName": "Vishal",
    "lastName": "Chaubey Updated",
    "dateOfBirth": "1989-11-29",
    "email": "vishal.updated@yopmail.com",
    "phoneCountryCode": "+91",
    "phoneNumber": "+919519922769",
    "tenthPercentage": "85",
    "tenthMarksheet": "https://example.com/updated-marksheet.pdf",
    "guardianName": "Sudhakar Chaubey",
    "guardianPhoneCountryCode": "+91",
    "guardianPhoneNumber": "+919794756567"
  }'
```

#### 3. Get Application by College ID

```bash
curl -X GET "http://localhost:3000/api/v1/application-form/college/68e16c2bd2459cddccbba8cd" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 4. Get All User Applications

```bash
curl -X GET "http://localhost:3000/api/v1/application-form" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 5. Get All College Applications (University View)

```bash
curl -X GET "http://localhost:3000/api/v1/application-form/college/68e16c2bd2459cddccbba8cd/all" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 6. Delete Application

```bash
curl -X DELETE "http://localhost:3000/api/v1/application-form/college/68e16c2bd2459cddccbba8cd" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Notes

1. **Unique Constraint**: Each user can only have one application form per college. Creating a new application for the same college will update the existing one.

2. **College Validation**: The system validates that the `collegeId` exists and belongs to a user with role "university".

3. **Auto Create/Update**: The POST and PUT endpoints use the same handler, which automatically detects if an application exists and updates it, or creates a new one if it doesn't exist.

4. **Status Field**: Application status can be:
   - `draft` - Default status when created
   - `submitted` - When application is submitted
   - `under_review` - When college is reviewing
   - `accepted` - When application is accepted
   - `rejected` - When application is rejected

5. **Data Population**: Responses include populated college and user information (excluding sensitive fields like passwords).

6. **Authentication**: All endpoints require a valid JWT token in the Authorization header.

7. **Conditional Validation**: If `twelfthStatus` is provided, all twelfth-grade related fields become required. If `twelfthStatus` is not provided, those fields are optional.

---

## Quick Reference

| Method | Endpoint                                    | Description                              |
| ------ | ------------------------------------------- | ---------------------------------------- |
| POST   | `/api/v1/application-form`                  | Create/apply application form            |
| PUT    | `/api/v1/application-form`                  | Edit/update application form             |
| GET    | `/api/v1/application-form`                  | Get all applications for logged-in user  |
| GET    | `/api/v1/application-form/college/:collegeId` | Get application by college ID            |
| GET    | `/api/v1/application-form/college/:collegeId/all` | Get all applications for a college (university view) |
| DELETE | `/api/v1/application-form/college/:collegeId` | Delete application                       |

---

**Last Updated:** January 2024

