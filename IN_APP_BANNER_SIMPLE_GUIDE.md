# In-App Banner API - Simple Guide

## Overview
Simple and stable CRUD API for managing in-app banners.

**Base URL**: `/api/v1/in-app-banners`

---

## Banner Schema (Simplified)

```typescript
{
  title: string;              // Required, max 200 chars
  description: string;        // Required, max 1000 chars
  imageUrl?: string;          // Optional, banner image URL
  actionUrl?: string;         // Optional, redirect URL on click
  priority: number;           // 0-100, higher = shown first
  isActive: boolean;          // Toggle visibility
  startDate?: Date;           // Optional, schedule start
  endDate?: Date;             // Optional, schedule end
}
```

---

## API Endpoints

### 1. Get Active Banners (Public - No Auth)
Get all currently active banners for display.

**Endpoint**: `GET /api/v1/in-app-banners/active`

```bash
curl -X GET "http://localhost:3000/api/v1/in-app-banners/active"
```

**Response**:
```json
{
  "success": true,
  "message": "Active banners fetched successfully",
  "data": [
    {
      "_id": "64abc123...",
      "title": "Welcome Offer",
      "description": "Get 20% off on your first course",
      "imageUrl": "https://example.com/banner.jpg",
      "actionUrl": "/courses",
      "priority": 90,
      "isActive": true,
      "startDate": "2025-11-01T00:00:00Z",
      "endDate": "2025-12-31T23:59:59Z"
    }
  ]
}
```

---

### 2. Create Banner (Admin - Auth Required)
Create a new banner.

**Endpoint**: `POST /api/v1/in-app-banners`  
**Headers**: 
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "title": "Summer Sale 2025",
  "description": "Get up to 50% off on selected courses",
  "imageUrl": "https://example.com/summer-sale.jpg",
  "actionUrl": "/courses/sale",
  "priority": 90,
  "isActive": true,
  "startDate": "2025-06-01T00:00:00Z",
  "endDate": "2025-08-31T23:59:59Z"
}
```

**Example**:
```bash
curl -X POST "http://localhost:3000/api/v1/in-app-banners" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Summer Sale 2025",
    "description": "Get up to 50% off on selected courses",
    "priority": 90
  }'
```

---

### 3. Get All Banners (Admin - Auth Required)
Get all banners.

**Endpoint**: `GET /api/v1/in-app-banners`

```bash
curl -X GET "http://localhost:3000/api/v1/in-app-banners" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 4. Get Banner by ID (Admin - Auth Required)
Get a specific banner.

**Endpoint**: `GET /api/v1/in-app-banners/:id`

```bash
curl -X GET "http://localhost:3000/api/v1/in-app-banners/64abc123..." \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 5. Update Banner (Admin - Auth Required)
Update an existing banner.

**Endpoint**: `PATCH /api/v1/in-app-banners/:id`

**Request Body** (all fields optional):
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "priority": 95,
  "isActive": false
}
```

**Example**:
```bash
curl -X PATCH "http://localhost:3000/api/v1/in-app-banners/64abc123..." \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "isActive": false
  }'
```

---

### 6. Delete Banner (Admin - Auth Required)
Delete a banner permanently.

**Endpoint**: `DELETE /api/v1/in-app-banners/:id`

```bash
curl -X DELETE "http://localhost:3000/api/v1/in-app-banners/64abc123..." \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Validation Rules

### Create Banner
- `title`: **Required**, 1-200 characters
- `description`: **Required**, 1-1000 characters
- `imageUrl`: Optional, string
- `actionUrl`: Optional, string
- `priority`: Optional, 0-100 (default: 0)
- `isActive`: Optional, boolean (default: true)
- `startDate`: Optional, valid date
- `endDate`: Optional, valid date (must be after startDate)

### Update Banner
All fields are optional, same validation rules apply.

---

## Frontend Integration

### Display Active Banners
```javascript
async function loadBanners() {
  const response = await fetch('/api/v1/in-app-banners/active');
  const { data } = await response.json();
  
  data.forEach(banner => {
    displayBanner(banner);
  });
}

function displayBanner(banner) {
  const bannerHTML = `
    <div class="banner" onclick="handleBannerClick('${banner.actionUrl}')">
      <img src="${banner.imageUrl}" alt="${banner.title}">
      <h3>${banner.title}</h3>
      <p>${banner.description}</p>
    </div>
  `;
  document.getElementById('banner-container').innerHTML += bannerHTML;
}

function handleBannerClick(actionUrl) {
  if (actionUrl) {
    window.location.href = actionUrl;
  }
}
```

---

## Quick Test Script

```bash
#!/bin/bash

# Set your token
TOKEN="your_jwt_token_here"

echo "1. Creating banner..."
curl -X POST "http://localhost:3000/api/v1/in-app-banners" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Banner",
    "description": "This is a test banner",
    "priority": 50
  }'

echo -e "\n\n2. Getting all banners..."
curl -X GET "http://localhost:3000/api/v1/in-app-banners" \
  -H "Authorization: Bearer $TOKEN"

echo -e "\n\n3. Getting active banners (public)..."
curl -X GET "http://localhost:3000/api/v1/in-app-banners/active"
```

---

## Module Structure
```
src/app/modules/in-app-banner/
├── models/inAppBanner.model.ts       # Database schema
├── repositories/inAppBanner.repository.ts  # Database operations
├── services/inAppBanner.service.ts   # Business logic
├── controllers/inAppBanner.controller.ts   # Request handlers
└── routes/inAppBanner.routes.ts      # API routes
```

---

## Features

✅ **Simple CRUD Operations**
- Create, Read, Update, Delete banners

✅ **Smart Scheduling**
- Set start/end dates for automatic display

✅ **Priority Ordering**
- Higher priority banners show first

✅ **Active/Inactive Toggle**
- Easy enable/disable without deletion

✅ **Public API**
- Get active banners without authentication

✅ **Clean Code**
- Simple, stable, and easy to understand

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error",
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

### 404 Not Found
```json
{
  "success": false,
  "message": "Banner not found",
  "statusCode": 404
}
```

---

## Best Practices

1. **Use Priority**: Set higher priority (e.g., 90-100) for important banners
2. **Schedule Campaigns**: Use startDate and endDate for time-limited offers
3. **Test First**: Create banners with `isActive: false`, review, then activate
4. **Image URLs**: Use optimized images for better performance
5. **Action URLs**: Always test action URLs before making banners live

---

## Ready to Use! 🚀

Your simplified in-app banner system is ready. Start by creating your first banner and displaying it on your frontend!

