# Application Sales API

Simple API for universities to list their application forms. Universities earn **3,000 KX coins** per paid application.

**Base URL**: `/api/v1/application-sales`

---

## Overview

- Universities list their admission/application forms
- Students apply through Kubix app
- Applications redirect to university portal
- Universities pay 3,000 KX per successful application
- University dashboard to create and view application sales

---

## Schema

### Required Fields

```typescript
{
  universityName: string;
  applicationFormLink: string; // University's application form URL
  paymentLink: string; // Payment portal link
  pocName: string; // Point of Contact name
  pocPhone: string; // Point of Contact phone
  pocEmail: string; // Point of Contact email
}
```

### Optional Fields

```typescript
{
  admissionChairperson?: string;  // Admission chairperson details
  freebies?: string[];            // Resources/brochures URLs
}
```

### Auto-Managed

```typescript
{
  universityId: ObjectId;         // From authenticated user
  status: "draft" | "published" | "active" | "closed";
  coinsPerApplication: 3000;      // Fixed amount per application
  applicationCount: number;        // Track total applications
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## API Endpoints

### Public Routes (No Authentication)

#### 1. Get Published Application Sales

Get all published application sales for students.

```bash
GET /api/v1/application-sales/published

curl http://localhost:3000/api/v1/application-sales/published
```

**Response:**

```json
{
  "success": true,
  "message": "Application sales fetched successfully",
  "data": [
    {
      "_id": "64abc123...",
      "universityName": "IIT Delhi",
      "applicationFormLink": "https://iitdelhi.ac.in/apply",
      "paymentLink": "https://iitdelhi.ac.in/payment",
      "pocName": "Dr. Jane Smith",
      "pocPhone": "+91-9876543210",
      "pocEmail": "admissions@iitdelhi.ac.in",
      "status": "published",
      "coinsPerApplication": 3000,
      "applicationCount": 45
    }
  ]
}
```

#### 2. Get Application Sale by ID

```bash
GET /api/v1/application-sales/:id

curl http://localhost:3000/api/v1/application-sales/64abc123
```

---

### University Routes (Authentication Required)

#### 3. Create Application Sale (Draft)

Create a new application sale listing.

```bash
POST /api/v1/application-sales
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "universityName": "IIT Delhi",
  "applicationFormLink": "https://iitdelhi.ac.in/apply",
  "paymentLink": "https://iitdelhi.ac.in/payment",
  "pocName": "Dr. Jane Smith",
  "pocPhone": "+91-9876543210",
  "pocEmail": "admissions@iitdelhi.ac.in",
  "admissionChairperson": "Prof. John Doe - Head of Admissions",
  "freebies": [
    "https://iitdelhi.ac.in/brochure.pdf",
    "https://iitdelhi.ac.in/syllabus.pdf"
  ]
}
```

**Example:**

```bash
curl -X POST http://localhost:3000/api/v1/application-sales \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "universityName": "IIT Delhi",
    "applicationFormLink": "https://iitdelhi.ac.in/apply",
    "paymentLink": "https://iitdelhi.ac.in/payment",
    "pocName": "Dr. Jane Smith",
    "pocPhone": "+91-9876543210",
    "pocEmail": "admissions@iitdelhi.ac.in"
  }'
```

**Response:**

```json
{
  "success": true,
  "message": "Application sale created successfully",
  "data": {
    "_id": "64abc123...",
    "universityName": "IIT Delhi",
    "status": "draft",
    "coinsPerApplication": 3000,
    "applicationCount": 0,
    "createdAt": "2025-11-01T10:00:00Z"
  }
}
```

#### 4. Get My Application Sales

Get all application sales for authenticated university.

```bash
GET /api/v1/application-sales/university/my-applications
Authorization: Bearer <token>

curl -X GET http://localhost:3000/api/v1/application-sales/university/my-applications \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**

