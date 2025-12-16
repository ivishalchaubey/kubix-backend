# Admin Dashboard API Documentation

> **Complete Analytics and Monitoring System for Kubix Platform**

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
  - [Complete Dashboard](#complete-dashboard)
  - [Overview Statistics](#overview-statistics)
  - [Revenue Analytics](#revenue-analytics)
  - [Recent Activities](#recent-activities)
  - [University Analytics](#university-analytics)
  - [User Demographics](#user-demographics)
  - [Time Trends](#time-trends)
  - [Upcoming Webinars](#upcoming-webinars)
- [Response Structure](#response-structure)
- [Error Handling](#error-handling)
- [Usage Examples](#usage-examples)

---

## Overview

The Admin Dashboard API provides comprehensive analytics and monitoring capabilities for the entire Kubix platform. It aggregates data from all modules including:

- **Users** (Students, Universities, Admins)
- **Webinars** (Hosted by universities)
- **Application Sales** (University admission applications)
- **In-App Banners** (Marketing campaigns)
- **Courses** (Educational content)
- **Career Paths** (Student guidance)

### Key Features

✅ **Real-time Statistics** - Live counts and metrics across all modules  
✅ **Revenue Analytics** - Coin deduction/credit tracking for monetization  
✅ **Activity Feeds** - Recent activities from all modules  
✅ **University Performance** - Top performers by webinars and application sales  
✅ **User Demographics** - Breakdown by stream, board, and status  
✅ **Time Trends** - 30-day trends for growth monitoring  
✅ **Upcoming Events** - Scheduled webinars preview

---

## Authentication

All dashboard endpoints require **admin authentication**. Include the JWT token in the Authorization header.

```bash
Authorization: Bearer <admin_jwt_token>
```

### Required Role

- **Role**: `admin`
- **Permission**: Only users with the `admin` role can access these endpoints

---

## API Endpoints

### Base URL

```
http://localhost:5001/api/v1/admin/dashboard
```

---

## Complete Dashboard

Get all analytics data in a single comprehensive response.

### Endpoint

```
GET /api/v1/admin/dashboard
```

### Description

Fetches all dashboard data including overview, revenue, activities, university analytics, user demographics, time trends, and upcoming webinars in one API call.

### Request

```bash
curl -X GET 'http://localhost:5001/api/v1/admin/dashboard' \
  -H 'Authorization: Bearer <admin_jwt_token>'
```

### Response (200 OK)

```json
{
  "success": true,
  "message": "Dashboard data retrieved successfully",
  "data": {
    "overview": {
      "users": {
        "total": 1250,
        "students": 1200,
        "universities": 48,
        "admins": 2,
        "active": 1180
      },
      "webinars": {
        "total": 85,
        "published": 70,
        "live": 3
      },
      "applicationSales": {
        "total": 42,
        "active": 38
      },
      "banners": {
        "total": 15,
        "active": 8
      },
      "courses": {
        "total": 320
      },
      "careerPaths": {
        "total": 45
      }
    },
    "revenue": {
      "webinars": {
        "totalCoinsDeducted": 425000
      },
      "applicationSales": {
        "totalApplications": 1250,
        "totalCoinsCredited": 3750000
      },
      "netCoins": -3325000
    },
    "recentActivities": {
      "recentWebinars": [...],
      "recentApplicationSales": [...],
      "recentBanners": [...],
      "recentUsers": [...]
    },
    "universityAnalytics": {
      "topUniversitiesByWebinars": [...],
      "topUniversitiesByApplicationSales": [...]
    },
    "userDemographics": {
      "byStream": [...],
      "byBoard": [...],
      "byStatus": [...]
    },
    "timeTrends": {
      "webinars": [...],
      "applicationSales": [...],
      "userRegistrations": [...]
    },
    "upcomingWebinars": [...],
    "timestamp": "2025-11-01T12:00:00.000Z"
  }
}
```

### Use Case

Perfect for the main dashboard page where you need all analytics at once.

---

## Overview Statistics

Get high-level statistics across all modules.

### Endpoint

```
GET /api/v1/admin/dashboard/overview
```

### Description

Returns aggregate counts for users, webinars, application sales, banners, courses, and career paths.

### Request

```bash
curl -X GET 'http://localhost:5001/api/v1/admin/dashboard/overview' \
  -H 'Authorization: Bearer <admin_jwt_token>'
```

### Response (200 OK)

```json
{
  "success": true,
  "message": "Overview statistics retrieved successfully",
  "data": {
    "users": {
      "total": 1250,
      "students": 1200,
      "universities": 48,
      "admins": 2,
      "active": 1180
    },
    "webinars": {
      "total": 85,
      "published": 70,
      "live": 3
    },
    "applicationSales": {
      "total": 42,
      "active": 38
    },
    "banners": {
      "total": 15,
      "active": 8
    },
    "courses": {
      "total": 320
    },
    "careerPaths": {
      "total": 45
    }
  }
}
```

### Metrics Explained

| Metric                    | Description                  |
| ------------------------- | ---------------------------- |
| `users.total`             | Total users across all roles |
| `users.students`          | Total student accounts       |
| `users.universities`      | Total university accounts    |
| `users.admins`            | Total admin accounts         |
| `users.active`            | Users with active status     |
| `webinars.total`          | All webinars (any status)    |
| `webinars.published`      | Published webinars           |
| `webinars.live`           | Currently live webinars      |
| `applicationSales.total`  | All application sales        |
| `applicationSales.active` | Published or active sales    |
| `banners.total`           | All in-app banners           |
| `banners.active`          | Currently active banners     |
| `courses.total`           | Total courses available      |
| `careerPaths.total`       | Total career path categories |

---

## Revenue Analytics

Get detailed revenue and coin transaction analytics.

### Endpoint

```
GET /api/v1/admin/dashboard/revenue
```

### Description

Returns coin deduction from webinars, coin credits from application sales, and net coin balance.

### Request

```bash
curl -X GET 'http://localhost:5001/api/v1/admin/dashboard/revenue' \
  -H 'Authorization: Bearer <admin_jwt_token>'
```

### Response (200 OK)

```json
{
  "success": true,
  "message": "Revenue analytics retrieved successfully",
  "data": {
    "webinars": {
      "totalCoinsDeducted": 425000
    },
    "applicationSales": {
      "totalApplications": 1250,
      "totalCoinsCredited": 3750000
    },
    "netCoins": -3325000
  }
}
```

### Coin Economics

| Module                | Cost per Action          | Total Count        | Total Coins           |
| --------------------- | ------------------------ | ------------------ | --------------------- |
| **Webinar Hosting**   | 5,000 KX per webinar     | 85 published       | 425,000 KX deducted   |
| **Application Sales** | 3,000 KX per application | 1,250 applications | 3,750,000 KX credited |

**Net Coins**: `CoinsDeducted - CoinsCredited = -3,325,000 KX`  
_(Negative means platform earns; positive means platform pays out)_

---

## Recent Activities

Get recent activities from all modules.

### Endpoint

```
GET /api/v1/admin/dashboard/activities
```

### Query Parameters

| Parameter | Type   | Default | Description                            |
| --------- | ------ | ------- | -------------------------------------- |
| `limit`   | number | 10      | Number of items to return per category |

### Description

Returns the most recent activities including webinars, application sales, banners, and user registrations.

### Request

```bash
# Default limit (10 items per category)
curl -X GET 'http://localhost:5001/api/v1/admin/dashboard/activities' \
  -H 'Authorization: Bearer <admin_jwt_token>'

# Custom limit (20 items per category)
curl -X GET 'http://localhost:5001/api/v1/admin/dashboard/activities?limit=20' \
  -H 'Authorization: Bearer <admin_jwt_token>'
```

### Response (200 OK)

```json
{
  "success": true,
  "message": "Recent activities retrieved successfully",
  "data": {
    "recentWebinars": [
      {
        "_id": "6905fb89200de4ecd3665386",
        "universityName": "ABC University",
        "title": "Introduction to AI",
        "status": "published",
        "scheduledDate": "2025-11-18T15:25:00.000Z",
        "createdAt": "2025-11-01T10:30:00.000Z"
      }
    ],
    "recentApplicationSales": [
      {
        "_id": "6905fb89200de4ecd3665387",
        "universityName": "XYZ University",
        "status": "active",
        "applicationCount": 45,
        "createdAt": "2025-11-01T09:15:00.000Z"
      }
    ],
    "recentBanners": [
      {
        "_id": "6905fb89200de4ecd3665388",
        "title": "New Course Launch",
        "isActive": true,
        "priority": 90,
        "createdAt": "2025-11-01T08:00:00.000Z"
      }
    ],
    "recentUsers": [
      {
        "_id": "6905fb89200de4ecd3665389",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "createdAt": "2025-11-01T07:45:00.000Z"
      }
    ]
  }
}
```

### Use Case

Display real-time activity feeds on the dashboard to monitor platform engagement.

---

## University Analytics

Get performance analytics for universities.

### Endpoint

```
GET /api/v1/admin/dashboard/universities
```

### Description

Returns top 10 universities by webinar hosting and application sales performance.

### Request

```bash
curl -X GET 'http://localhost:5001/api/v1/admin/dashboard/universities' \
  -H 'Authorization: Bearer <admin_jwt_token>'
```

### Response (200 OK)

```json
{
  "success": true,
  "message": "University analytics retrieved successfully",
  "data": {
    "topUniversitiesByWebinars": [
      {
        "_id": "68af2b1f0dc8ea8218a7accc",
        "universityName": "ABC University",
        "totalWebinars": 15,
        "publishedWebinars": 12,
        "totalCoinsSpent": 60000
      },
      {
        "_id": "68af2b1f0dc8ea8218a7accd",
        "universityName": "XYZ College",
        "totalWebinars": 12,
        "publishedWebinars": 10,
        "totalCoinsSpent": 50000
      }
    ],
    "topUniversitiesByApplicationSales": [
      {
        "_id": "68af2b1f0dc8ea8218a7accc",
        "universityName": "ABC University",
        "totalApplicationSales": 5,
        "totalApplications": 245,
        "totalCoinsEarned": 735000
      },
      {
        "_id": "68af2b1f0dc8ea8218a7acce",
        "universityName": "DEF Institute",
        "totalApplicationSales": 4,
        "totalApplications": 198,
        "totalCoinsEarned": 594000
      }
    ]
  }
}
```

### Ranking Metrics

**By Webinars**:

- Sorted by `totalWebinars` (descending)
- Shows total, published count, and coins spent

**By Application Sales**:

- Sorted by `totalApplications` (descending)
- Shows total sales, applications, and coins earned

---

## User Demographics

Get detailed user demographic breakdowns.

### Endpoint

```
GET /api/v1/admin/dashboard/demographics
```

### Description

Returns user distribution by educational stream, board, and account status.

### Request

```bash
curl -X GET 'http://localhost:5001/api/v1/admin/dashboard/demographics' \
  -H 'Authorization: Bearer <admin_jwt_token>'
```

### Response (200 OK)

```json
{
  "success": true,
  "message": "User demographics retrieved successfully",
  "data": {
    "byStream": [
      { "_id": "Medical", "count": 320 },
      { "_id": "Non Medical", "count": 450 },
      { "_id": "Commerce", "count": 280 },
      { "_id": "Arts", "count": 120 },
      { "_id": "Other", "count": 30 }
    ],
    "byBoard": [
      { "_id": "CBSE", "count": 650 },
      { "_id": "ICSE", "count": 280 },
      { "_id": "State", "count": 200 },
      { "_id": "IB", "count": 50 },
      { "_id": "Other", "count": 20 }
    ],
    "byStatus": [
      { "_id": "active", "count": 1180 },
      { "_id": "inactive", "count": 20 }
    ]
  }
}
```

### Demographics Breakdown

| Category   | Values                                      |
| ---------- | ------------------------------------------- |
| **Stream** | Medical, Non Medical, Commerce, Arts, Other |
| **Board**  | CBSE, ICSE, State, IB, Other                |
| **Status** | active, inactive                            |

### Use Case

- Target specific student groups with relevant content
- Identify dominant user segments
- Plan content strategy based on user distribution

---

## Time Trends

Get time-based trends for the last 30 days.

### Endpoint

```
GET /api/v1/admin/dashboard/trends
```

### Description

Returns daily trends for webinars, application sales, and user registrations over the last 30 days.

### Request

```bash
curl -X GET 'http://localhost:5001/api/v1/admin/dashboard/trends' \
  -H 'Authorization: Bearer <admin_jwt_token>'
```

### Response (200 OK)

```json
{
  "success": true,
  "message": "Time trends retrieved successfully",
  "data": {
    "webinars": [
      { "_id": "2025-10-02", "count": 3 },
      { "_id": "2025-10-05", "count": 5 },
      { "_id": "2025-10-08", "count": 2 }
    ],
    "applicationSales": [
      { "_id": "2025-10-02", "count": 2, "applications": 45 },
      { "_id": "2025-10-06", "count": 1, "applications": 28 },
      { "_id": "2025-10-10", "count": 3, "applications": 67 }
    ],
    "userRegistrations": [
      { "_id": "2025-10-02", "count": 15 },
      { "_id": "2025-10-03", "count": 22 },
      { "_id": "2025-10-04", "count": 18 }
    ]
  }
}
```

### Data Format

- **Date Format**: `YYYY-MM-DD`
- **Time Range**: Last 30 days from current date
- **Granularity**: Daily aggregation
- **Sorting**: Chronological (oldest to newest)

### Use Case

- Visualize growth trends over time
- Identify peak activity periods
- Monitor platform adoption rates
- Create time-series charts and graphs

---

## Upcoming Webinars

Get scheduled webinars happening soon.

### Endpoint

```
GET /api/v1/admin/dashboard/upcoming-webinars
```

### Query Parameters

| Parameter | Type   | Default | Description                           |
| --------- | ------ | ------- | ------------------------------------- |
| `limit`   | number | 5       | Number of upcoming webinars to return |

### Description

Returns upcoming webinars that are published or live, sorted by scheduled date.

### Request

```bash
# Default limit (5 webinars)
curl -X GET 'http://localhost:5001/api/v1/admin/dashboard/upcoming-webinars' \
  -H 'Authorization: Bearer <admin_jwt_token>'

# Custom limit (10 webinars)
curl -X GET 'http://localhost:5001/api/v1/admin/dashboard/upcoming-webinars?limit=10' \
  -H 'Authorization: Bearer <admin_jwt_token>'
```

### Response (200 OK)

```json
{
  "success": true,
  "message": "Upcoming webinars retrieved successfully",
  "data": [
    {
      "_id": "6905fb89200de4ecd3665386",
      "universityName": "ABC University",
      "title": "Introduction to Machine Learning",
      "scheduledDate": "2025-11-05T10:00:00.000Z",
      "scheduledTime": "10:00 AM",
      "status": "published"
    },
    {
      "_id": "6905fb89200de4ecd3665387",
      "universityName": "XYZ College",
      "title": "Career Opportunities in Data Science",
      "scheduledDate": "2025-11-07T14:00:00.000Z",
      "scheduledTime": "2:00 PM",
      "status": "published"
    }
  ]
}
```

### Filtering Logic

- Only includes webinars with `status: "published"` or `status: "live"`
- Only includes webinars where `scheduledDate >= currentDate`
- Sorted by `scheduledDate` (earliest first)

### Use Case

- Display upcoming events on the dashboard
- Send reminder notifications to admins
- Monitor webinar scheduling

---

## Response Structure

All successful responses follow this structure:

```json
{
  "success": true,
  "message": "Descriptive success message",
  "data": { ... }
}
```

### Response Fields

| Field     | Type    | Description                             |
| --------- | ------- | --------------------------------------- |
| `success` | boolean | Indicates if the request was successful |
| `message` | string  | Human-readable status message           |
| `data`    | object  | The actual response data                |

---

## Error Handling

### Authentication Errors

**401 Unauthorized** - Missing or invalid JWT token

```json
{
  "success": false,
  "message": "Unauthorized: No token provided",
  "statusCode": 401
}
```

### Authorization Errors

**403 Forbidden** - User is not an admin

```json
{
  "success": false,
  "message": "Access denied. Admin privileges required.",
  "statusCode": 403
}
```

### Server Errors

**500 Internal Server Error** - Database or server issues

```json
{
  "success": false,
  "message": "Dashboard service error: <error_details>",
  "statusCode": 500
}
```

---

## Usage Examples

### Example 1: Fetch Complete Dashboard on Page Load

```javascript
// Frontend - React/Vue/Angular
async function loadDashboard() {
  try {
    const response = await fetch(
      "http://localhost:5001/api/v1/admin/dashboard",
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );

    const result = await response.json();

    if (result.success) {
      const { overview, revenue, recentActivities, universityAnalytics } =
        result.data;

      // Update UI components
      updateOverviewCards(overview);
      updateRevenueCharts(revenue);
      updateActivityFeed(recentActivities);
      updateUniversityRankings(universityAnalytics);
    }
  } catch (error) {
    console.error("Dashboard load failed:", error);
  }
}
```

### Example 2: Fetch Only Revenue Analytics

```javascript
// Lightweight call for revenue widget
async function updateRevenueWidget() {
  try {
    const response = await fetch(
      "http://localhost:5001/api/v1/admin/dashboard/revenue",
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );

    const result = await response.json();

    if (result.success) {
      displayRevenueStats(result.data);
    }
  } catch (error) {
    console.error("Revenue fetch failed:", error);
  }
}
```

### Example 3: Auto-Refresh Recent Activities

```javascript
// Poll for new activities every 30 seconds
setInterval(async () => {
  try {
    const response = await fetch(
      "http://localhost:5001/api/v1/admin/dashboard/activities?limit=20",
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );

    const result = await response.json();

    if (result.success) {
      updateActivityFeed(result.data);
    }
  } catch (error) {
    console.error("Activity refresh failed:", error);
  }
}, 30000); // 30 seconds
```

### Example 4: Visualize Time Trends with Chart.js

```javascript
// Create line chart from trends data
async function renderTrendsChart() {
  try {
    const response = await fetch(
      "http://localhost:5001/api/v1/admin/dashboard/trends",
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );

    const result = await response.json();

    if (result.success) {
      const { webinars, applicationSales, userRegistrations } = result.data;

      const chart = new Chart(ctx, {
        type: "line",
        data: {
          labels: webinars.map((d) => d._id),
          datasets: [
            {
              label: "Webinars",
              data: webinars.map((d) => d.count),
              borderColor: "blue",
            },
            {
              label: "Application Sales",
              data: applicationSales.map((d) => d.count),
              borderColor: "green",
            },
            {
              label: "User Registrations",
              data: userRegistrations.map((d) => d.count),
              borderColor: "orange",
            },
          ],
        },
      });
    }
  } catch (error) {
    console.error("Chart render failed:", error);
  }
}
```

---

## Performance Considerations

### Optimization Tips

1. **Use Specific Endpoints**: Instead of calling the complete dashboard endpoint, use specific endpoints like `/overview`, `/revenue`, etc., to fetch only what you need.

2. **Implement Caching**: Cache dashboard data on the frontend for 1-5 minutes to reduce API calls.

3. **Lazy Loading**: Load different sections of the dashboard progressively instead of all at once.

4. **Pagination**: Use the `limit` query parameter for activities and upcoming webinars to control response size.

### Response Time Estimates

| Endpoint             | Typical Response Time | Data Volume |
| -------------------- | --------------------- | ----------- |
| `/` (Complete)       | 800-1200ms            | Large       |
| `/overview`          | 150-300ms             | Medium      |
| `/revenue`           | 200-400ms             | Small       |
| `/activities`        | 100-250ms             | Medium      |
| `/universities`      | 150-300ms             | Small       |
| `/demographics`      | 100-200ms             | Small       |
| `/trends`            | 300-500ms             | Medium      |
| `/upcoming-webinars` | 80-150ms              | Small       |

---

## Integration Checklist

- [ ] Admin authentication token configured
- [ ] Base URL configured for environment (dev/staging/prod)
- [ ] Error handling implemented for all API calls
- [ ] Loading states added to UI components
- [ ] Data refresh intervals configured (if auto-refresh needed)
- [ ] Chart libraries integrated (if visualizing trends)
- [ ] Mobile responsive design for dashboard
- [ ] Export functionality added (if needed for reports)

---

## Support

For issues or questions about the Admin Dashboard API:

- **API Issues**: Check server logs for detailed error messages
- **Performance Issues**: Monitor database query performance and add indexes if needed
- **Feature Requests**: Contact the development team

---

**Last Updated**: November 1, 2025  
**Version**: 1.0.0  
**API Base URL**: `http://localhost:5001/api/v1/admin/dashboard`
