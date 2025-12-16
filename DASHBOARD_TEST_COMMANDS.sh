#!/bin/bash

# Admin Dashboard API - Test Commands
# Replace YOUR_ADMIN_TOKEN with your actual admin JWT token

# Set your admin token here
ADMIN_TOKEN="YOUR_ADMIN_TOKEN"
BASE_URL="http://localhost:5001/api/v1/admin/dashboard"

echo "================================================"
echo "Admin Dashboard API - Test Commands"
echo "================================================"
echo ""

# Test 1: Complete Dashboard
echo "1. Testing Complete Dashboard..."
curl -X GET "$BASE_URL" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" | jq '.'
echo ""
echo "------------------------------------------------"
echo ""

# Test 2: Overview Statistics
echo "2. Testing Overview Statistics..."
curl -X GET "$BASE_URL/overview" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" | jq '.'
echo ""
echo "------------------------------------------------"
echo ""

# Test 3: Revenue Analytics
echo "3. Testing Revenue Analytics..."
curl -X GET "$BASE_URL/revenue" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" | jq '.'
echo ""
echo "------------------------------------------------"
echo ""

# Test 4: Recent Activities (10 items)
echo "4. Testing Recent Activities (limit=10)..."
curl -X GET "$BASE_URL/activities?limit=10" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" | jq '.'
echo ""
echo "------------------------------------------------"
echo ""

# Test 5: University Analytics
echo "5. Testing University Analytics..."
curl -X GET "$BASE_URL/universities" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" | jq '.'
echo ""
echo "------------------------------------------------"
echo ""

# Test 6: User Demographics
echo "6. Testing User Demographics..."
curl -X GET "$BASE_URL/demographics" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" | jq '.'
echo ""
echo "------------------------------------------------"
echo ""

# Test 7: Time Trends (30 days)
echo "7. Testing Time Trends..."
curl -X GET "$BASE_URL/trends" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" | jq '.'
echo ""
echo "------------------------------------------------"
echo ""

# Test 8: Upcoming Webinars (5 items)
echo "8. Testing Upcoming Webinars (limit=5)..."
curl -X GET "$BASE_URL/upcoming-webinars?limit=5" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" | jq '.'
echo ""
echo "------------------------------------------------"
echo ""

echo "================================================"
echo "All tests completed!"
echo "================================================"