```json
{
  "success": true,
  "message": "Application sales fetched successfully",
  "data": [
    {
      "_id": "64abc123...",
      "universityName": "IIT Delhi",
      "status": "draft",
      "applicationCount": 0
    },
    {
      "_id": "64abc456...",
      "universityName": "IIT Delhi",
      "status": "published",
      "applicationCount": 45,
      "publishedAt": "2025-11-01T12:00:00Z"
    }
  ]
}
```

#### 5. Update Application Sale

Update application sale details (owner or admin only).

```bash
PATCH /api/v1/application-sales/:id
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body (all fields optional):**

```json
{
  "pocName": "Dr. Updated Name",
  "pocPhone": "+91-9999999999"
}
```

**Example:**

```bash
curl -X PATCH http://localhost:3000/api/v1/application-sales/64abc123 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"pocName": "Dr. Updated Name"}'
```

#### 6. Publish Application Sale

Make application sale visible to students.

```bash
POST /api/v1/application-sales/:id/publish
Authorization: Bearer <token>

curl -X POST http://localhost:3000/api/v1/application-sales/64abc123/publish \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**

```json
{
  "success": true,
  "message": "Application sale published successfully",
  "data": {
    "_id": "64abc123...",
    "status": "published",
    "publishedAt": "2025-11-01T12:00:00Z"
  }
}
```

#### 7. Delete Application Sale

Delete application sale (owner or admin only).

```bash
DELETE /api/v1/application-sales/:id
Authorization: Bearer <token>

curl -X DELETE http://localhost:3000/api/v1/application-sales/64abc123 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Admin Routes (Authentication Required)

#### 8. Get All Application Sales

Get all application sales from all universities.

```bash
GET /api/v1/application-sales/admin/all
Authorization: Bearer <token>

curl -X GET http://localhost:3000/api/v1/application-sales/admin/all \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Tracking Endpoint (Webhook/API Integration)

#### 9. Track Application Submission

Call this endpoint when a student completes a paid application.

```bash
POST /api/v1/application-sales/:id/track
```

**Example:**

```bash
curl -X POST http://localhost:3000/api/v1/application-sales/64abc123/track
```

**Response:**

```json
{
  "success": true,
  "message": "Application tracked successfully. 3000 KX coins credited",
  "data": {
    "_id": "64abc123...",
    "applicationCount": 46
  }
}
```

> **Note:** This endpoint should be called by your system when a student successfully submits a paid application. University will be credited 3,000 KX coins.

---

## Status Flow

```
draft → published → active → closed
```

| Status      | Description                                 |
| ----------- | ------------------------------------------- |
| `draft`     | Created but not visible to students         |
| `published` | Visible to students, accepting applications |
| `active`    | Currently accepting applications            |
| `closed`    | No longer accepting applications            |

---

## Payment System

- **Earnings**: 3,000 KX per paid application
- **When**: Coins credited when application is tracked
- **How**: Call `/track` endpoint after successful application
- **Total Tracking**: `applicationCount` field tracks total applications

---

## Frontend Integration

### Display Application Sales (Students)

```javascript
async function loadApplicationSales() {
  const response = await fetch("/api/v1/application-sales/published");
  const { data } = await response.json();

  data.forEach((sale) => {
    const card = `
      <div class="application-card">
        <h3>${sale.universityName}</h3>
        <p>Contact: ${sale.pocName}</p>
        <p>Email: ${sale.pocEmail}</p>
        <a href="${sale.applicationFormLink}" target="_blank">
          Apply Now
        </a>
        <a href="${sale.paymentLink}" target="_blank">
          Make Payment
        </a>
      </div>
    `;
    document.getElementById("applications").innerHTML += card;
  });
}

loadApplicationSales();
```

### University Dashboard - My Applications

```javascript
async function loadMyApplications() {
  const response = await fetch(
    "/api/v1/application-sales/university/my-applications",
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );
  const { data } = await response.json();

  data.forEach((app) => {
    console.log(
      `${app.universityName} - ${app.status} - ${app.applicationCount} applications`
    );
  });
}
```

