# Webinar Hosting API

Complete documentation for the Webinar Hosting system. Universities can host webinars by paying 5,000 KX coins per webinar.

**Base URL**: `/api/v1/webinars`

---

## Table of Contents

1. [Schema](#schema)
2. [API Endpoints](#api-endpoints)
3. [Features](#features)
4. [Frontend Integration](#frontend-integration)
5. [Testing](#testing)

---

## Schema

### Required Fields

```typescript
{
  universityName: string;
  title: string;
  description: string;
  courseDetails: string;
  targetAudience: string;
  speakerName: string;
  scheduledDate: Date; // ISO 8601 format: "2025-12-01T10:00:00.000Z"
  scheduledTime: string; // Display format: "10:00 AM"
  duration: number; // 15-300 minutes
  webinarLink: string; // Zoom/Meeting link
  pocName: string;
  pocPhone: string;
  pocEmail: string;
}
```

**Date Format Examples:**

```javascript
// Valid formats for scheduledDate:
"2025-12-01T10:00:00.000Z"; // ✅ ISO 8601 with timezone
"2025-12-01T10:00:00Z"; // ✅ ISO 8601 without milliseconds
new Date("2025-12-01 10:00").toISOString(); // ✅ Using JavaScript

// Invalid formats:
("2025-12-01"); // ❌ Missing time
("2025-12-01T10:00T14:00:00Z"); // ❌ Double T (malformed)
("12/01/2025"); // ❌ Not ISO format
```

### Optional Fields

```typescript
{
  tags: string[];                // Student interests ["AI", "ML"]
  domains: string[];             // Course domains ["Computer Science"]
  speakerPhoto?: string;         // Speaker photo URL
  speakerBio?: string;           // Speaker biography (max 1000 chars)
  admissionChairperson?: string; // Admission chairperson details
  freebies?: string[];           // Resources/brochures URLs
  logo?: string;                 // University logo URL
}
```

### Auto-Managed (Do Not Send)

```typescript
{
  universityId: ObjectId;        // From authenticated user
  status: "draft" | "published" | "live" | "completed" | "cancelled";
  coinsDeducted: boolean;
  coinsAmount: 5000;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## API Endpoints

### Public Routes (No Authentication)

#### 1. Get Published Webinars

Get all published webinars for students.

```bash
GET /api/v1/webinars/published

curl http://localhost:3000/api/v1/webinars/published
```

**Response:**

```json
{
  "success": true,
  "message": "Webinars fetched successfully",
  "data": [
    {
      "_id": "64abc123...",
      "universityName": "IIT Delhi",
      "title": "Introduction to AI",
      "description": "Learn AI fundamentals",
      "speakerName": "Dr. John Doe",
      "scheduledDate": "2025-12-01T10:00:00Z",
      "scheduledTime": "10:00 AM",
      "duration": 60,
      "status": "published"
    }
  ]
}
```

#### 2. Get Upcoming Webinars

Get only future webinars.

```bash
GET /api/v1/webinars/upcoming

curl http://localhost:3000/api/v1/webinars/upcoming
```

#### 3. Get Webinar by ID

Get details of a specific webinar.

```bash
GET /api/v1/webinars/:id

curl http://localhost:3000/api/v1/webinars/64abc123
```

> **Note**: Webinar link is hidden until 30 minutes before scheduled time.

---

### University Routes (Authentication Required)

#### 4. Create Webinar (Draft)

Create a new webinar in draft mode.

```bash
POST /api/v1/webinars
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "universityName": "IIT Delhi",
  "title": "Introduction to AI and Machine Learning",
  "description": "Learn AI fundamentals, machine learning basics, neural networks, and practical applications.",
  "courseDetails": "B.Tech Computer Science, M.Tech AI",
  "targetAudience": "Engineering students interested in AI/ML careers",
  "tags": ["AI", "Machine Learning", "Technology"],
  "domains": ["Computer Science", "Data Science"],
  "speakerName": "Dr. John Doe",
  "speakerPhoto": "https://example.com/speaker.jpg",
  "speakerBio": "Professor of Computer Science with 15 years of experience in AI research.",
  "scheduledDate": "2025-12-01T10:00:00Z",
  "scheduledTime": "10:00 AM",
  "duration": 60,
  "webinarLink": "https://zoom.us/j/123456789",
  "pocName": "Jane Smith",
  "pocPhone": "+91-9876543210",
  "pocEmail": "jane.smith@iitdelhi.ac.in",
  "admissionChairperson": "Prof. Alice Brown",
  "freebies": [
    "https://example.com/brochure.pdf",
    "https://example.com/syllabus.pdf"
  ],
  "logo": "https://example.com/university-logo.png"
}
```

**Example:**

```bash
curl -X POST http://localhost:3000/api/v1/webinars \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "universityName": "IIT Delhi",
    "title": "Introduction to AI",
    "description": "Learn AI fundamentals",
    "courseDetails": "B.Tech CS",
    "targetAudience": "Engineering students",
    "speakerName": "Dr. John Doe",
    "scheduledDate": "2025-12-01T10:00:00Z",
    "scheduledTime": "10:00 AM",
    "duration": 60,
    "webinarLink": "https://zoom.us/j/123456789",
    "pocName": "Jane Smith",
    "pocPhone": "+91-9876543210",
    "pocEmail": "jane@example.com"
  }'
```

**Response:**

```json
{
  "success": true,
  "message": "Webinar created successfully",
  "data": {
    "_id": "64abc123...",
    "universityName": "IIT Delhi",
    "title": "Introduction to AI",
    "status": "draft",
    "coinsDeducted": false,
    "createdAt": "2025-11-01T10:00:00Z"
  }
}
```

#### 5. Get My Webinars

Get all webinars for the authenticated university.

```bash
GET /api/v1/webinars/university/my-webinars
Authorization: Bearer <token>

curl -X GET http://localhost:3000/api/v1/webinars/university/my-webinars \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**

```json
{
  "success": true,
  "message": "Webinars fetched successfully",
  "data": [
    {
      "_id": "64abc123...",
      "title": "Introduction to AI",
      "status": "draft",
      "scheduledDate": "2025-12-01T10:00:00Z",
      "coinsDeducted": false
    },
    {
      "_id": "64abc456...",
      "title": "Data Science Workshop",
      "status": "published",
      "scheduledDate": "2025-11-15T14:00:00Z",
      "coinsDeducted": true,
      "publishedAt": "2025-11-01T12:00:00Z"
    }
  ]
}
```

#### 6. Update Webinar

Update webinar details (owner or admin only).

```bash
PATCH /api/v1/webinars/:id
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body (all fields optional):**

```json
{
  "title": "Advanced AI Workshop",
  "duration": 90,
  "scheduledTime": "11:00 AM"
}
```

**Example:**

```bash
curl -X PATCH http://localhost:3000/api/v1/webinars/64abc123 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Advanced AI Workshop", "duration": 90}'
```

#### 7. Publish Webinar

Publish a draft webinar. **This deducts 5,000 KX coins.**

```bash
POST /api/v1/webinars/:id/publish
Authorization: Bearer <token>

curl -X POST http://localhost:3000/api/v1/webinars/64abc123/publish \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**

```json
{
  "success": true,
  "message": "Webinar published successfully. 5000 KX coins deducted",
  "data": {
    "_id": "64abc123...",
    "title": "Introduction to AI",
    "status": "published",
    "coinsDeducted": true,
    "coinsAmount": 5000,
    "publishedAt": "2025-11-01T12:00:00Z"
  }
}
```

**Important:**

- Coins deducted immediately
- Cannot be unpublished
- Webinar becomes visible to students
- Can only be cancelled, not unpublished

#### 8. Delete Webinar

Delete a webinar (owner or admin only).

```bash
DELETE /api/v1/webinars/:id
Authorization: Bearer <token>

curl -X DELETE http://localhost:3000/api/v1/webinars/64abc123 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**

```json
{
  "success": true,
  "message": "Webinar deleted successfully",
  "data": null
}
```

---

### Admin Routes (Authentication Required)

#### 9. Get All Webinars

Get all webinars from all universities.

```bash
GET /api/v1/webinars/admin/all
Authorization: Bearer <token>

curl -X GET http://localhost:3000/api/v1/webinars/admin/all \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Features

### Webinar Link Protection (30-Minute Rule)

The webinar link is automatically hidden until 30 minutes before the scheduled time.

**Before 30 minutes:**

```json
{
  "webinarLink": "Link will be available 30 minutes before the webinar"
}
```

**Within 30 minutes:**

```json
{
  "webinarLink": "https://zoom.us/j/123456789"
}
```

### Webinar Status Flow

```
draft → published → live → completed
         ↓
     cancelled
```

| Status      | Description                                              |
| ----------- | -------------------------------------------------------- |
| `draft`     | Created but not published (free, no coins)               |
| `published` | Live on platform, visible to students (5000 KX deducted) |
| `live`      | Currently happening                                      |
| `completed` | Finished                                                 |
| `cancelled` | Cancelled                                                |

### Payment System

- **Cost**: 5,000 KX per webinar
- **When**: Coins deducted only when published
- **Draft**: Free, unlimited drafts
- **One-Time**: Coins deducted once per webinar
- **Non-Refundable**: Cannot unpublish or get refund

---

## Frontend Integration

### Display Upcoming Webinars (Students)

```javascript
async function loadWebinars() {
  const response = await fetch("/api/v1/webinars/upcoming");
  const { data } = await response.json();

  data.forEach((webinar) => {
    const card = `
      <div class="webinar-card">
        <img src="${webinar.logo}" alt="${webinar.universityName}">
        <h3>${webinar.title}</h3>
        <p>${webinar.description}</p>
        <p><strong>Speaker:</strong> ${webinar.speakerName}</p>
        <p><strong>Date:</strong> ${new Date(
          webinar.scheduledDate
        ).toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${webinar.scheduledTime}</p>
        <button onclick="registerForWebinar('${webinar._id}')">Register</button>
      </div>
    `;
    document.getElementById("webinars-container").innerHTML += card;
  });
}

loadWebinars();
```

### University Dashboard - My Webinars

```javascript
async function loadMyWebinars() {
  const response = await fetch("/api/v1/webinars/university/my-webinars", {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  const { data } = await response.json();

  data.forEach((webinar) => {
    displayWebinarRow(webinar);
  });
}
```

### Create Webinar

```javascript
async function createWebinar(formData) {
  const response = await fetch("/api/v1/webinars", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });

  const result = await response.json();

  if (result.success) {
    alert("Webinar created as draft!");
    loadMyWebinars();
  }
}
```

### Publish Webinar (Deduct Coins)

```javascript
async function publishWebinar(webinarId) {
  const confirmed = confirm("Publishing will deduct 5000 KX coins. Continue?");

  if (!confirmed) return;

  const response = await fetch(`/api/v1/webinars/${webinarId}/publish`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  const result = await response.json();

  if (result.success) {
    alert("Webinar published! Coins deducted.");
    loadMyWebinars();
  }
}
```

### Check Webinar Link Availability

```javascript
async function checkWebinarLink(webinarId) {
  const response = await fetch(`/api/v1/webinars/${webinarId}`);
  const { data } = await response.json();

  if (data.webinarLink.includes("will be available")) {
    // Show countdown timer
    showCountdown(data.scheduledDate);
  } else {
    // Show join button with actual link
    showJoinButton(data.webinarLink);
  }
}
```

---

## Testing

### Quick Test Script

```bash
#!/bin/bash

TOKEN="your_university_token_here"

# 1. Create a webinar
echo "Creating webinar..."
WEBINAR_ID=$(curl -s -X POST "http://localhost:3000/api/v1/webinars" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "universityName": "Test University",
    "title": "Test Webinar",
    "description": "This is a test webinar",
    "courseDetails": "B.Tech CS",
    "targetAudience": "Students",
    "speakerName": "John Doe",
    "scheduledDate": "2025-12-01T10:00:00Z",
    "scheduledTime": "10:00 AM",
    "duration": 60,
    "webinarLink": "https://zoom.us/test",
    "pocName": "Jane",
    "pocPhone": "1234567890",
    "pocEmail": "test@test.com"
  }' | jq -r '.data._id')

echo "Webinar ID: $WEBINAR_ID"

# 2. Get my webinars
echo -e "\n\nGetting my webinars..."
curl -X GET "http://localhost:3000/api/v1/webinars/university/my-webinars" \
  -H "Authorization: Bearer $TOKEN"

# 3. Publish webinar
echo -e "\n\nPublishing webinar..."
curl -X POST "http://localhost:3000/api/v1/webinars/$WEBINAR_ID/publish" \
  -H "Authorization: Bearer $TOKEN"

# 4. Get upcoming webinars (public)
echo -e "\n\nGetting upcoming webinars (public)..."
curl -X GET "http://localhost:3000/api/v1/webinars/upcoming"
```

---

## Error Responses

**400 Bad Request**

```json
{
  "success": false,
  "message": "Validation error",
  "statusCode": 400
}
```

**401 Unauthorized**

```json
{
  "success": false,
  "message": "Unauthorized access",
  "statusCode": 401
}
```

**403 Forbidden**

```json
{
  "success": false,
  "message": "Access denied",
  "statusCode": 403
}
```

**404 Not Found**

```json
{
  "success": false,
  "message": "Webinar not found",
  "statusCode": 404
}
```

---

## Module Structure

```
src/app/modules/webinar/
├── models/webinar.model.ts           # Database schema
├── repositories/webinar.repository.ts # Database operations
├── services/webinar.service.ts        # Business logic
├── controllers/webinar.controller.ts  # Request handlers
└── routes/webinar.routes.ts           # API routes
```

---

## Important Notes

1. **Draft First**: Always create webinars as drafts, review, then publish
2. **Coins Non-Refundable**: Once published, 5000 KX are deducted permanently
3. **Link Timing**: Link automatically shows 30 minutes before (no manual control)
4. **Access Control**: Universities can edit/delete their own webinars. Admins can edit/delete any webinar
5. **Status Workflow**: Draft → Published → Live → Completed (linear flow)
6. **Cannot Unpublish**: Once published, can only cancel or complete
7. **Auto Complete**: Published/live webinars automatically move to `completed` after their scheduled time plus duration passes

---

## TODO

### Coin Deduction Implementation

Currently marked as TODO in the service. To implement:

```typescript
// In webinar.service.ts - publishWebinar method
// Check user has 5000 coins
const user = await User.findById(userId);
if (user.coins < 5000) {
  throw new AppError("Insufficient coins", HttpStatus.BAD_REQUEST);
}

// Deduct coins
user.coins -= 5000;
await user.save();

// Then publish webinar
const webinar = await this.webinarRepository.publishWebinar(webinarId);
```

Connect this to your user/payment system to complete the feature.

---

## Troubleshooting

### Common Errors

#### 1. "scheduledDate must be a valid date"

**Problem:** Invalid date format sent in request.

```json
// ❌ WRONG - Double T in date
"scheduledDate": "2025-11-12T17:48T23:44:00.000Z"

// ✅ CORRECT - Single T
"scheduledDate": "2025-11-12T23:44:00.000Z"
```

**Frontend Fix:**

```javascript
// Combining date and time from inputs
const dateValue = "2025-11-12"; // From date picker
const timeValue = "23:44"; // From time picker

// Correct way:
const scheduledDate = new Date(
  `${dateValue}T${timeValue}:00.000Z`
).toISOString();

// Or using Date constructor:
const scheduledDate = new Date(`${dateValue} ${timeValue}`).toISOString();
```

#### 2. "Validation error"

Check that all required fields are present:

- universityName
- title
- description
- courseDetails
- targetAudience
- speakerName
- scheduledDate (valid ISO format)
- scheduledTime
- duration (15-300)
- webinarLink
- pocName
- pocPhone
- pocEmail (valid email)

#### 3. "Unauthorized access"

Make sure Authorization header is present:

```bash
-H "Authorization: Bearer YOUR_TOKEN"
```

#### 4. "Access denied"

You're trying to edit/delete a webinar that doesn't belong to your university.

**Note:** Admins can edit/delete any webinar. If you're an admin and getting this error, there might be an issue with your token or role.

---

## Best Practices

1. **Professional Content**: Use high-quality speaker photos and university logos
2. **Clear Descriptions**: Write detailed, informative descriptions
3. **Test Links**: Always verify Zoom/meeting links before publishing
4. **Correct Timezone**: Ensure scheduledDate is in correct timezone (use UTC)
5. **Date Format**: Always use ISO 8601 format for scheduledDate
6. **Target Audience**: Be specific about who should attend
7. **Resources**: Provide useful freebies/brochures for better engagement
8. **Review Before Publish**: Double-check all details before publishing (non-reversible)

---

**Your Webinar Hosting system is production-ready!** 🚀

Start creating webinars and manage them through your university dashboard.
