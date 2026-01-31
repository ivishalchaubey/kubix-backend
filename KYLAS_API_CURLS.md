# Kylas CRM API - cURL Reference

> **Base URL:** `https://api.kylas.io/v1`
> **Authentication:** API Key via `api-key` header

---

## Table of Contents

1. [Create Lead](#1-create-lead)
2. [Find Lead by Email](#2-find-lead-by-email)
3. [Find Lead by ID](#3-find-lead-by-id)
4. [Update Lead (PATCH)](#4-update-lead-patch)
5. [Add Note to Lead](#5-add-note-to-lead)
6. [Application Endpoints (Internal API)](#6-application-endpoints-internal-api)

---

## 1. Create Lead

Creates a new lead in Kylas CRM.

**Endpoint:** `POST /leads/`

### Full Payload (with all fields)

```bash
curl -X POST 'https://api.kylas.io/v1/leads/' \
  -H 'Content-Type: application/json' \
  -H 'api-key: YOUR_KYLAS_API_KEY' \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "emails": [
      {
        "type": "PERSONAL",
        "value": "john.doe@example.com",
        "primary": true
      }
    ],
    "phoneNumbers": [
      {
        "type": "MOBILE",
        "code": "IN",
        "value": "9876543210",
        "dialCode": "+91",
        "primary": true
      }
    ],
    "city": "Mumbai",
    "state": "Maharashtra",
    "country": "IN",
    "requirementName": "Student Counselling",
    "customFieldValues": {
      "cf_board": "CBSE",
      "cf_stream": "Medical",
      "cf_grade": "12th",
      "cf_platform": "web"
    }
  }'
```

### Minimal Payload (name + email only)

```bash
curl -X POST 'https://api.kylas.io/v1/leads/' \
  -H 'Content-Type: application/json' \
  -H 'api-key: YOUR_KYLAS_API_KEY' \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "emails": [
      {
        "type": "PERSONAL",
        "value": "john.doe@example.com",
        "primary": true
      }
    ]
  }'
```

### Without Custom Fields (fallback payload)

```bash
curl -X POST 'https://api.kylas.io/v1/leads/' \
  -H 'Content-Type: application/json' \
  -H 'api-key: YOUR_KYLAS_API_KEY' \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "emails": [
      {
        "type": "PERSONAL",
        "value": "john.doe@example.com",
        "primary": true
      }
    ],
    "phoneNumbers": [
      {
        "type": "MOBILE",
        "code": "IN",
        "value": "9876543210",
        "dialCode": "+91",
        "primary": true
      }
    ],
    "city": "Mumbai",
    "state": "Maharashtra",
    "country": "IN",
    "requirementName": "Student Counselling"
  }'
```

### Response (Success - 200/201)

```json
{
  "id": 12345,
  "firstName": "John",
  "lastName": "Doe",
  "emails": [
    {
      "type": "PERSONAL",
      "value": "john.doe@example.com",
      "primary": true
    }
  ],
  "phoneNumbers": [
    {
      "type": "MOBILE",
      "code": "IN",
      "value": "9876543210",
      "dialCode": "+91",
      "primary": true
    }
  ],
  "customFieldValues": {
    "cf_board": "CBSE",
    "cf_stream": "Medical",
    "cf_grade": "12th",
    "cf_platform": "web"
  }
}
```

---

## 2. Find Lead by Email

Searches for a lead using email address.

**Endpoint:** `POST /search/lead`

```bash
curl -X POST 'https://api.kylas.io/v1/search/lead' \
  -H 'Content-Type: application/json' \
  -H 'api-key: YOUR_KYLAS_API_KEY' \
  -d '{
    "fields": ["id", "firstName", "lastName", "emails", "phoneNumbers"],
    "jsonRule": {
      "rules": [
        {
          "id": "emails",
          "field": "emails",
          "type": "string",
          "input": "text",
          "operator": "contains",
          "value": "john.doe@example.com"
        }
      ],
      "condition": "AND",
      "valid": true
    },
    "limit": 5
  }'
```

### Response (Success - 200)

```json
{
  "totalCount": 1,
  "records": [
    {
      "id": 12345,
      "firstName": "John",
      "lastName": "Doe",
      "emails": [
        {
          "type": "PERSONAL",
          "value": "john.doe@example.com",
          "primary": true
        }
      ],
      "phoneNumbers": [
        {
          "type": "MOBILE",
          "code": "IN",
          "value": "9876543210",
          "dialCode": "+91",
          "primary": true
        }
      ]
    }
  ]
}
```

### Response (No Results)

```json
{
  "totalCount": 0,
  "records": []
}
```

---

## 3. Find Lead by ID

Fetches a single lead by its Kylas ID.

**Endpoint:** `GET /leads/{leadId}`

```bash
curl -X GET 'https://api.kylas.io/v1/leads/12345' \
  -H 'Content-Type: application/json' \
  -H 'api-key: YOUR_KYLAS_API_KEY'
```

### Response (Success - 200)

```json
{
  "id": 12345,
  "firstName": "John",
  "lastName": "Doe",
  "emails": [
    {
      "type": "PERSONAL",
      "value": "john.doe@example.com",
      "primary": true
    }
  ],
  "phoneNumbers": [
    {
      "type": "MOBILE",
      "code": "IN",
      "value": "9876543210",
      "dialCode": "+91",
      "primary": true
    }
  ],
  "customFieldValues": {
    "cf_board": "CBSE",
    "cf_stream": "Medical",
    "cf_grade": "12th",
    "cf_platform": "web"
  }
}
```

---

## 4. Update Lead (PATCH)

Updates a lead's custom fields using JSON Patch operations. Used for tracking activities like career selection, course shortlisting, etc.

**Endpoint:** `PATCH /leads/{leadId}`

### Update Career Field

```bash
curl -X PATCH 'https://api.kylas.io/v1/leads/12345' \
  -H 'Content-Type: application/json-patch+json' \
  -H 'api-key: YOUR_KYLAS_API_KEY' \
  -d '[
    {
      "op": "add",
      "path": "/customFieldValues/cf_career_field",
      "value": "Engineering"
    }
  ]'
```

### Update Shortlisted Careers

```bash
curl -X PATCH 'https://api.kylas.io/v1/leads/12345' \
  -H 'Content-Type: application/json-patch+json' \
  -H 'api-key: YOUR_KYLAS_API_KEY' \
  -d '[
    {
      "op": "add",
      "path": "/customFieldValues/cf_shortlisted_careers",
      "value": "Software Engineer, Data Scientist"
    }
  ]'
```

### Update Shortlisted Courses

```bash
curl -X PATCH 'https://api.kylas.io/v1/leads/12345' \
  -H 'Content-Type: application/json-patch+json' \
  -H 'api-key: YOUR_KYLAS_API_KEY' \
  -d '[
    {
      "op": "add",
      "path": "/customFieldValues/cf_shortlisted_courses",
      "value": "B.Tech Computer Science, BCA"
    }
  ]'
```

### Update Applied Courses

```bash
curl -X PATCH 'https://api.kylas.io/v1/leads/12345' \
  -H 'Content-Type: application/json-patch+json' \
  -H 'api-key: YOUR_KYLAS_API_KEY' \
  -d '[
    {
      "op": "add",
      "path": "/customFieldValues/cf_applied_courses",
      "value": "B.Tech CS at IIT Delhi, BCA at Christ University"
    }
  ]'
```

### Update Shortlisted Colleges

```bash
curl -X PATCH 'https://api.kylas.io/v1/leads/12345' \
  -H 'Content-Type: application/json-patch+json' \
  -H 'api-key: YOUR_KYLAS_API_KEY' \
  -d '[
    {
      "op": "add",
      "path": "/customFieldValues/cf_shortlisted_colleges",
      "value": "IIT Delhi, Christ University, VIT Vellore"
    }
  ]'
```

### Update Platform

```bash
curl -X PATCH 'https://api.kylas.io/v1/leads/12345' \
  -H 'Content-Type: application/json-patch+json' \
  -H 'api-key: YOUR_KYLAS_API_KEY' \
  -d '[
    {
      "op": "add",
      "path": "/customFieldValues/cf_platform",
      "value": "mobile"
    }
  ]'
```

### Update Multiple Fields at Once

```bash
curl -X PATCH 'https://api.kylas.io/v1/leads/12345' \
  -H 'Content-Type: application/json-patch+json' \
  -H 'api-key: YOUR_KYLAS_API_KEY' \
  -d '[
    {
      "op": "add",
      "path": "/customFieldValues/cf_shortlisted_courses",
      "value": "B.Tech CS, BCA"
    },
    {
      "op": "add",
      "path": "/customFieldValues/cf_platform",
      "value": "web"
    }
  ]'
```

---

## 5. Add Note to Lead

Adds a note/comment to an existing lead.

**Endpoint:** `POST /notes/relation`

### Basic Note

```bash
curl -X POST 'https://api.kylas.io/v1/notes/relation' \
  -H 'Content-Type: application/json' \
  -H 'api-key: YOUR_KYLAS_API_KEY' \
  -d '{
    "targetEntityId": 12345,
    "targetEntityType": "LEAD",
    "sourceEntity": {
      "description": "This is a custom note for the lead."
    }
  }'
```

### Registration Welcome Note

```bash
curl -X POST 'https://api.kylas.io/v1/notes/relation' \
  -H 'Content-Type: application/json' \
  -H 'api-key: YOUR_KYLAS_API_KEY' \
  -d '{
    "targetEntityId": 12345,
    "targetEntityType": "LEAD",
    "sourceEntity": {
      "description": "New User Registered\n\n- Date: 30 Jan, 2026, 10:30\n- Email: john.doe@example.com\n- Board: CBSE\n- Stream: Medical\n- Platform: web"
    }
  }'
```

### Activity Fallback Note (when custom field does not exist)

```bash
curl -X POST 'https://api.kylas.io/v1/notes/relation' \
  -H 'Content-Type: application/json' \
  -H 'api-key: YOUR_KYLAS_API_KEY' \
  -d '{
    "targetEntityId": 12345,
    "targetEntityType": "LEAD",
    "sourceEntity": {
      "description": "Shortlisted Courses\n\n- B.Tech Computer Science\n- BCA\n- Platform: web"
    }
  }'
```

### Account Deletion Note

```bash
curl -X POST 'https://api.kylas.io/v1/notes/relation' \
  -H 'Content-Type: application/json' \
  -H 'api-key: YOUR_KYLAS_API_KEY' \
  -d '{
    "targetEntityId": 12345,
    "targetEntityType": "LEAD",
    "sourceEntity": {
      "description": "Account Deleted\n\n- Date: 30 Jan, 2026, 10:30\n- User: John Doe\n- Email: john.doe@example.com"
    }
  }'
```

---

## 6. Application Endpoints (Internal API)

These are your backend API endpoints that **trigger** the Kylas operations above internally.

### 6.1 Register User (triggers Lead Creation)

```bash
curl -X POST 'http://localhost:3000/api/auth/register' \
  -H 'Content-Type: application/json' \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "password": "SecurePass123!",
    "role": "user",
    "phoneNumber": "9876543210",
    "countryCode": "+91",
    "board": "CBSE",
    "stream": "Medical",
    "grade": "12th",
    "city": "Mumbai",
    "state": "Maharashtra"
  }'
```

> **Kylas Side Effect:** Creates a lead in Kylas + adds a "New User Registered" note.

---

### 6.2 Update Profile / Select Career Field (triggers Activity Tracking)

```bash
curl -X PATCH 'http://localhost:3000/api/auth/profile' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'platform: web' \
  -d '{
    "categoryIds": ["category_id_1", "category_id_2"]
  }'
```

> **Kylas Side Effect:** Updates `cf_career_field` on the lead or adds a note as fallback.

---

### 6.3 Shortlist Career / Course / College (triggers Activity Tracking)

```bash
curl -X POST 'http://localhost:3000/api/shortlist' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'platform: web' \
  -d '{
    "itemId": "ITEM_OBJECT_ID",
    "itemType": "career"
  }'
```

**Supported `itemType` values:**

| itemType   | Kylas Custom Field         | Activity Type           |
|------------|----------------------------|-------------------------|
| `career`   | `cf_shortlisted_careers`   | `CAREER_SHORTLISTED`    |
| `course`   | `cf_shortlisted_courses`   | `COURSE_SHORTLISTED`    |
| `colleges` | `cf_shortlisted_colleges`  | `COLLEGE_SHORTLISTED`   |

> **Kylas Side Effect:** Updates the corresponding custom field on the lead or adds a note as fallback.

---

### 6.4 Submit Application Form (triggers Course Applied)

```bash
curl -X POST 'http://localhost:3000/api/application-form' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'platform: web' \
  -d '{
    "collegeIds": ["college_id_1", "college_id_2"],
    "firstName": "John",
    "lastName": "Doe",
    "dateOfBirth": "2005-05-15",
    "phoneNumber": "9876543210",
    "email": "john.doe@example.com",
    "tenthPercentage": "85",
    "tenthMarksheet": "https://example.com/marksheet.pdf",
    "guardianName": "Parent Name",
    "guardianPhoneNumber": "9876543211"
  }'
```

> **Kylas Side Effect:** Updates `cf_applied_courses` on the lead with the college names.

---

## Custom Fields Reference

These custom fields must exist in Kylas CRM dashboard for PATCH operations to work. If a field does not exist, the system falls back to adding a note.

| Field Name                | Purpose                     | Updated By                |
|---------------------------|-----------------------------|---------------------------|
| `cf_career_field`         | Career field selection       | Profile update            |
| `cf_shortlisted_careers`  | Shortlisted careers          | Shortlist (career)        |
| `cf_shortlisted_courses`  | Shortlisted courses          | Shortlist (course)        |
| `cf_applied_courses`      | Applied courses              | Application form submit   |
| `cf_shortlisted_colleges` | Shortlisted colleges         | Shortlist (colleges)      |
| `cf_board`                | Educational board            | Registration              |
| `cf_stream`               | Educational stream           | Registration              |
| `cf_grade`                | Current grade/year           | Registration              |
| `cf_platform`             | Application platform         | All activities            |

---

## Error Handling

| HTTP Status | Meaning                  | Retry? | App Behavior                        |
|-------------|--------------------------|--------|-------------------------------------|
| `200/201`   | Success                  | No     | Proceed normally                    |
| `400`       | Validation error         | No     | Retry with reduced payload          |
| `429`       | Rate limited             | Yes    | Exponential backoff (1s, 2s, 3s)    |
| `401/403`   | Unauthorized             | No     | Log error, skip operation           |
| `500`       | Server error             | Yes    | Up to 3 retries                     |

---

## Environment Setup

```env
KYLAS_API_KEY=your_kylas_api_key_here
KYLAS_BASE_URL=https://api.kylas.io/v1
```

> If `KYLAS_API_KEY` is not set, the entire Kylas integration is disabled silently. All operations become no-ops.