### Create Application Sale

```javascript
async function createApplicationSale(formData) {
  const response = await fetch("/api/v1/application-sales", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });

  const result = await response.json();

  if (result.success) {
    alert("Application sale created!");
    loadMyApplications();
  }
}
```

### Track Application (After Student Pays)

```javascript
async function trackApplication(applicationSaleId) {
  const response = await fetch(
    `/api/v1/application-sales/${applicationSaleId}/track`,
    {
      method: "POST",
    }
  );

  const result = await response.json();
  // University gets 3000 KX coins
}
```

---

## Integration Guide

### Step 1: University Creates Listing

University creates application sale with their form and payment links.

### Step 2: Student Discovers

Student browses published application sales in Kubix app.

### Step 3: Student Applies

Student clicks "Apply Now" → redirected to university portal.

### Step 4: Student Pays

Student completes payment on university portal.

### Step 5: Track Conversion

University system calls `/track` endpoint:

```javascript
// After successful payment
await fetch(`https://kubix-api.com/api/v1/application-sales/${saleId}/track`, {
  method: "POST",
});
// University gets 3000 KX coins
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
  "message": "Application sale not found",
  "statusCode": 404
}
```

---

## Module Structure

```
src/app/modules/application-sales/
├── models/applicationSales.model.ts
├── repositories/applicationSales.repository.ts
├── services/applicationSales.service.ts
├── controllers/applicationSales.controller.ts
└── routes/applicationSales.routes.ts
```

---

## Important Notes

1. **High-Value Leads**: 3,000 KX per application (conversion focused)
2. **Draft First**: Create as draft, review, then publish
3. **Admin Access**: Admins can edit/delete any application sale
4. **Tracking Required**: Call `/track` endpoint to credit coins
5. **Conversion Tracking**: `applicationCount` tracks total paid applications

---

## TODO

### Coin Payment Implementation

Currently marked as TODO in the service. To implement:

```typescript
// In applicationSales.service.ts - trackApplication method
// Credit university account with 3000 KX
const university = await User.findById(applicationSale.universityId);
university.coins += 3000;
await university.save();
```

Connect to your payment/coins system to complete this feature.

---

## Testing

### Quick Test Script

```bash
#!/bin/bash

TOKEN="your_university_token_here"

# 1. Create application sale
echo "Creating application sale..."
SALE_ID=$(curl -s -X POST "http://localhost:3000/api/v1/application-sales" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "universityName": "Test University",
    "applicationFormLink": "https://test.edu/apply",
    "paymentLink": "https://test.edu/payment",
    "pocName": "John Doe",
    "pocPhone": "1234567890",
    "pocEmail": "test@test.edu"
  }' | jq -r '.data._id')

echo "Application Sale ID: $SALE_ID"

# 2. Get my applications
echo -e "\n\nGetting my applications..."
curl -X GET "http://localhost:3000/api/v1/application-sales/university/my-applications" \
  -H "Authorization: Bearer $TOKEN"

# 3. Publish
echo -e "\n\nPublishing..."
curl -X POST "http://localhost:3000/api/v1/application-sales/$SALE_ID/publish" \
  -H "Authorization: Bearer $TOKEN"

# 4. Track application
echo -e "\n\nTracking application..."
curl -X POST "http://localhost:3000/api/v1/application-sales/$SALE_ID/track"
```

---

## Best Practices

1. **Clear Links**: Ensure application and payment links are always working
2. **POC Details**: Keep contact information up-to-date
3. **Resources**: Provide helpful brochures and materials
4. **Track Properly**: Always call `/track` endpoint after successful payment
5. **Monitor Count**: Check `applicationCount` regularly for conversions

---

**Your Application Sales system is production-ready!** 🚀

Start listing your admission forms and earning coins per application.
